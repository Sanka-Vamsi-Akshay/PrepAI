import dotenv from 'dotenv';
import { z } from 'zod';
import { config as devConfig } from './development';
import { config as prodConfig } from './production';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid URL' }),
  JWT_SECRET: z.string().min(8, { message: 'JWT_SECRET must be at least 8 characters long' }),
  CORS_ORIGIN: z.string().default('http://localhost:8080'),
  FRONTEND_URL: z.string().url().default('http://localhost:8080'),
  GEMINI_API_KEY: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_USERNAME: z.string().default("default"),
  REDIS_PASSWORD: z.string().optional(),
  ANALYTICS_CACHE_TTL_SECONDS: z.coerce.number().default(300),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

if (parsedEnv.data.NODE_ENV === 'production' && parsedEnv.data.JWT_SECRET === 'super_secret_jwt_key_change_me_in_production') {
  console.error('❌ Security Vulnerability: JWT_SECRET cannot be the default "super_secret_jwt_key_change_me_in_production" in production mode.');
  process.exit(1);
}

export const env = parsedEnv.data;
export type Env = z.infer<typeof envSchema>;

// Dynamically select config matching active environment mode
export const appConfig = env.NODE_ENV === 'production' ? prodConfig : devConfig;

