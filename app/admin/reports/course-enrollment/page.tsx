'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Card,
    CardHeader,
    CardContent,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Badge,
    Button,
    Input,
    Label,
    Skeleton
} from '@/components/common/ui'
import { EnrollmentReportChart } from '@/components/admin/EnrollmentReportChart'
import {
    BarChart3,
    TrendingUp,
    Calendar,
    Filter,
    ChevronRight,
    Search,
    AlertCircle
} from 'lucide-react'

async function fetchEnrollmentReport(from: string, to: string) {
    const res = await fetch(`/api/admin/reports/course-enrollment?from=${from}&to=${to}`)
    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to generate report')
    }
    return res.json()
}

export default function CourseEnrollmentReportPage() {
    const today = new Date().toISOString().split('T')[0]
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const lastMonthStr = lastMonth.toISOString().split('T')[0]

    const [dateRange, setDateRange] = useState({ from: lastMonthStr, to: today })
    const [activeRange, setActiveRange] = useState({ from: lastMonthStr, to: today })

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['courseEnrollmentReport', activeRange.from, activeRange.to],
        queryFn: () => fetchEnrollmentReport(activeRange.from, activeRange.to),
        staleTime: 60000,
    })

    const handleApplyFilter = (e: React.FormEvent) => {
        e.preventDefault()
        setActiveRange(dateRange)
    }

    const summary = data?.summary
    const reportData = data?.data || []

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_center,_var(--color-bg)_0%,_#FFF4E8_100%)] p-6 sm:p-10">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-heading font-bold text-text tracking-tight">
                            Course-wise Enrollment Report
                        </h1>
                        <p className="text-muted text-sm sm:text-base">
                            View and analyze registration trends by date range.
                        </p>
                    </div>

                    <form onSubmit={handleApplyFilter} className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-wrap items-end gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-muted">From Date</Label>
                            <Input
                                type="date"
                                value={dateRange.from}
                                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                className="h-11 sm:w-44"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-muted">To Date</Label>
                            <Input
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                className="h-11 sm:w-44"
                                required
                            />
                        </div>
                        <Button type="submit" className="h-11 px-8 gap-2 group">
                            <Search size={18} className="group-active:scale-90 transition-transform" />
                            Apply
                        </Button>
                    </form>
                </div>

                {error && (
                    <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 flex items-center gap-3 text-danger text-sm">
                        <AlertCircle size={18} />
                        <span>{(error as Error).message}</span>
                    </div>
                )}

                {/* Summary Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-500 delay-[60ms]">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted uppercase tracking-widest">Total Enrollments</p>
                                <p className="text-2xl font-heading font-bold text-text">
                                    {isLoading ? '...' : summary?.total_enrollments || 0}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-500 delay-[120ms]">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                                <BarChart3 size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted uppercase tracking-widest">Top Course</p>
                                <p className="text-2xl font-heading font-bold text-text truncate max-w-[200px]">
                                    {isLoading ? '...' : summary?.top_course || 'None'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Chart & Table Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Enrollment Chart */}
                    <Card className="lg:col-span-2 border-none shadow-xl shadow-border/20 overflow-visible animate-in fade-in slide-in-from-bottom-4 duration-700 delay-[180ms]">
                        <CardHeader className="bg-white/60 backdrop-blur-sm border-b border-border/50 p-6 flex items-center justify-between rounded-t-xl">
                            <h2 className="text-lg font-heading font-semibold text-text">Enrollment Distribution</h2>
                            <Badge variant="outline" className="bg-bg">Visualization</Badge>
                        </CardHeader>
                        <CardContent className="p-8">
                            {isLoading ? (
                                <div className="h-[300px] w-full bg-bg/20 rounded-xl animate-pulse" />
                            ) : reportData.length > 0 ? (
                                <EnrollmentReportChart data={reportData} />
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-muted italic">
                                    No data available for this range.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Enrollment Details Table */}
                    <Card className="border-none shadow-xl shadow-border/20 overflow-visible animate-in fade-in slide-in-from-bottom-4 duration-700 delay-[240ms]">
                        <CardHeader className="bg-white/60 backdrop-blur-sm border-b border-border/50 p-6 flex items-center justify-between rounded-t-xl">
                            <h2 className="text-lg font-heading font-semibold text-text">Breakdown</h2>
                        </CardHeader>
                        <div className="max-h-[440px] overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 space-y-4">
                                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                                </div>
                            ) : reportData.length > 0 ? (
                                <Table containerClassName="border-none rounded-none">
                                    <TableHeader className="bg-bg/50 border-none">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="text-[10px] sm:text-xs">Course</TableHead>
                                            <TableHead className="text-center text-[10px] sm:text-xs">Total</TableHead>
                                            <TableHead className="text-right text-[10px] sm:text-xs">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((item: any, index: number) => (
                                            <TableRow key={item.course_id} className="group hover:bg-white/50">
                                                <TableCell className="font-medium text-xs sm:text-sm">{item.course_name}</TableCell>
                                                <TableCell className="text-center font-bold text-text">{item.total_enrollments}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="text-[10px] text-success font-bold flex items-center gap-1">
                                                            <div className="w-1 h-1 rounded-full bg-success" />
                                                            {item.approved_count}
                                                        </span>
                                                        <span className="text-[10px] text-warning font-bold flex items-center gap-1">
                                                            <div className="w-1 h-1 rounded-full bg-warning" />
                                                            {item.pending_count}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-12 text-center text-muted text-sm italic">
                                    No enrollments found.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <style jsx>{`
                .animate-in {
                    animation-fill-mode: both;
                }
            `}</style>
        </div>
    )
}
