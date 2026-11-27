const dotenv = require('dotenv');
const { z } = require('zod');

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(5000),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  CLIENT_URL: z
    .string()
    .min(1)
    .default('http://localhost:5173'),
  ROUTING_API_URL: z
    .string()
    .url('ROUTING_API_URL must be a valid URL')
    .default('https://router.project-osrm.org/route/v1/driving'),
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine(
      (val) => val.startsWith('postgresql://') || val.startsWith('postgres://'),
      'DATABASE_URL must be a valid PostgreSQL connection string'
    ),
  JWT_SECRET: z
    .string()
    .min(8, 'JWT_SECRET must be at least 8 characters long'),
  JWT_EXPIRES_IN: z
    .string()
    .min(1)
    .default('7d'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment variable validation failed:');
  for (const issue of parsed.error.issues) {
    const field = issue.path.join('.') || 'ENV';
    console.error(`   - ${field}: ${issue.message}`);
  }
  process.exit(1);
}

const allowedOrigins = parsed.data.CLIENT_URL.split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const environment = {
  port: parsed.data.PORT,
  nodeEnv: parsed.data.NODE_ENV,
  clientUrl: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  allowedOrigins,
  routingApiUrl: parsed.data.ROUTING_API_URL,
  databaseUrl: parsed.data.DATABASE_URL,
  jwtSecret: parsed.data.JWT_SECRET,
  jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
};

module.exports = environment;
