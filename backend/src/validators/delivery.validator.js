const { z } = require('zod');

const requestVolunteerSchema = z.object({
  notes: z.string().trim().max(500).optional().nullable(),
});

const qrTokenSchema = z.object({
  token: z
    .string({ required_error: 'QR verification token is required' })
    .trim()
    .min(16, 'Invalid QR verification token'),
});

const locationUpdateSchema = z.object({
  latitude: z.coerce
    .number({ required_error: 'Latitude is required' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z.coerce
    .number({ required_error: 'Longitude is required' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  consentGranted: z.boolean().refine((val) => val === true, {
    message: 'Explicit volunteer consent is required to share live location',
  }),
});

module.exports = {
  requestVolunteerSchema,
  qrTokenSchema,
  locationUpdateSchema,
};
