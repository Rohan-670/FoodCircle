const { z } = require('zod');

const recommendationFilterQuerySchema = z.object({
  minScore: z.coerce.number().min(0).max(100).optional(),
  maxDistanceKm: z.coerce.number().positive().optional(),
  serviceArea: z.string().trim().optional(),
  foodCategory: z.string().trim().optional(),
  urgency: z.enum(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional().default('ALL'),
  includeIgnored: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional()
    .default('false'),
});

const recommendationActionSchema = z.object({
  donationId: z.string().uuid('Valid donationId is required'),
  ngoId: z.string().uuid('Valid ngoId is required'),
  action: z.enum(['ACCEPT', 'IGNORE'], {
    required_error: 'Action must be ACCEPT or IGNORE',
  }),
});

module.exports = {
  recommendationFilterQuerySchema,
  recommendationActionSchema,
};
