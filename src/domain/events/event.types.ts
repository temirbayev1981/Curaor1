export const EVENT_TYPES = {
  BOOKING_CREATED: 'booking.created.v1',
  BOOKING_STATUS_CHANGED: 'booking.status_changed.v1',
  PAYMENT_SUCCEEDED: 'payment.succeeded.v1',
  PAYMENT_FAILED: 'payment.failed.v1',
  PAYMENT_REFUNDED: 'payment.refunded.v1',
  CONTRACT_SIGNED: 'contract.signed.v1',
  ARTICLE_PUBLISHED: 'article.published.v1',
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export interface EventPayload {
  [key: string]: unknown;
}

export interface PublishEventInput {
  tenantId: string;
  eventType: EventType;
  aggregateId: string;
  aggregateType: string;
  payload: EventPayload;
  idempotencyKey: string;
}

export interface EventConsumer {
  name: string;
  eventTypes: EventType[];
  handle(event: {
    id: string;
    tenantId: string;
    eventType: EventType;
    payload: EventPayload;
  }): Promise<void>;
}
