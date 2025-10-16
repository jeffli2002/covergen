import { z } from 'zod';

/**
 * Environment variable validation and type-safe access
 * Based on T3 Stack pattern - validates env vars at build/runtime
 */

const envSchema = z.object({
  // Server-only environment variables
  server: z.object({
    // OpenRouter API
    OPENROUTER_API_KEY: z.string().min(1).optional(),
    
    // Supabase
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    
    // BestAuth
    BESTAUTH_JWT_SECRET: z.string().min(1).optional(),
    
    // Cloudinary
    CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_UPLOAD_PRESET: z.string().min(1).optional(),
    CLOUDINARY_SECRET: z.string().min(1).optional(),
    CLOUDINARY_URL: z.string().min(1).optional(),
    
    // ImgBB
    IMGBB_API_KEY: z.string().min(1).optional(),
    
    // Google Cloud
    GOOGLE_CLOUD_VISION_API_KEY: z.string().min(1).optional(),
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    
    // Creem Payment
    CREEM_API_KEY: z.string().min(1).optional(),
    CREEM_SECRET_KEY: z.string().min(1).optional(),
    CREEM_WEBHOOK_SECRET: z.string().min(1).optional(),
    
    // KIE API
    KIE_API_KEY: z.string().min(1).optional(),
    
    // Node environment
    NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  }),
  
  // Client-side environment variables (must be prefixed with NEXT_PUBLIC_)
  client: z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    
    NEXT_PUBLIC_DEV_MODE: z.string().optional(),
    NEXT_PUBLIC_BYPASS_USAGE_LIMIT: z.string().optional(),
    
    NEXT_PUBLIC_CREEM_TEST_MODE: z.string().optional(),
    NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY: z.string().min(1).optional(),
    NEXT_PUBLIC_PRICE_ID_PRO_YEARLY: z.string().min(1).optional(),
    NEXT_PUBLIC_PRICE_ID_PROPLUS_MONTHLY: z.string().min(1).optional(),
    NEXT_PUBLIC_PRICE_ID_PROPLUS_YEARLY: z.string().min(1).optional(),
  }),
});

type EnvSchema = z.infer<typeof envSchema>;

/**
 * Validate and parse environment variables
 * This runs at module load time to catch configuration errors early
 */
function createEnv() {
  const serverEnv = {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    BESTAUTH_JWT_SECRET: process.env.BESTAUTH_JWT_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET,
    CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET,
    CLOUDINARY_URL: process.env.CLOUDINARY_URL,
    IMGBB_API_KEY: process.env.IMGBB_API_KEY,
    GOOGLE_CLOUD_VISION_API_KEY: process.env.GOOGLE_CLOUD_VISION_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    CREEM_API_KEY: process.env.CREEM_API_KEY,
    CREEM_SECRET_KEY: process.env.CREEM_SECRET_KEY,
    CREEM_WEBHOOK_SECRET: process.env.CREEM_WEBHOOK_SECRET,
    KIE_API_KEY: process.env.KIE_API_KEY,
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test' | undefined,
  };

  const clientEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE,
    NEXT_PUBLIC_BYPASS_USAGE_LIMIT: process.env.NEXT_PUBLIC_BYPASS_USAGE_LIMIT,
    NEXT_PUBLIC_CREEM_TEST_MODE: process.env.NEXT_PUBLIC_CREEM_TEST_MODE,
    NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY: process.env.NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY,
    NEXT_PUBLIC_PRICE_ID_PRO_YEARLY: process.env.NEXT_PUBLIC_PRICE_ID_PRO_YEARLY,
    NEXT_PUBLIC_PRICE_ID_PROPLUS_MONTHLY: process.env.NEXT_PUBLIC_PRICE_ID_PROPLUS_MONTHLY,
    NEXT_PUBLIC_PRICE_ID_PROPLUS_YEARLY: process.env.NEXT_PUBLIC_PRICE_ID_PROPLUS_YEARLY,
  };

  // Validate in development/test, but be lenient in production to avoid crashes
  if (process.env.NODE_ENV !== 'production') {
    const parsed = envSchema.safeParse({
      server: serverEnv,
      client: clientEnv,
    });

    if (!parsed.success) {
      console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
      // Don't throw in test mode to allow partial env setups
      if (process.env.NODE_ENV !== 'test') {
        throw new Error('Invalid environment variables');
      }
    }
  }

  return {
    ...serverEnv,
    ...clientEnv,
  };
}

// Export typed environment variables
export const env = createEnv();

// Type-safe helper to check if we're in test mode
export const isTestMode = () => env.NEXT_PUBLIC_CREEM_TEST_MODE === 'true';

// Type-safe helper to check if we're in development
export const isDevelopment = () => env.NODE_ENV === 'development' || env.NEXT_PUBLIC_DEV_MODE === 'true';

// Type-safe helper to check if we're in production
export const isProduction = () => env.NODE_ENV === 'production';
