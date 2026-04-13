'use client'

import React, { useState, useRef } from 'react'
import { Upload, ImageIcon, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface ReuploadProofFormProps {
    paymentId: string
    /** Called after the server confirms the re-upload so the dashboard can refetch. */
    onSuccess: () => void
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export function ReuploadProofForm({ paymentId, onSuccess }: ReuploadProofFormProps) {
    const [screenshot, setScreenshot] = useState<File | null>(null)
    const [transactionId, setTransactionId] = useState('')
    const [dragOver, setDragOver] = useState(false)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    function validateAndSetFile(file: File) {
        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error('Only JPG, PNG, or WEBP files are allowed.')
            return
        }
        if (file.size > MAX_BYTES) {
            toast.error('File must be under 5 MB.')
            return
        }
        setScreenshot(file)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!screenshot) {
            toast.error('Please attach your payment screenshot.')
            return
        }
        if (!transactionId.trim()) {
            toast.error('Transaction / UTR ID is required.')
            return
        }

        setLoading(true)

        const formData = new FormData()
        formData.append('payment_id', paymentId)
        formData.append('transaction_id', transactionId.trim())
        // Send today's date — the original payment date is stale since this is a new submission
        formData.append('payment_date', new Date().toISOString().split('T')[0])
        formData.append('screenshot', screenshot)

        try {
            const res = await fetch('/api/payments/reupload', {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || 'Re-upload failed. Please try again.')
            } else {
                toast.success('Proof re-submitted! Your payment is now under review.')
                onSuccess()
            }
        } catch {
            toast.error('An unexpected error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-4 p-5 bg-bg border border-border rounded-2xl space-y-4"
        >
            <p
                className="text-sm font-bold text-text"
                style={{ fontFamily: 'Outfit, sans-serif' }}
            >
                Re-submit Payment Proof
            </p>

            {/* ── Screenshot drop zone ──────────────────────────────────── */}
            <div
                role="button"
                tabIndex={0}
                aria-label="Upload payment screenshot"
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault()
                    setDragOver(false)
                    const file = e.dataTransfer.files[0]
                    if (file) validateAndSetFile(file)
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    relative flex flex-col items-center justify-center gap-2
                    p-6 border-2 border-dashed rounded-xl cursor-pointer
                    transition-all select-none
                    ${dragOver
                        ? 'border-primary bg-primary/5'
                        : screenshot
                        ? 'border-success/60 bg-success/5'
                        : 'border-border hover:border-primary/50 hover:bg-bg/80'
                    }
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) validateAndSetFile(file)
                        // Reset value so the same file can be re-selected after removal
                        e.target.value = ''
                    }}
                />

                {screenshot ? (
                    <>
                        <CheckCircle2 size={28} className="text-success" />
                        <p className="text-sm font-medium text-success text-center break-all">
                            {screenshot.name}
                        </p>
                        <p className="text-xs text-muted">Click to replace</p>
                    </>
                ) : (
                    <>
                        <ImageIcon size={28} className="text-muted" />
                        <p className="text-sm text-muted text-center">
                            Drag & drop or <span className="text-primary font-semibold">click to upload</span>
                        </p>
                        <p className="text-xs text-muted">JPG, PNG, WEBP · Max 5 MB</p>
                    </>
                )}
            </div>

            {/* ── Transaction / UTR ID ──────────────────────────────────── */}
            <div className="space-y-1.5">
                <label
                    htmlFor="reupload-txn-id"
                    className="block text-sm font-semibold text-text"
                >
                    Transaction / UTR ID
                </label>
                <input
                    id="reupload-txn-id"
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 407812345678"
                    disabled={loading}
                    className="
                        w-full px-4 py-3 bg-surface border border-border rounded-xl
                        text-sm text-text placeholder:text-muted/50
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                        transition-all disabled:opacity-60
                    "
                />
            </div>

            {/* ── Submit ───────────────────────────────────────────────── */}
            <button
                type="submit"
                disabled={loading || !screenshot || !transactionId.trim()}
                className="
                    w-full h-[44px] flex items-center justify-center gap-2
                    bg-primary text-white font-semibold rounded-xl
                    shadow-sm shadow-primary/20
                    hover:bg-accent active:scale-[0.98] transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                "
            >
                {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <>
                        <Upload size={16} />
                        Re-submit for Verification
                    </>
                )}
            </button>
        </form>
    )
}
