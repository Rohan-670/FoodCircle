const { z } = require('zod');

const safetyChecklistObjectSchema = z.object({
  properlyPackaged: z.boolean().refine((val) => val === true, {
    message: 'Food must be confirmed as properly packaged',
  }),
  storedAtSafeTemp: z.boolean().refine((val) => val === true, {
    message: 'Food must be confirmed as stored at a safe temperature',
  }),
  withinSafeConsumptionWindow: z.boolean().refine((val) => val === true, {
    message: 'Food must be within its safe consumption window',
  }),
  noSpoilageSigns: z.boolean().refine((val) => val === true, {
    message: 'Food must be confirmed free of spoilage signs',
  }),
});

const safetyChecklistSchema = z.preprocess((val) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}, safetyChecklistObjectSchema);

const optionalFloat = z.preprocess(
  (val) => (val === '' || val === undefined || val === null ? null : Number(val)),
  z.number().finite().nullable().optional()
);

const createDonationSchema = z
  .object({
    title: z.string().trim().min(2, 'Food name or title is required'),
    description: z.string().trim().max(1000).optional().nullable(),
    foodCategory: z.string().trim().min(2, 'Food category is required'),
    quantity: z.coerce
      .number()
      .int('Quantity must be a whole number')
      .positive('Quantity must be greater than 0'),
    unit: z.string().trim().min(1, 'Quantity unit is required'),
    preparedAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date({
      required_error: 'Expiry / safe-consumption deadline is required',
      invalid_type_error: 'Invalid expiry date format',
    }),
    pickupAddress: z.string().trim().min(5, 'Pickup address is required'),
    latitude: optionalFloat,
    longitude: optionalFloat,
    packagingInfo: z.string().trim().min(2, 'Packaging information is required'),
    allergenInfo: z.string().trim().optional().nullable(),
    storageRequirements: z
      .string()
      .trim()
      .min(2, 'Storage requirements are required'),
    safetyChecklist: safetyChecklistSchema,
  })
  .refine((data) => data.expiresAt > new Date(), {
    message: 'Expiry deadline must be in the future',
    path: ['expiresAt'],
  })
  .refine(
    (data) => !data.preparedAt || data.expiresAt > data.preparedAt,
    {
      message: 'Expiry deadline must be after preparation time',
      path: ['expiresAt'],
    }
  );

const updateDonationSchema = z
  .object({
    title: z.string().trim().min(2).optional(),
    description: z.string().trim().max(1000).optional().nullable(),
    foodCategory: z.string().trim().min(2).optional(),
    quantity: z.coerce.number().int().positive('Quantity must be greater than 0').optional(),
    unit: z.string().trim().min(1).optional(),
    preparedAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date().optional(),
    pickupAddress: z.string().trim().min(5).optional(),
    latitude: optionalFloat,
    longitude: optionalFloat,
    packagingInfo: z.string().trim().min(2).optional(),
    allergenInfo: z.string().trim().optional().nullable(),
    storageRequirements: z.string().trim().min(2).optional(),
    safetyChecklist: safetyChecklistSchema.optional(),
  })
  .refine((data) => !data.expiresAt || data.expiresAt > new Date(), {
    message: 'Expiry deadline must be in the future',
    path: ['expiresAt'],
  });

const browseDonationsQuerySchema = z.object({
  foodCategory: z.string().trim().optional(),
  minQuantity: z.coerce.number().int().positive().optional(),
  location: z.string().trim().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().positive().optional().default(25),
  urgency: z.enum(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM']).optional().default('ALL'),
});

const requestDonationSchema = z.object({
  requestedQuantity: z.coerce
    .number()
    .int()
    .positive('Requested quantity must be greater than 0')
    .optional()
    .nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
});

const respondToRequestSchema = z.object({
  action: z.enum(['ACCEPT', 'REJECT'], {
    required_error: 'Action must be ACCEPT or REJECT',
  }),
});

const reportDonationSchema = z.object({
  reason: z.string().trim().min(3, 'Report reason is required').max(150),
  details: z.string().trim().max(1000).optional().nullable(),
});

module.exports = {
  createDonationSchema,
  updateDonationSchema,
  browseDonationsQuerySchema,
  requestDonationSchema,
  respondToRequestSchema,
  reportDonationSchema,
};
