'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, Input, Select, Button, Label } from '@/components/common/ui'
import { Search, RotateCcw } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const ACTION_TYPES = [
    'All',
    'PAYMENT_APPROVED',
    'PAYMENT_REJECTED',
    'BATCH_ALLOCATED',
    'RECEIPT_GENERATED',
    'RECEIPT_CANCELLED',
    'TEACHER_ASSIGNED',
    'BATCH_REALLOCATED'
]

const ENTITY_TYPES = [
    'All',
    'payment',
    'receipt',
    'batch',
    'student'
]

export function FilterBar() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [actionType, setActionType] = useState(searchParams.get('action_type') || 'All')
    const [entityType, setEntityType] = useState(searchParams.get('entity_type') || 'All')
    const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '')
    const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '')

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            updateQueryParams({ search: search || null })
        }, 300)
        return () => clearTimeout(timer)
    }, [search])

    const updateQueryParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === 'All' || value === '') {
                params.delete(key)
            } else {
                params.set(key, value)
            }
        })
        // Reset to page 1 on filter change
        if (Object.keys(updates).some(k => k !== 'page')) {
            params.set('page', '1')
        }
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleReset = () => {
        setSearch('')
        setActionType('All')
        setEntityType('All')
        setDateFrom('')
        setDateTo('')
        router.push(pathname)
    }

    return (
        <Card className="mb-8">
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <Label>Search</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
                            <Input
                                placeholder="Search by entity ID or user ID"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Action Type */}
                    <div>
                        <Label>Action Type</Label>
                        <Select value={actionType} onChange={(e) => {
                            setActionType(e.target.value)
                            updateQueryParams({ action_type: e.target.value })
                        }}>
                            {ACTION_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </Select>
                    </div>

                    {/* Entity Type */}
                    <div>
                        <Label>Entity Type</Label>
                        <Select value={entityType} onChange={(e) => {
                            setEntityType(e.target.value)
                            updateQueryParams({ entity_type: e.target.value })
                        }}>
                            {ENTITY_TYPES.map(type => (
                                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                            ))}
                        </Select>
                    </div>

                    {/* Date From */}
                    <div>
                        <Label>Date From</Label>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => {
                                setDateFrom(e.target.value)
                                updateQueryParams({ date_from: e.target.value })
                            }}
                        />
                    </div>

                    {/* Date To */}
                    <div>
                        <Label>Date To</Label>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => {
                                setDateTo(e.target.value)
                                updateQueryParams({ date_to: e.target.value })
                            }}
                        />
                    </div>

                    {/* Reset Button */}
                    <div className="flex items-end">
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            className="w-full h-[46px]"
                        >
                            <RotateCcw size={18} />
                            Reset Filters
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
