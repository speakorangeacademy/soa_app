"use client";

import { useEffect } from "react";
import { logError } from "@/utils/logger";
import { Button } from "@/components/common/ui";
import { AlertCircle, RefreshCcw, Mail } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        logError(error, { digest: error.digest });
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-bg">
            <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-surface border border-border rounded-xl p-8 shadow-lg text-center">
                    <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={32} />
                    </div>

                    <h2 className="font-heading text-2xl font-bold text-text mb-4 tracking-tight">
                        Oops! Something went wrong
                    </h2>

                    <p className="text-muted mb-8 leading-relaxed">
                        We've encountered an unexpected error. Our team has been notified and we're working to fix it.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={reset}
                            className="w-full flex items-center justify-center gap-2"
                            variant="primary"
                        >
                            <RefreshCcw size={18} />
                            Try Again
                        </Button>

                        <a
                            href="mailto:support@speakorange.academy"
                            className="w-full py-3 text-sm font-semibold text-muted hover:text-primary transition-colors flex items-center justify-center gap-2 tap-target"
                        >
                            <Mail size={16} />
                            Contact Support
                        </a>
                    </div>

                    {error.digest && (
                        <p className="mt-8 text-[10px] text-muted/40 font-mono">
                            Error Code: {error.digest}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
