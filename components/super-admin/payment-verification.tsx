'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    CheckCircle,
    XSquare,
    Eye,
    ExternalLink,
    AlertCircle,
    Search,
    Maximize2,
    X,
    Clock,
    User,
    CreditCard,
    Calendar
} from 'lucide-react'
import { PaymentWithDetails, RejectionFormData, rejectionSchema } from '@/types/admin-payment'
import { Modal, Badge } from '@/components/common/ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export default function PaymentVerificationDashboard() {
    const queryClient = useQueryClient()
    const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)
    const [rejectingPayment, setRejectingPayment] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    // 1. Data Fetching
    const { data: payments, isLoading, error } = useQuery<PaymentWithDetails[]>({
        queryKey: ['admin', 'payments', 'pending'],
        queryFn: async () => {
            const res = await fetch('/api/admin/payments?status=Pending')
            if (!res.ok) throw new Error('Failed to fetch')
            return res.json()
        }
    })

    // 2. Mutations
    const approveMutation = useMutation({
        mutationFn: async (id: string) => {
            // We fetch the session once to get the admin_id
            const sessionRes = await fetch('/api/auth/session');
            const sessionData = await sessionRes.json();
            const admin_id = sessionData.session?.user?.id;

            const res = await fetch(`/api/payments/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payment_id: id,
                    action: 'approve',
                    admin_id: admin_id
                })
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Approval failed')
            }
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'payments', 'pending'] })
        }
    })

    const rejectMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: string, reason: string }) => {
            const sessionRes = await fetch('/api/auth/session');
            const sessionData = await sessionRes.json();
            const admin_id = sessionData.session?.user?.id;

            const res = await fetch(`/api/payments/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payment_id: id,
                    rejection_reason: reason,
                    admin_id: admin_id
                })
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Rejection failed')
            }
            return res.json()
        },
        onSuccess: () => {
            setRejectingPayment(null)
            queryClient.invalidateQueries({ queryKey: ['admin', 'payments', 'pending'] })
        }
    })

    // 3. Form Handling (Rejection)
    const { register, handleSubmit, reset, formState: { errors } } = useForm<RejectionFormData>({
        resolver: zodResolver(rejectionSchema)
    })

    const onRejectSubmit = (data: RejectionFormData) => {
        if (rejectingPayment) {
            rejectMutation.mutate({ id: rejectingPayment, reason: data.rejection_reason })
        }
    }

    const filteredPayments = payments?.filter(p =>
        p.student_full_name.toLowerCase().includes(search.toLowerCase()) ||
        p.transaction_id.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="animate-fade-up">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Payment Verification</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Review and process student payment submissions for admission.</p>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', gap: '1rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        placeholder="Search by student name or transaction ID..."
                        style={{ paddingLeft: '2.5rem' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: 'rgba(240, 228, 215, 0.3)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 10 }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Student & Course</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Amount</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Transaction Details</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Proof</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <td colSpan={6} style={{ padding: '1.5rem' }}><div className="skeleton" style={{ height: '40px', background: 'var(--color-border)', opacity: 0.2 }}></div></td>
                                    </tr>
                                ))
                            ) : filteredPayments?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        {search ? 'No payments match your search.' : 'No pending payments to verify.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments?.map((payment, index) => (
                                    <tr key={payment.payment_id} className="table-row" style={{ borderBottom: '1px solid var(--color-border)', transition: '0.2s', animationDelay: `${index * 60}ms` }}>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <User size={14} style={{ color: 'var(--color-text-muted)' }} />
                                                {payment.student_full_name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '0.25rem' }}>
                                                {payment.course_name} • {payment.batch_name}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ fontWeight: 700 }}>₹{payment.fee_amount.toLocaleString('en-IN')}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{payment.payment_method}</div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                                <CreditCard size={14} style={{ color: 'var(--color-text-muted)' }} />
                                                {payment.transaction_id}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                                <Calendar size={12} />
                                                {payment.payment_date}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <button
                                                onClick={() => setSelectedScreenshot(payment.screenshot_url || null)}
                                                style={{ padding: '6px 10px', background: 'none', color: 'var(--color-primary)', border: '1px solid var(--color-border)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', minHeight: 'unset' }}
                                            >
                                                <Eye size={14} /> View
                                            </button>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <Badge variant="warning">
                                                <Clock size={12} style={{ marginRight: '4px' }} />
                                                Pending
                                            </Badge>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => approveMutation.mutate(payment.payment_id)}
                                                    disabled={approveMutation.isPending}
                                                    style={{ minHeight: '36px', padding: '0 12px', fontSize: '0.75rem', backgroundColor: 'var(--color-success)' }}
                                                >
                                                    <CheckCircle size={14} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => setRejectingPayment(payment.payment_id)}
                                                    style={{ minHeight: '36px', padding: '0 12px', fontSize: '0.75rem', backgroundColor: 'var(--color-danger)' }}
                                                >
                                                    <XSquare size={14} /> Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Screenshot Viewer Modal */}
            <Modal
                isOpen={!!selectedScreenshot}
                onClose={() => setSelectedScreenshot(null)}
                title="Payment Screenshot Proof"
            >
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                    {selectedScreenshot && (
                        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#000' }}>
                            <img
                                src={selectedScreenshot}
                                alt="Payment Proof"
                                style={{ maxWidth: '100%', display: 'block', margin: '0 auto', transition: 'transform 0.3s' }}
                            />
                        </div>
                    )}
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <a
                            href={selectedScreenshot || '#'}
                            target="_blank"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600 }}
                        >
                            <ExternalLink size={16} /> Open in New Tab
                        </a>
                    </div>
                </div>
            </Modal>

            {/* Rejection Modal */}
            <Modal
                isOpen={!!rejectingPayment}
                onClose={() => { setRejectingPayment(null); reset(); }}
                title="Reject Payment Submission"
            >
                <form onSubmit={handleSubmit(onRejectSubmit)} className="space-y-6">
                    <div style={{ backgroundColor: 'rgba(229, 57, 53, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(229, 57, 53, 0.1)', display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <AlertCircle size={20} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text)' }}>
                            You are rejecting this payment. The student will be notified and asked to resubmit.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Rejection Reason (Student will see this)</label>
                        <textarea
                            {...register('rejection_reason')}
                            placeholder="e.g. Transaction ID does not match, or Screenshot is blurred."
                            style={{ minHeight: '120px', resize: 'vertical' }}
                            className={errors.rejection_reason ? 'error' : ''}
                        />
                        {errors.rejection_reason && <p className="error-text">{errors.rejection_reason.message}</p>}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                        <button
                            type="button"
                            onClick={() => { setRejectingPayment(null); reset(); }}
                            style={{ background: 'none', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={rejectMutation.isPending}
                            style={{ backgroundColor: 'var(--color-danger)' }}
                        >
                            {rejectMutation.isPending ? 'Processing...' : 'Confirm Rejection'}
                        </button>
                    </div>
                </form>
            </Modal>

            <style jsx>{`
        .table-row:hover { background-color: rgba(255, 140, 66, 0.03); }
        .skeleton { width: 100%; border-radius: 4px; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.1; } 50% { opacity: 0.3; } 100% { opacity: 0.1; } }
      `}</style>
        </div>
    )
}
