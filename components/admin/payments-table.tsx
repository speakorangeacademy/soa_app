'use client'

import React, { useState } from 'react'
import { CheckCircle2, XCircle, Clock, Eye, AlertCircle, ChevronLeft, ChevronRight, Hash } from 'lucide-react'
import { Badge, Button } from "@/components/common/ui"
import PaymentDetailModal from '@/components/admin/payment-detail-modal'

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

interface PaymentsTableProps {
    payments: Payment[]
    isLoading: boolean
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
    onPageChange: (page: number) => void
    /** Triggered after any action (approve/reject) — use this to refetch the list. */
    onActionComplete?: () => void
}

export default function PaymentsTable({ payments, isLoading, pagination, onPageChange, onActionComplete }: PaymentsTableProps) {
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleViewDetails = (payment: Payment) => {
        setSelectedPayment(payment)
        setIsModalOpen(true)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Approved':
                return <Badge variant="success">Approved</Badge>
            case 'Rejected':
                return <Badge variant="destructive">Rejected</Badge>
            default:
                return <Badge variant="warning">Pending</Badge>
        }
    }

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                        <tr>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Date</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Student</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Course / Batch</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Txn ID</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Method</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Amount</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td colSpan={8} style={{ padding: '1rem' }}>
                                        <div className="skeleton-row" style={{ height: '40px', width: '100%', borderRadius: '4px', backgroundColor: 'var(--color-bg)', animation: 'pulse 1.5s infinite' }} />
                                    </td>
                                </tr>
                            ))
                        ) : payments.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                                    <p>No payments found matching your criteria.</p>
                                </td>
                            </tr>
                        ) : (
                            payments.map((payment) => (
                                <tr key={payment.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.2s' }} className="table-row">
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                        {new Date(payment.date).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{payment.student_name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{payment.parent_name}</p>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <p style={{ fontSize: '0.875rem' }}>{payment.course_name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{payment.batch_name}</p>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <code style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                                            {payment.transaction_id}
                                        </code>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{payment.method}</td>
                                    <td style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>
                                        ₹{payment.amount.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {getStatusBadge(payment.status)}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleViewDetails(payment)}
                                            style={{ color: 'var(--color-text-muted)' }}
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!isLoading && payments.length > 0 && (
                <div style={{
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)'
                }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                            variant="outline"
                            disabled={pagination.page <= 1}
                            onClick={() => onPageChange(pagination.page - 1)}
                            style={{ padding: '8px 12px' }}
                        >
                            <ChevronLeft size={16} /> Previous
                        </Button>
                        <Button
                            variant="outline"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => onPageChange(pagination.page + 1)}
                            style={{ padding: '8px 12px' }}
                        >
                            Next <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            )}

            <PaymentDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                payment={selectedPayment}
                onActionComplete={() => {
                    setIsModalOpen(false)
                    onActionComplete?.()
                }}
            />

            <style jsx>{`
                .table-row:hover {
                    background-color: var(--color-bg);
                }
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.8; }
                    100% { opacity: 0.6; }
                }
            `}</style>
        </div>
    )
}
