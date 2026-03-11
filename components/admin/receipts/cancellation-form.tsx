'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/ui'
import { Button, Textarea } from '@/components/common/ui'
import { AlertCircle, Trash2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CancellationFormProps {
    receiptId: string
    isCancelled: boolean
}

export default function CancellationForm({ receiptId, isCancelled }: CancellationFormProps) {
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (reason.trim().length < 5) {
            setError('Please provide a valid reason (minimum 5 characters).')
            return
        }

        if (!confirm('Are you certain you want to cancel this receipt? This action is immutable and will be logged.')) {
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/admin/receipts/${receiptId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to cancel receipt.')
            }

            setSuccess(true)
            router.refresh() // Refresh page to show updated status
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (isCancelled || success) {
        return (
            <Card className="border-[var(--color-success)] bg-[rgba(76,175,80,0.05)] animate-fade-up delay-2">
                <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
                    <CheckCircle2 size={48} className="text-[var(--color-success)]" />
                    <div className="text-center">
                        <CardTitle className="text-[var(--color-success)] mb-2">Receipt Cancelled</CardTitle>
                        <CardDescription>
                            This receipt has been marked as cancelled and an audit log has been created.
                        </CardDescription>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-[var(--color-danger)] animate-fade-up delay-2">
            <CardHeader>
                <div className="flex items-center gap-2 text-[var(--color-danger)] mb-1">
                    <AlertCircle size={20} />
                    <CardTitle>Cancel Receipt</CardTitle>
                </div>
                <CardDescription>
                    Provide a reason for cancellation. This action cannot be undone.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[var(--color-text-muted)]">
                            Cancellation Reason
                        </label>
                        <Textarea
                            placeholder="e.g., Wrong student selected, duplicated payment..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={loading}
                            required
                        />
                        {error && (
                            <p className="text-sm text-[var(--color-danger)] flex items-center gap-1 mt-1">
                                <AlertCircle size={14} /> {error}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        variant="danger"
                        disabled={loading || reason.trim().length < 5}
                        className="w-full md:w-auto self-end"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <Trash2 size={18} /> Cancel Receipt
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
