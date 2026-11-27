const { z } = require('zod');

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const usersFilterQuerySchema = paginationQuerySchema.extend({
  role: z.enum(['DONOR', 'NGO', 'VOLUNTEER', 'ADMIN']).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  search: z.string().trim().optional(),
});

const verificationDecisionSchema = z
  .object({
    status: z.enum(['APPROVED', 'REJECTED']).optional(),
    isVerified: z.boolean().optional(),
    notes: z.string().trim().max(500).optional().nullable(),
  })
  .refine((data) => data.status !== undefined || data.isVerified !== undefined, {
    message: 'Either status (APPROVED/REJECTED) or isVerified boolean is required',
  });

const verificationHistoryQuerySchema = paginationQuerySchema.extend({
  targetType: z.enum(['NGO', 'DONOR']).optional(),
  targetProfileId: z.string().uuid().optional(),
});

const reportsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['OPEN', 'REVIEWED', 'DISMISSED', 'ACTION_TAKEN']).optional(),
});

const reviewReportSchema = z.object({
  status: z.enum(['REVIEWED', 'DISMISSED', 'ACTION_TAKEN']),
  adminNotes: z.string().trim().max(1000).optional().nullable(),
  cancelDonation: z.boolean().optional().default(false),
});

const adminDonationsQuerySchema = paginationQuerySchema.extend({
  status: z
    .enum([
      'AVAILABLE',
      'REQUESTED',
      'ACCEPTED',
      'ASSIGNED',
      'PICKED_UP',
      'IN_TRANSIT',
      'DELIVERED',
      'CANCELLED',
      'EXPIRED',
    ])
    .optional(),
  foodCategory: z.string().trim().optional(),
});

const adminDeliveriesQuerySchema = paginationQuerySchema.extend({
  status: z
    .enum([
      'PENDING_VOLUNTEER',
      'VOLUNTEER_ASSIGNED',
      'PICKUP_CONFIRMED',
      'IN_TRANSIT',
      'DELIVERY_CONFIRMED',
      'CANCELLED',
      'FAILED',
    ])
    .optional(),
});

const auditLogsQuerySchema = paginationQuerySchema.extend({
  action: z.string().trim().optional(),
  targetType: z.string().trim().optional(),
});

module.exports = {
  usersFilterQuerySchema,
  verificationDecisionSchema,
  verificationHistoryQuerySchema,
  reportsQuerySchema,
  reviewReportSchema,
  adminDonationsQuerySchema,
  adminDeliveriesQuerySchema,
  auditLogsQuerySchema,
};
