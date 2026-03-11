/**
 * Centralized environment variable access and validation.
 * This ensures the app fails fast if required secrets are missing.
 */

const requiredEnv = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "RESEND_API_KEY",
];

// In client-side, we can only validate NEXT_PUBLIC_* variables
const isServer = typeof window === 'undefined';

if (isServer) {
    requiredEnv.forEach((key) => {
        if (!process.env[key]) {
            // In development, we throw an error to fail fast. 
            // In production, we log a critical warning (actual enforcement happens via Vercel checks).
            const msg = `CRITICAL: Missing environment variable: ${key}`;
            if (process.env.NODE_ENV === 'development') {
                throw new Error(msg);
            } else {
                console.error(msg);
            }
        }
    });
}

export const env = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // Only accessible on server
    supabaseServiceKey: isServer ? process.env.SUPABASE_SERVICE_ROLE_KEY! : '',
    resendApiKey: isServer ? process.env.RESEND_API_KEY! : '',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
};
