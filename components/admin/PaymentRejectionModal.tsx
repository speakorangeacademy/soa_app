'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// ── Preset rejection reasons ────────────────────────────────────────────────
// "Other" is always last — it triggers the free-text textarea.
const PRESET_REASONS = [
    'Blurry Image',
    'Amount Mismatch',
    'Invalid Transaction ID',
    'Wrong Payment Details',
    'Other',
] as const

type PresetReason = typeof PRESET_REASONS[number]

interface PaymentRejectionModalProps {
    isOpen: boolean
    onClose: () => void
    paymentId: string
    studentName: string
    /** Called after the server confirms the rejection so the parent can refetch. */
    onSuccess: () => void
}

export function PaymentRejectionModal({
    isOpen,
    onClose,
    paymentId,
    studentName,
    onSuccess,
}: PaymentRejectionModalProps) {
    const [selectedPreset, setSelectedPreset] = useState<PresetReason | null>(null)
    const [customReason, setCustomReason] = useState('')
    const [allowReupload, setAllowReupload] = useState(true)
    const [loading, setLoading] = useState(false)

    // The final reason sent to the API — preset label OR the custom text
    const finalReason =
        selectedPreset === 'Other' ? customReason.trim() : selectedPreset ?? ''

    const isValid = finalReason.length >= 10

    function resetState() {
        setSelectedPreset(null)
        setCustomReason('')
        setAllowReupload(true)
    }

    function handleClose() {
        if (loading) return
        resetState()
        onClose()
    }

    async function handleSubmit() {
        if (!isValid) return
        setLoading(true)

        try {
            const res = await fetch(`/api/admin/payments/${paymentId}/reject`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rejection_reason: finalReason,
                    allow_reupload: allowReupload,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || 'Rejection failed. Please try again.')
            } else {
                toast.success('Payment rejected. Student has been notified by email.')
                resetState()
                onSuccess()
                onClose()
            }
        } catch {
            toast.error('An unexpected error occurred.')
        } finally {
            setLoading(false)
        }
    }

    // "Other" preset: user needs to type at least 10 chars
    const customTooShort =
        selectedPreset === 'Other' &&
        customReason.length > 0 &&
        customReason.trim().length < 10

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Reject Payment"
            description={`Student: ${studentName}`}
            maxWidth="max-w-lg"
        >
            <div className="space-y-5">

                {/* ── Warning banner ─────────────────────────────────────── */}
                <div className="flex items-start gap-3 p-3.5 bg-danger/5 border border-danger/20 rounded-xl">
                    <AlertTriangle size={17} className="text-danger shrink-0 mt-0.5" />
                    <p className="text-sm text-danger leading-snug">
                        The student will be notified by email with the exact reason below.
                    </p>
                </div>

                {/* ── Preset reason pills ────────────────────────────────── */}
                <div className="space-y-2">
                    <p className="text-sm font-semibold text-text">Rejection Reason</p>
                    <div className="flex flex-wrap gap-2">
                        {PRESET_REASONS.map((reason) => (
                            <button
                                key={reason}
                                type="button"
                                onClick={() => setSelectedPreset(reason)}
                                className={`
                                    px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all
                                    ${selectedPreset === reason
                                        ? 'bg-danger text-white border-danger shadow-sm'
                                        : 'bg-surface text-text border-border hover:border-danger/50 hover:text-danger'
                                    }
                                `}
                            >
                                {reason}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Custom reason textarea — only for "Other" ──────────── */}
                {selectedPreset === 'Other' && (
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-text">
                            Describe the issue
                        </label>
                        <textarea
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            rows={3}
                            placeholder="Explain the specific problem (min 10 characters)…"
                            className={`
                                w-full px-4 py-3 bg-surface border rounded-xl text-sm text-text
                                placeholder:text-muted/50 focus:outline-none focus:ring-2
                                focus:ring-primary/20 focus:border-primary transition-all resize-none
                                ${customTooShort ? 'border-danger' : 'border-border'}
                            `}
                        />
                        {customTooShort && (
                            <p className="text-xs text-danger">Minimum 10 characters required.</p>
                        )}
                    </div>
                )}

                {/* ── Allow re-upload toggle ─────────────────────────────── */}
                <div className="flex items-center justify-between gap-4 p-4 bg-bg border border-border rounded-xl">
                    <div>
                        <p className="text-sm font-semibold text-text">
                            Allow student to re-upload proof
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                            Student will see a re-upload option on their dashboard.
                        </p>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={allowReupload}
                        onClick={() => setAllowReupload((prev) => !prev)}
                        className={`
                            relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center
                            rounded-full transition-colors focus-visible:outline-none
                            focus-visible:ring-2 focus-visible:ring-primary
                            ${allowReupload ? 'bg-primary' : 'bg-border'}
                        `}
                    >
                        <span
                            className={`
                                pointer-events-none block h-5 w-5 rounded-full bg-white
                                shadow-sm ring-0 transition-transform duration-200
                                ${allowReupload ? 'translate-x-5' : 'translate-x-1'}
                            `}
                        />
                    </button>
                </div>

                {/* ── Actions ───────────────────────────────────────────── */}
                <div className="flex flex-col gap-3 pt-1">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isValid || loading}
                        className="
                            w-full h-[44px] flex items-center justify-center gap-2
                            bg-danger text-white font-semibold rounded-xl
                            hover:opacity-90 active:scale-[0.98] transition-all
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                        "
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            'Reject Payment'
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="
                            w-full h-[44px] bg-border/50 text-text font-medium rounded-xl
                            hover:bg-border transition-all
                            disabled:opacity-60 disabled:cursor-not-allowed
                        "
                    >
                        Cancel
                    </button>
                </div>

            </div>
        </Modal>
    )
}
