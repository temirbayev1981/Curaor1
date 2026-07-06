import { eventBus } from './event-bus';
import { EVENT_TYPES } from './event.types';
import type { EventConsumer } from './event.types';

const edgeFunctionUrl = (name: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${name}`;

function createEdgeConsumer(
  name: string,
  functionName: string,
  eventTypes: EventConsumer['eventTypes']
): EventConsumer {
  return {
    name,
    eventTypes,
    async handle(event) {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

      await fetch(edgeFunctionUrl(functionName), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          eventId: event.id,
          tenantId: event.tenantId,
          eventType: event.eventType,
          payload: event.payload,
        }),
      });
    },
  };
}

let registered = false;

export function registerEventConsumers(): void {
  if (registered) return;
  registered = true;

  eventBus.register(
    createEdgeConsumer('telegram-notifier', 'notify-telegram', [
      EVENT_TYPES.BOOKING_CREATED,
      EVENT_TYPES.PAYMENT_SUCCEEDED,
    ])
  );

  eventBus.register(
    createEdgeConsumer('email-sender', 'send-email', [
      EVENT_TYPES.BOOKING_CREATED,
      EVENT_TYPES.PAYMENT_SUCCEEDED,
    ])
  );

  eventBus.register(
    createEdgeConsumer('calendar-sync', 'sync-calendar', [
      EVENT_TYPES.BOOKING_STATUS_CHANGED,
    ])
  );

  eventBus.register(
    createEdgeConsumer('sms-sender', 'send-sms', [
      EVENT_TYPES.BOOKING_CREATED,
      EVENT_TYPES.PAYMENT_SUCCEEDED,
    ])
  );
}

registerEventConsumers();
