'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/common/ui"
import { Users, CreditCard, Clock, Layers } from 'lucide-react'
import { Badge } from '@/components/common/ui'
import { Skeleton } from '@/components/common/ui'

interface MetricCardsProps {
    data: {
        totalAdmissions: number
        totalRevenue: number
        pendingPayments: number
        batchStrength: any[]
    }
    isLoading: boolean
}

export default function MetricCards({ data, isLoading }: MetricCardsProps) {
    if (isLoading) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {[1, 2, 3, 4].map(i => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[60px] mb-2" />
                            <Skeleton className="h-3 w-[140px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

            {/* Total Admissions */}
            <Card className="animate-fade-up delay-1 hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Admissions</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--color-primary)]">
                        {data.totalAdmissions.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Active enrollments
                    </p>
                </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card className="animate-fade-up delay-2 hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--color-success)]">
                        {formatCurrency(data.totalRevenue)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Verified payments only
                    </p>
                </CardContent>
            </Card>

            {/* Pending Verifications */}
            <Card className="animate-fade-up delay-3 hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verifications</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                            {data.pendingPayments}
                        </div>
                        {data.pendingPayments > 0 ? (
                            <Badge variant="warning">Action Needed</Badge>
                        ) : (
                            <Badge variant="success">All Clear</Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Review in Payments module
                    </p>
                </CardContent>
            </Card>

            {/* Active Batches */}
            <Card className="animate-fade-up delay-4 hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Batches</CardTitle>
                    <Layers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {data.batchStrength.length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Currently running sessions
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
