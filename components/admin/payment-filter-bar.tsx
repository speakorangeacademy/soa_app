'use client'

import React from 'react'
import { Search, Filter, Calendar, X } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Button,
    Input
} from "@/components/common/ui"

interface FilterBarProps {
    filters: {
        status: string
        batchId: string
        search: string
        fromDate: string
        toDate: string
    }
    setFilters: (filters: any) => void
    batches: { id: string, name: string }[]
}

export default function PaymentFilterBar({ filters, setFilters, batches }: FilterBarProps) {
    const handleChange = (key: string, value: string) => {
        setFilters((prev: any) => ({ ...prev, [key]: value, page: 1 })) // Reset to page 1 on filter change
    }

    const clearFilters = () => {
        setFilters({
            status: 'All',
            batchId: 'all',
            search: '',
            fromDate: '',
            toDate: '',
            page: 1
        })
    }

    return (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>

                {/* Search */}
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <Input
                        placeholder="Search by txn ID..."
                        value={filters.search}
                        onChange={(e) => handleChange('search', e.target.value)}
                        style={{ paddingLeft: '36px' }}
                    />
                </div>

                {/* Status Filter */}
                <Select value={filters.status} onValueChange={(val) => handleChange('status', val)}>
                    <SelectTrigger style={{ width: '140px' }}>
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>

                {/* Batch Filter */}
                <Select value={filters.batchId} onValueChange={(val) => handleChange('batchId', val)}>
                    <SelectTrigger style={{ width: '180px' }}>
                        <SelectValue placeholder="Select Batch" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Batches</SelectItem>
                        {batches?.map(batch => (
                            <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Date Range */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="date"
                            value={filters.fromDate}
                            onChange={(e) => handleChange('fromDate', e.target.value)}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid var(--color-border)',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                color: 'var(--color-text)',
                                backgroundColor: 'var(--color-surface)',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                    <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="date"
                            value={filters.toDate}
                            onChange={(e) => handleChange('toDate', e.target.value)}
                            min={filters.fromDate}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid var(--color-border)',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                color: 'var(--color-text)',
                                backgroundColor: 'var(--color-surface)',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                </div>

                {/* Clear Filters */}
                <Button
                    variant="ghost"
                    onClick={clearFilters}
                    disabled={!filters.search && filters.status === 'All' && filters.batchId === 'all' && !filters.fromDate && !filters.toDate}
                    style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}
                >
                    <X size={16} style={{ marginRight: '4px' }} />
                    Clear
                </Button>
            </div>
        </div>
    )
}
