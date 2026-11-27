const { z } = require('zod');

const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional()
    .default('false'),
});

const updatePreferencesSchema = z.object({
  requestAlerts: z.boolean().optional(),
  deliveryAlerts: z.boolean().optional(),
  expiryAlerts: z.boolean().optional(),
  verificationAlerts: z.boolean().optional(),
});

module.exports = {
  listNotificationsQuerySchema,
  updatePreferencesSchema,
};
