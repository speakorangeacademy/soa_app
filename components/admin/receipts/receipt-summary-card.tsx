'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/ui'
import { Badge } from '@/components/common/ui'
import { FileText, User, Book, Layers, CreditCard, Calendar } from 'lucide-react'

interface ReceiptSummaryProps {
    receipt: {
        receipt_number: string
        student: { student_full_name: string }
        course_name: string
        batch_name: string
        amount_paid: number
        payment_date: string
        status: string
    }
}

export default function ReceiptSummaryCard({ receipt }: ReceiptSummaryProps) {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    }

    return (
        <Card className="animate-fade-up">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="text-[var(--color-primary)]" size={24} />
                    <CardTitle>Receipt Summary</CardTitle>
                </div>
                <Badge variant={receipt.status === 'Cancelled' ? 'danger' : 'success'}>
                    {receipt.status}
                </Badge>
            </CardHeader>
            <CardContent>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>

                    {/* Receipt Number */}
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1">
                            <Layers size={14} /> Receipt ID
                        </span>
                        <span className="text-lg font-medium">{receipt.receipt_number}</span>
                    </div>

                    {/* Student Name */}
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1">
                            <User size={14} /> Student
                        </span>
                        <span className="text-lg font-medium">{receipt.student.student_full_name}</span>
                    </div>

                    {/* Course */}
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1">
                            <Book size={14} /> Course
                        </span>
                        <span className="text-lg font-medium">{receipt.course_name}</span>
                    </div>

                    {/* Batch */}
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1">
                            <Layers size={14} /> Batch
                        </span>
                        <span className="text-lg font-medium">{receipt.batch_name}</span>
                    </div>

                    {/* Amount */}
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1">
                            <CreditCard size={14} /> Amount Paid
                        </span>
                        <span className="text-lg font-bold text-[var(--color-success)]">{formatCurrency(receipt.amount_paid)}</span>
                    </div>

                    {/* Date */}
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1">
                            <Calendar size={14} /> Payment Date
                        </span>
                        <span className="text-lg font-medium">{formatDate(receipt.payment_date)}</span>
                    </div>

                </div>
            </CardContent>
        </Card>
    )
}
