'use client'

import React, { useState } from 'react'
import { FilterBar } from '@/components/audit-logs/filter-bar'
import { AuditTable } from '@/components/audit-logs/audit-table'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

async function fetchAuditLogs(params: string) {
    const res = await fetch(`/api/audit-logs?${params}`)
    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch audit logs')
    }
    return res.json()
}

export default function AuditLogsPage() {
    const searchParams = useSearchParams()

    const page = parseInt(searchParams.get('page') || '1')
    const limit = 10

    const { data, isLoading, error } = useQuery({
        queryKey: ['audit-logs', searchParams.toString()],
        queryFn: () => fetchAuditLogs(searchParams.toString()),
        placeholderData: (previousData) => previousData,
        staleTime: 5000,
    })

    const onPageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', newPage.toString())
        window.history.pushState(null, '', `?${params.toString()}`)
    }

    return (
        <main className="min-h-screen p-8 relative overflow-hidden">
            {/* Design Backdrop */}
            <div className="fixed inset-0 -z-10 bg-[var(--color-bg)]">
                <div
                    className="absolute inset-0 opacity-100"
                    style={{
                        background: 'radial-gradient(circle at center, var(--color-bg) 0%, #FFF4E8 100%)',
                    }}
                />
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: '150px 150px'
                    }}
                />
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header - Item 1 */}
                <div className="animate-fade-up">
                    <h1 className="text-3xl font-semibold text-[var(--color-text)] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        System Audit Logs
                    </h1>
                    <p className="text-[var(--color-text-muted)] mt-2">
                        Track all critical platform actions with immutable records.
                    </p>
                </div>

                {/* Filter Bar - Item 2 */}
                <div className="animate-fade-up [animation-delay:60ms]">
                    <FilterBar />
                </div>

                {/* Content - Item 3 */}
                <div className="animate-fade-up [animation-delay:120ms]">
                    {error ? (
                        <div className="p-12 text-center bg-red-50 border border-red-100 rounded-xl">
                            <p className="text-[var(--color-danger)] font-medium">Error: {(error as Error).message}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 text-sm underline hover:text-[var(--color-accent)]"
                            >
                                Try again
                            </button>
                        </div>
                    ) : (
                        <AuditTable
                            logs={data?.logs || []}
                            totalCount={data?.totalCount || 0}
                            currentPage={page}
                            pageSize={limit}
                            onPageChange={onPageChange}
                            isLoading={isLoading}
                        />
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-up {
                    animation: fadeUp 0.6s ease-out forwards;
                    opacity: 0;
                }
                :root {
                    --color-bg: #FFF9F4;
                    --color-surface: #FFFFFF;
                    --color-border: #F0E4D7;
                    --color-text: #2C2416;
                    --color-text-muted: #8B7355;
                    --color-primary: #FF8C42;
                    --color-accent: #D94E1F;
                    --color-success: #4CAF50;
                    --color-warning: #FFC107;
                    --color-danger: #E53935;
                }
                body {
                    background-color: var(--color-bg);
                    color: var(--color-text);
                    font-family: 'Work Sans', sans-serif;
                }
            `}</style>
        </main>
    )
}
