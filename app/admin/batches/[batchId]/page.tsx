'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
    Card,
    CardHeader,
    TableSkeleton,
    Badge,
    Button
} from '@/components/common/ui'
import { BatchStudentsTable } from '@/components/admin/BatchStudentsTable'
import {
    Users,
    ChevronLeft,
    Calendar,
    Clock,
    BookOpen,
    AlertCircle
} from 'lucide-react'

async function fetchBatchStudents(batchId: string) {
    const res = await fetch(`/api/admin/batch-students?batchId=${batchId}`)
    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch batch students')
    }
    return res.json()
}

export default function BatchViewPage() {
    const params = useParams()
    const batchId = params.batchId as string

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['batchStudents', batchId],
        queryFn: () => fetchBatchStudents(batchId),
        staleTime: 30000,
    })

    if (error) {
        return (
            <div className="p-8 max-w-6xl mx-auto">
                <div className="bg-danger/10 border border-danger/20 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
                    <AlertCircle className="text-danger w-12 h-12" />
                    <div className="space-y-1">
                        <h2 className="text-xl font-heading font-semibold text-text">Unable to load batch rosters</h2>
                        <p className="text-muted text-sm">{(error as Error).message}</p>
                    </div>
                    <Button variant="danger" onClick={() => refetch()}>Try Again</Button>
                </div>
            </div>
        )
    }

    const batch = data?.batch
    const students = data?.students || []

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_center,_var(--color-bg)_0%,_#FFF4E8_100%)] p-6 sm:p-10">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="space-y-4">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2 text-muted hover:text-primary transition-colors text-sm font-medium"
                        >
                            <ChevronLeft size={16} />
                            Back to Batches
                        </button>

                        <div className="space-y-1">
                            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-text tracking-tight">
                                {isLoading ? <Skeleton className="h-10 w-64" /> : batch?.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-muted text-sm sm:text-base">
                                <span className="flex items-center gap-1.5">
                                    <BookOpen size={18} className="text-primary/60" />
                                    {isLoading ? <Skeleton className="h-5 w-32" /> : batch?.course}
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-border" />
                                <span className="flex items-center gap-1.5">
                                    <Clock size={18} className="text-primary/60" />
                                    {isLoading ? <Skeleton className="h-5 w-24" /> : batch?.timing}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-sm flex items-center gap-4 min-w-[180px]">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted uppercase tracking-widest">Enrollment</p>
                            <p className="text-2xl font-heading font-bold text-text">
                                {isLoading ? '...' : students.length} <span className="text-sm font-normal text-muted">students</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <Card className="border-none shadow-2xl shadow-border/20 overflow-visible">
                    <CardHeader className="bg-white/60 backdrop-blur-sm border-b border-border/50 p-6 flex items-center justify-between sticky top-0 z-20 rounded-t-xl">
                        <h2 className="text-lg font-heading font-semibold text-text">Student Roster</h2>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-bg font-medium">
                                {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Badge>
                        </div>
                    </CardHeader>

                    <div className="p-2 sm:p-4">
                        {isLoading ? (
                            <TableSkeleton columns={4} rows={6} />
                        ) : (
                            <BatchStudentsTable students={students} />
                        )}
                    </div>
                </Card>
            </div>

            <style jsx>{`
                .animate-in {
                    animation-fill-mode: both;
                }
            `}</style>
        </div>
    )
}

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`animate-pulse rounded-md bg-border/50 ${className}`}
            {...props}
        />
    )
}
