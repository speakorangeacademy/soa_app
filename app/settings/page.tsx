'use client'

import React from 'react'
import { Settings as SettingsIcon, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { NotificationPreferencesCard } from '@/components/common/notification-preferences-card'

export default function SettingsPage() {
    const router = useRouter()

    return (
        <div
            className="min-h-screen relative"
            style={{
                background: 'radial-gradient(circle at center, #FFF9F4 0%, #FFF4E8 100%)',
            }}
        >
            {/* Noise Overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                }}
            />

            <div className="max-w-2xl mx-auto px-6 py-12 relative z-10">
                {/* Header Section */}
                <header className="flex items-center justify-between mb-10 animate-fade-up">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 -ml-2 rounded-full hover:bg-[var(--color-border)] transition-colors"
                            style={{ minHeight: '44px', minWidth: '44px' }}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-semibold text-[var(--color-text)] flex items-center gap-3">
                                <SettingsIcon size={28} className="text-[var(--color-primary)]" />
                                Settings
                            </h1>
                            <p className="text-[var(--color-text-muted)] mt-1">
                                Customize your experience and account preferences.
                            </p>
                        </div>
                    </div>
                </header>

                {/* Preferences Section */}
                <main className="space-y-6">
                    <NotificationPreferencesCard />
                </main>
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fadeUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-fade-up {
                    animation: fadeUp 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    )
}
