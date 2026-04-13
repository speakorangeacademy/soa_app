'use client'

import React, { useState } from 'react'
import {
    Sheet,
    SheetContent,
    Badge,
    Card,
    CardContent
} from "@/components/common/ui"
import { CheckCircle2, XCircle, Clock, CreditCard, Calendar, User, BookOpen, Hash, X, XOctagon } from 'lucide-react'
import { PaymentRejectionModal } from '@/components/admin/PaymentRejectionModal'

interface PaymentDetailModalProps {
    isOpen: boolean
    onClose: () => void
    payment: any
    /** Called after any action (reject) so the parent list can refetch. */
    onActionComplete?: () => void
}

export default function PaymentDetailModal({
    isOpen,
    onClose,
    payment,
    onActionComplete,
}: PaymentDetailModalProps) {
    const [rejectionModalOpen, setRejectionModalOpen] = useState(false)

    if (!payment) return null

    const statusConfig = {
        'Approved': { color: 'text-success', bgColor: 'bg-success/10', icon: CheckCircle2 },
        'Rejected': { color: 'text-danger',  bgColor: 'bg-danger/10',  icon: XCircle },
        'Pending':  { color: 'text-warning', bgColor: 'bg-warning/10', icon: Clock },
    }

    const config = statusConfig[payment.status as keyof typeof statusConfig] || statusConfig['Pending']
    const StatusIcon = config.icon
    const isPending = payment.status === 'Pending'

    function handleRejectionSuccess() {
        setRejectionModalOpen(false)
        onClose()                  // close the detail sheet
        onActionComplete?.()       // trigger refetch in the parent
    }

    return (
        <>
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent className="overflow-y-auto" style={{ maxWidth: '500px' }}>
                    {/* Header */}
                    <div className="flex flex-row items-center justify-between border-b pb-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-full ${config.bgColor} ${config.color}`}>
                                <StatusIcon size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-heading leading-tight">Payment Details</h2>
                                <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                                    Transaction ID:{' '}
                                    <span className="font-mono bg-bg px-1.5 py-0.5 rounded border border-border">
                                        {payment.transaction_id}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-muted hover:text-danger tap-target"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Amount & Status */}
                        <Card className="bg-bg/50 border-none shadow-none">
                            <CardContent className="p-5 flex flex-col gap-1">
                                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                                    Total Amount Paid
                                </span>
                                <div className="flex justify-between items-end">
                                    <h1 className="text-4xl font-heading font-bold text-text">
                                        ₹{payment.amount?.toLocaleString()}
                                    </h1>
                                    <Badge
                                        variant={
                                            payment.status === 'Approved'
                                                ? 'success'
                                                : payment.status === 'Rejected'
                                                ? 'destructive'
                                                : 'warning'
                                        }
                                        className="px-3 py-1"
                                    >
                                        {payment.status}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Student Info */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-muted uppercase tracking-widest border-l-2 border-primary pl-3">
                                Student Information
                            </h4>
                            <div className="grid gap-3">
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-border/50">
                                    <User size={18} className="text-primary mt-1" />
                                    <div>
                                        <p className="font-heading font-semibold text-text">{payment.student_name}</p>
                                        <p className="text-sm text-muted">Parent: {payment.parent_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-border/50">
                                    <BookOpen size={18} className="text-primary mt-1" />
                                    <div>
                                        <p className="font-heading font-semibold text-text">{payment.course_name}</p>
                                        <p className="text-sm text-muted">Batch: {payment.batch_name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transaction Details */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-muted uppercase tracking-widest border-l-2 border-primary pl-3">
                                Transaction Details
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-surface border border-border/50">
                                    <div className="flex items-center gap-2 mb-1 text-muted">
                                        <Calendar size={14} />
                                        <span className="text-[10px] font-bold uppercase">Date</span>
                                    </div>
                                    <p className="font-medium text-text">
                                        {new Date(payment.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-surface border border-border/50">
                                    <div className="flex items-center gap-2 mb-1 text-muted">
                                        <CreditCard size={14} />
                                        <span className="text-[10px] font-bold uppercase">Method</span>
                                    </div>
                                    <p className="font-medium text-text">{payment.method}</p>
                                </div>
                                {payment.receipt_no && (
                                    <div className="p-3 rounded-lg bg-surface border border-border/50 col-span-2">
                                        <div className="flex items-center gap-2 mb-1 text-muted">
                                            <Hash size={14} />
                                            <span className="text-[10px] font-bold uppercase">Receipt Number</span>
                                        </div>
                                        <p className="font-mono font-medium text-text">{payment.receipt_no}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Actions — only shown for Pending payments ─────── */}
                        {isPending && (
                            <div className="border-t border-border pt-5 mt-2">
                                <p className="text-xs font-bold text-muted uppercase tracking-widest border-l-2 border-primary pl-3 mb-4">
                                    Actions
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setRejectionModalOpen(true)}
                                    className="
                                        w-full h-[44px] flex items-center justify-center gap-2
                                        border border-danger/30 text-danger bg-danger/5
                                        font-semibold rounded-xl hover:bg-danger hover:text-white
                                        active:scale-[0.98] transition-all
                                    "
                                >
                                    <XOctagon size={17} />
                                    Reject Payment
                                </button>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Rejection modal — rendered outside the Sheet so z-index stacks correctly */}
            <PaymentRejectionModal
                isOpen={rejectionModalOpen}
                onClose={() => setRejectionModalOpen(false)}
                paymentId={payment.id}
                studentName={payment.student_name}
                onSuccess={handleRejectionSuccess}
            />
        </>
    )
}
