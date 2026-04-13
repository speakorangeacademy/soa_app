'use client'

// Re-exports Sonner's Toaster pre-configured with SOA branding.
// Import <Toaster /> from here (not directly from 'sonner') so the
// theme and position are consistent across the entire application.

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
    return (
        <SonnerToaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
                style: {
                    fontFamily: 'Work Sans, sans-serif',
                    fontSize: '0.9rem',
                },
                classNames: {
                    // Use the academy's primary orange for the progress bar accent
                    success: 'border-success/30',
                    error: 'border-danger/30',
                },
            }}
            theme="light"
        />
    )
}
