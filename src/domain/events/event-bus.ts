import { createAdminClient } from '@/lib/supabase/admin';
import type { EventConsumer, PublishEventInput } from './event.types';

class EventBus {
  private consumers: EventConsumer[] = [];

  register(consumer: EventConsumer): void {
    this.consumers.push(consumer);
  }

  async publish(input: PublishEventInput): Promise<string> {
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from('domain_events')
      .select('id')
      .eq('tenant_id', input.tenantId)
      .eq('idempotency_key', input.idempotencyKey)
      .single();

    if (existing) {
      return existing.id;
    }

    const { data: event, error } = await supabase
      .from('domain_events')
      .insert({
        tenant_id: input.tenantId,
        event_type: input.eventType,
        event_version: 'v1',
        aggregate_id: input.aggregateId,
        aggregate_type: input.aggregateType,
        payload: input.payload,
        idempotency_key: input.idempotencyKey,
      })
      .select('id')
      .single();

    if (error || !event) {
      throw new Error(`Failed to publish event: ${error?.message}`);
    }

    await this.dispatch(event.id, input);
    return event.id;
  }

  private async dispatch(eventId: string, input: PublishEventInput): Promise<void> {
    const matching = this.consumers.filter((c) =>
      c.eventTypes.includes(input.eventType)
    );

    const supabase = createAdminClient();

    for (const consumer of matching) {
      const { data: event } = await supabase
        .from('domain_events')
        .select('processed_by')
        .eq('id', eventId)
        .single();

      if (event?.processed_by.includes(consumer.name)) {
        continue;
      }

      await consumer.handle({
        id: eventId,
        tenantId: input.tenantId,
        eventType: input.eventType,
        payload: input.payload,
      });

      await supabase
        .from('domain_events')
        .update({
          processed_by: [...(event?.processed_by ?? []), consumer.name],
        })
        .eq('id', eventId);
    }
  }
}

export const eventBus = new EventBus();
