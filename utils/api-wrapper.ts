import { NextResponse } from "next/server";
import { logError } from "./logger";

type ApiHandler = (...args: any[]) => Promise<NextResponse> | NextResponse;

/**
 * Higher-order function to wrap API routes with standardized error handling.
 * Catches all errors, logs them to Sentry/Console, and returns a clean JSON response.
 */
export function withErrorHandler(handler: ApiHandler) {
    return async (...args: any[]) => {
        try {
            return await handler(...args);
        } catch (error: any) {
            // Log the full error internally
            logError(error);

            // Determine error details (don't expose internal stack traces)
            const message = error.message || "Something went wrong. Please try again.";
            const code = error.code || "INTERNAL_SERVER_ERROR";
            const status = error.status || 500;

            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code,
                        message: status === 500 ? "We're having trouble processing your request. Please try again." : message
                    }
                },
                { status }
            );
        }
    };
}
