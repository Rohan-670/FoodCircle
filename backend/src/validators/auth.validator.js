const { z } = require('zod');

const emailSchema = z
  .string()
  .trim()
  .email('Please provide a valid email address')
  .transform((val) => val.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(72, 'Password must be at most 72 characters long')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const phoneSchema = z
  .string()
  .trim()
  .min(7, 'Phone number must be at least 7 characters')
  .max(20, 'Phone number is too long');

const optionalLatitude = z.coerce
  .number()
  .min(-90, 'Latitude must be between -90 and 90')
  .max(90, 'Latitude must be between -90 and 90')
  .optional()
  .nullable();

const optionalLongitude = z.coerce
  .number()
  .min(-180, 'Longitude must be between -180 and 180')
  .max(180, 'Longitude must be between -180 and 180')
  .optional()
  .nullable();

const donorRegisterSchema = z.object({
  role: z.literal('DONOR'),
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  organizationName: z
    .string()
    .trim()
    .min(2, 'Organization or business name is required'),
  businessType: z.string().trim().min(2).optional().default('General'),
  address: z.string().trim().min(5, 'Address is required'),
  latitude: optionalLatitude,
  longitude: optionalLongitude,
});

const ngoRegisterSchema = z.object({
  role: z.literal('NGO'),
  organizationName: z.string().trim().min(2, 'Organization name is required'),
  contactPerson: z.string().trim().min(2, 'Contact person name is required'),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  address: z.string().trim().min(5, 'Address is required'),
  serviceArea: z.string().trim().min(2, 'Service area is required'),
  registrationNumber: z.string().trim().min(2).optional().nullable(),
  latitude: optionalLatitude,
  longitude: optionalLongitude,
  capacity: z.coerce.number().int().positive().optional().nullable(),
});

const volunteerRegisterSchema = z
  .object({
    role: z.literal('VOLUNTEER'),
    fullName: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: emailSchema,
    password: passwordSchema,
    phone: phoneSchema,
    address: z.string().trim().min(3).optional().nullable(),
    serviceArea: z.string().trim().min(2).optional().nullable(),
    vehicleType: z.string().trim().min(2).optional().nullable(),
    isAvailable: z.boolean().optional().default(true),
    currentLatitude: optionalLatitude,
    currentLongitude: optionalLongitude,
  })
  .refine((data) => Boolean(data.address || data.serviceArea), {
    message: 'Either address or service area is required for volunteers',
    path: ['serviceArea'],
  });

const registerSchema = z.union([
  donorRegisterSchema,
  ngoRegisterSchema,
  volunteerRegisterSchema,
]);

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  phone: phoneSchema.optional(),
  // Donor fields
  organizationName: z.string().trim().min(2).optional(),
  businessType: z.string().trim().min(2).optional(),
  address: z.string().trim().min(3).optional(),
  latitude: optionalLatitude,
  longitude: optionalLongitude,
  // NGO fields
  contactPerson: z.string().trim().min(2).optional(),
  serviceArea: z.string().trim().min(2).optional(),
  registrationNumber: z.string().trim().min(2).optional().nullable(),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  // Volunteer fields
  vehicleType: z.string().trim().min(2).optional().nullable(),
  isAvailable: z.boolean().optional(),
  currentLatitude: optionalLatitude,
  currentLongitude: optionalLongitude,
});

const updateAccountStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive boolean is required' }),
});

const verifyNgoSchema = z.object({
  isVerified: z.boolean({ required_error: 'isVerified boolean is required' }),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updateAccountStatusSchema,
  verifyNgoSchema,
};
