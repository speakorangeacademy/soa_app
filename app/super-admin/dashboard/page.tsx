'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { LayoutDashboard } from 'lucide-react'
import MetricCards from '@/components/super-admin/dashboard/metric-cards'
import BatchOccupancyTable from '@/components/super-admin/dashboard/batch-occupancy-table'
import CourseEnrollmentTable from '@/components/super-admin/dashboard/course-enrollment-table'
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics'

export default function SuperAdminDashboardPage() {
    const { data: metrics, isLoading, isError } = useDashboardMetrics();

    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>

            {/* Header */}
            <header className="animate-fade-up" style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                    <LayoutDashboard size={18} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overview</span>
                </div>
                <h1 style={{ fontSize: '2.25rem', color: 'var(--color-text)' }}>Admin Dashboard</h1>
                <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Real-time overview of admissions, revenue, and active batches.
                </p>
            </header>

            {/* Error State */}
            {isError && (
                <div className="card text-center py-12 mb-8 border-[var(--color-danger)] text-[var(--color-danger)]">
                    <p>Unable to load dashboard metrics. Please try again later.</p>
                </div>
            )}

            {/* Metric Cards */}
            <MetricCards
                data={{
                    totalAdmissions: metrics?.totalAdmissions || 0,
                    totalRevenue: metrics?.totalRevenue || 0,
                    pendingPayments: metrics?.pendingPayments || 0,
                    batchStrength: metrics?.batchStrength || []
                }}
                isLoading={isLoading}
            />

            <div className="space-y-8">
                {/* Batch Occupancy */}
                <BatchOccupancyTable
                    data={metrics?.batchStrength || []}
                    isLoading={isLoading}
                />

                {/* Course Enrollment */}
                <CourseEnrollmentTable
                    data={metrics?.courseEnrollment || []}
                    isLoading={isLoading}
                />
            </div>
        </div>
    )
}
