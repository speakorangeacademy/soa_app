import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
    Sentry.init({
        dsn,
        tracesSampleRate: 1.0,
        debug: false,
        environment: process.env.NODE_ENV
    });
}

/**
 * Standardized error logger
 * Automatically sends to Sentry if DSN is configured, or falls back to console.
 */
export function logError(error: unknown, context?: Record<string, any>) {
    if (dsn) {
        Sentry.withScope((scope) => {
            if (context) {
                scope.setExtras(context);
            }
            Sentry.captureException(error);
        });
    } else {
        console.error('[Error Log]:', error);
        if (context) {
            console.error('[Error Context]:', context);
        }
    }
}
