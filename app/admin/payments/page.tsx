'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LayoutDashboard, FileText, Loader2 } from 'lucide-react'
import PaymentFilterBar from '@/components/admin/payment-filter-bar'
import PaymentsTable from '@/components/admin/payments-table'
import Link from 'next/link'

// --- Types ---

interface Payment {
    id: string
    date: string
    student_name: string
    parent_name: string
    course_name: string
    batch_name: string
    transaction_id: string
    method: string
    amount: number
    status: string
    receipt_no: string | null
    verified_by: string | null
    verified_at: string | null
}

interface PaginatedPayments {
    data: Payment[]
    meta: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

export default function AdminPaymentsPage() {
    // --- State ---
    const [filters, setFilters] = useState({
        status: 'All',
        batchId: 'all',
        search: '',
        fromDate: '',
        toDate: '',
        page: 1,
        limit: 10
    })

    // Debounce search so API only fires 400ms after user stops typing
    const [debouncedSearch, setDebouncedSearch] = useState(filters.search)
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(filters.search), 400)
        return () => clearTimeout(t)
    }, [filters.search])

    // Effective filters used in query (search is debounced, rest are immediate)
    const queryFilters = { ...filters, search: debouncedSearch }

    // --- Queries ---

    // 1. Fetch Batches for Filter Dropdown
    const { data: batches } = useQuery({
        queryKey: ['admin-batch-list'],
        queryFn: () => fetch('/api/admin/batches/list').then(res => res.json()),
        staleTime: 1000 * 60 * 5, // batches rarely change
        initialData: []
    })

    // 2. Fetch Payments with Filters
    const { data: paymentsData, isLoading, isError } = useQuery<PaginatedPayments>({
        queryKey: ['admin-payments', queryFilters],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: queryFilters.page.toString(),
                limit: queryFilters.limit.toString(),
                status: queryFilters.status,
                batchId: queryFilters.batchId,
                search: queryFilters.search,
                fromDate: queryFilters.fromDate,
                toDate: queryFilters.toDate
            })
            const res = await fetch(`/api/admin/payments?${params}`)
            if (!res.ok) throw new Error('Failed to fetch payments')
            return res.json()
        },
        placeholderData: (prev: PaginatedPayments | undefined) => prev // Keep showing old data while new page loads
    })

    // --- Handlers ---
    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }))
    }

    // --- Render ---
    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>

            {/* Header */}
            <header className="animate-fade-up" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                        <Link href="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'inherit', textDecoration: 'none' }}>
                            <LayoutDashboard size={18} />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dashboard</span>
                        </Link>
                        <span style={{ color: 'var(--color-text-muted)' }}>/</span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Payments</span>
                    </div>
                    <h1 style={{ fontSize: '2.25rem', color: 'var(--color-text)' }}>All Payments</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Read-only view of verified and unverified transactions.
                    </p>
                </div>
            </header>

            {/* Filter Bar */}
            <div className="animate-fade-up delay-1">
                <PaymentFilterBar
                    filters={filters}
                    setFilters={setFilters}
                    batches={batches}
                />
            </div>

            {/* Data Table */}
            <div className="animate-fade-up delay-2">
                {isError ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-danger)' }}>
                        <p>Unable to load payment records. Please try refreshing.</p>
                    </div>
                ) : (
                    <PaymentsTable
                        payments={paymentsData?.data || []}
                        isLoading={isLoading}
                        pagination={{
                            page: paymentsData?.meta.page || 1,
                            limit: paymentsData?.meta.limit || 10,
                            total: paymentsData?.meta.total || 0,
                            totalPages: paymentsData?.meta.totalPages || 0
                        }}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    )
}
