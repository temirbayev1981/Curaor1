import { z } from 'zod';

export const tenantSettingsSchema = z.object({
  price_per_mile: z.number().nonnegative().max(100),
  default_deposit_percent: z.union([z.literal(25), z.literal(50), z.literal(100)]),
  base_event_price: z.number().positive().max(100000),
  currency: z.string().length(3),
  timezone: z.string().min(1),
  notification_email: z.string().email(),
  telegram_chat_id: z.string().nullable(),
});

export const updateSettingsSchema = z.object({
  settings: tenantSettingsSchema.partial().optional(),
  admin_overrides: tenantSettingsSchema.partial().optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
