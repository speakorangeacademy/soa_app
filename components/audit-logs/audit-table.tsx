'use client'

import React, { useState } from 'react'
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Badge,
    Button,
    Modal,
    Card
} from '@/components/common/ui'
import { Copy, Eye, ChevronLeft, ChevronRight } from 'lucide-react'

interface AuditLog {
    id: string
    user_id: string
    action_type: string
    entity_type: string
    entity_id: string
    details: any
    created_at: string
}

interface AuditTableProps {
    logs: AuditLog[]
    totalCount: number
    currentPage: number
    pageSize: number
    onPageChange: (page: number) => void
    isLoading?: boolean
}

export function AuditTable({
    logs,
    totalCount,
    currentPage,
    pageSize,
    onPageChange,
    isLoading
}: AuditTableProps) {
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const totalPages = Math.ceil(totalCount / pageSize)

    const handleCopy = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        navigator.clipboard.writeText(id)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 1500)
    }

    const getActionVariant = (type: string) => {
        if (type.includes('APPROVED')) return 'success'
        if (type.includes('REJECTED')) return 'danger'
        if (type.includes('CANCELLED')) return 'warning'
        if (type.includes('ALLOCATED') || type.includes('ASSIGNED')) return 'info'
        return 'default'
    }

    if (logs.length === 0 && !isLoading) {
        return (
            <Card className="p-12 text-center">
                <p className="text-[var(--color-text-muted)] text-lg">No audit records found for selected filters.</p>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden border-[var(--color-border)]">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-[var(--color-bg)]">
                            <TableHead className="w-[180px]">Timestamp</TableHead>
                            <TableHead>User ID</TableHead>
                            <TableHead>Action Type</TableHead>
                            <TableHead>Entity Type</TableHead>
                            <TableHead>Entity ID</TableHead>
                            <TableHead className="w-[100px] text-center">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: pageSize }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <TableCell key={j}>
                                            <div className="h-4 bg-[var(--color-border)] animate-pulse rounded w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            logs.map((log) => (
                                <TableRow
                                    key={log.id}
                                    className="cursor-pointer group"
                                    onClick={() => setSelectedLog(log)}
                                >
                                    <TableCell className="font-medium text-[var(--color-text-muted)]">
                                        {new Intl.DateTimeFormat('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false
                                        }).format(new Date(log.created_at))}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {log.user_id.split('-')[0]}...
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getActionVariant(log.action_type)}>
                                            {log.action_type.replace(/_/g, ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        {log.entity_type}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs text-[var(--color-text-muted)]">
                                                {log.entity_id.split('-')[0]}...
                                            </span>
                                            <button
                                                onClick={(e) => handleCopy(log.entity_id, e)}
                                                className={`p-1.5 rounded-md hover:bg-[var(--color-bg)] transition-all duration-150 ${copiedId === log.entity_id ? 'scale-110 text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'}`}
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Eye size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2">
                <p className="text-sm text-[var(--color-text-muted)]">
                    Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1 || isLoading}
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        <ChevronLeft size={16} />
                        Previous
                    </Button>
                    <div className="flex items-center gap-1 mx-2">
                        <span className="text-sm font-medium">Page {currentPage}</span>
                        <span className="text-sm text-[var(--color-text-muted)]">of {totalPages || 1}</span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages || isLoading}
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        Next
                        <ChevronRight size={16} />
                    </Button>
                </div>
            </div>

            {/* JSON Modal */}
            <Modal
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                title="Log Details"
            >
                {selectedLog && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[var(--color-bg)] p-3 rounded-md">
                                <p className="text-xs text-[var(--color-text-muted)] uppercase mb-1">Action Type</p>
                                <p className="font-medium">{selectedLog.action_type}</p>
                            </div>
                            <div className="bg-[var(--color-bg)] p-3 rounded-md">
                                <p className="text-xs text-[var(--color-text-muted)] uppercase mb-1">Timestamp</p>
                                <p className="font-medium">
                                    {new Intl.DateTimeFormat('en-GB', {
                                        dateStyle: 'full',
                                        timeStyle: 'medium'
                                    }).format(new Date(selectedLog.created_at))}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium mb-2">Structured Metadata (JSON)</p>
                            <div className="relative">
                                <pre className="bg-[var(--color-text)] text-white p-4 rounded-lg overflow-x-auto text-xs leading-relaxed font-mono max-h-[400px]">
                                    {JSON.stringify(selectedLog.details, null, 2)}
                                </pre>
                                <button
                                    onClick={(e) => handleCopy(JSON.stringify(selectedLog.details, null, 2), e)}
                                    className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-md transition-all"
                                    title="Copy JSON"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
