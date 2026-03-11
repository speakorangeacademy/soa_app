'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { paymentSubmissionSchema, PaymentSubmissionFormData, PaymentSummary } from '@/types/payment'
import {
    QrCode as QrIcon,
    CreditCard,
    Calendar,
    Upload,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Image as ImageIcon,
    ChevronLeft,
    Info,
    Copy,
    ExternalLink
} from 'lucide-react'
import { Badge, Button } from '@/components/common/ui'

export default function PaymentPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const studentId = params.student_id as string
    const courseId = searchParams.get('course')
    const batchId = searchParams.get('batch')

    const [summary, setSummary] = useState<PaymentSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadFailed, setUploadFailed] = useState(false)
    const [uploadedPath, setUploadedPath] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<PaymentSubmissionFormData>({
        resolver: zodResolver(paymentSubmissionSchema),
        defaultValues: {
            student_id: studentId,
            course_id: courseId || '',
            batch_id: batchId || '',
            payment_method: 'UPI',
            payment_date: new Date().toISOString().split('T')[0]
        }
    })

    useEffect(() => {
        if (studentId && courseId && batchId) {
            fetch(`/api/payment-summary?student_id=${studentId}&course_id=${courseId}&batch_id=${batchId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.error) setError(data.error)
                    else setSummary(data)
                    setLoading(false)
                })
                .catch(() => setError('Failed to load payment details'))
        }
    }, [studentId, courseId, batchId])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (selected) {
            if (selected.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB')
                return
            }
            setFile(selected)
            const reader = new FileReader()
            reader.onloadend = () => setPreview(reader.result as string)
            reader.readAsDataURL(selected)

            // Proactive upload
            setUploading(true)
            setUploadFailed(false)
            setUploadedPath(null)

            const formData = new FormData()
            formData.append('file', selected)
            formData.append('student_id', studentId)

            try {
                const res = await fetch('/api/payments/upload', {
                    method: 'POST',
                    body: formData
                })
                const result = await res.json()
                if (res.ok) {
                    setUploadedPath(result.path)
                } else {
                    console.error('Upload failed:', result.error)
                    setUploadFailed(true)
                }
            } catch (err) {
                console.error('Upload connection error:', err)
                setUploadFailed(true)
            } finally {
                setUploading(false)
            }
        }
    }

    const onSubmit = async (data: PaymentSubmissionFormData) => {
        if (!file) {
            setError('Please upload a payment screenshot')
            return
        }

        setSubmitting(true)
        setError(null)

        const formData = new FormData()
        formData.append('student_id', data.student_id)
        formData.append('course_id', data.course_id)
        formData.append('batch_id', data.batch_id)
        formData.append('transaction_id', data.transaction_id)
        formData.append('payment_date', data.payment_date)
        formData.append('payment_method', data.payment_method)

        if (uploadedPath) {
            formData.append('screenshot_path', uploadedPath)
        } else if (file && !uploadFailed) {
            formData.append('screenshot', file)
        } else if (uploadFailed) {
            formData.append('upload_failed', 'true')
        }

        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                body: formData
            })
            const result = await res.json()
            if (res.ok) {
                setSubmitted(true)
            } else {
                setError(result.error || 'Submission failed')
            }
        } catch (err) {
            setError('Connection error. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="container py-20 text-center">
                <div className="skeleton" style={{ width: '400px', height: '600px', margin: '0 auto', opacity: 0.1 }}></div>
            </div>
        )
    }

    if (submitted) {
        return (
            <div className="container py-20 animate-fade-up">
                <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--color-success)' }}>
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Payment Submitted!</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '1.125rem' }}>
                        Your transaction details and screenshot have been received. Our team will verify the payment within 24-48 hours.
                    </p>
                    <div style={{ marginBottom: '3rem' }}>
                        <Badge variant="warning">Verification Pending</Badge>
                    </div>
                    <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Button onClick={() => router.push('/login')} style={{ width: '100%' }}>
                            Go to Dashboard
                        </Button>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                            A confirmation has been sent to your registered email.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@soa-academy.com'
    const adminWhatsApp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '+91 00000 00000'

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        alert('Copied to clipboard!')
    }

    return (
        <div className="container py-12 px-4 animate-fade-up">
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <button
                    onClick={() => router.back()}
                    style={{ background: 'none', color: 'var(--color-text-muted)', border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', minHeight: 'unset' }}
                >
                    <ChevronLeft size={18} /> Back to Registration
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem', alignItems: 'start' }}>

                    {/* Main Form Area */}
                    <div className="space-y-8">
                        <div className="card" style={{ padding: '2.5rem' }}>
                            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Complete Your Payment</h1>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem' }}>
                                Scan the QR code and upload your transaction details to finalize admission.
                            </p>

                            {error && (
                                <div style={{ padding: '1rem', backgroundColor: 'rgba(229, 57, 53, 0.1)', color: 'var(--color-danger)', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <AlertCircle size={20} />
                                    <p style={{ fontSize: '0.875rem' }}>{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="form-group">
                                    <label className="label">Transaction ID / UTR Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <input {...register('transaction_id')} placeholder="Enter 12-digit UTR or Transaction Ref" style={{ paddingLeft: '2.5rem' }} />
                                        <CreditCard size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                    </div>
                                    {errors.transaction_id && <p className="error-text">{errors.transaction_id.message}</p>}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label className="label">Payment Date</label>
                                        <div style={{ position: 'relative' }}>
                                            <input type="date" {...register('payment_date')} style={{ paddingLeft: '2.5rem' }} />
                                            <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                        </div>
                                        {errors.payment_date && <p className="error-text">{errors.payment_date.message}</p>}
                                    </div>

                                    <div className="form-group">
                                        <label className="label">Payment Method</label>
                                        <select {...register('payment_method')}>
                                            <option value="UPI">UPI (GPay, PhonePe, etc.)</option>
                                            <option value="Bank Transfer">Direct Bank Transfer</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="label">Upload Payment Screenshot</label>

                                    {uploadFailed && (
                                        <div className="animate-fade-up" style={{ marginBottom: '1.5rem', padding: '1.5rem', backgroundColor: 'rgba(255, 193, 7, 0.08)', border: '1px solid var(--color-warning)', borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                                <div style={{ color: 'var(--color-warning)' }}>
                                                    <AlertCircle size={24} />
                                                </div>
                                                <div>
                                                    <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>Upload Failed</h4>
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                                                        We couldn't upload your payment screenshot. You can still submit your registration and send the screenshot manually to the admin.
                                                    </p>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                                <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Email Admin</p>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{adminEmail}</span>
                                                        <button type="button" onClick={() => copyToClipboard(adminEmail)} style={{ padding: '4px', minHeight: 'unset', background: 'none' }}>
                                                            <Copy size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>WhatsApp Admin</p>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{adminWhatsApp}</span>
                                                        <button type="button" onClick={() => copyToClipboard(adminWhatsApp)} style={{ padding: '4px', minHeight: 'unset', background: 'none' }}>
                                                            <Copy size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                                                * Please mention student name in your message for faster verification.
                                            </p>
                                        </div>
                                    )}

                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            border: uploadFailed ? '2px dashed var(--color-warning)' : '2px dashed var(--color-border)',
                                            borderRadius: '8px',
                                            padding: '1.5rem',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            backgroundColor: 'rgba(255, 140, 66, 0.02)',
                                            transition: 'var(--transition-medium)',
                                            minHeight: '180px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                                        {uploading ? (
                                            <div style={{ textAlign: 'center' }}>
                                                <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 1rem' }}></div>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Uploading Screenshot...</p>
                                            </div>
                                        ) : preview ? (
                                            <div style={{ position: 'relative', width: '100%', maxWidth: '200px' }}>
                                                <img src={preview} alt="Screenshot" style={{ width: '100%', borderRadius: '4px' }} />
                                                <div style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: uploadedPath ? 'var(--color-success)' : 'var(--color-danger)', color: 'white', borderRadius: '50%', padding: '4px' }}>
                                                    {uploadedPath ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                                </div>
                                                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>Click to change</p>
                                            </div>
                                        ) : (
                                            <>
                                                <ImageIcon size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                                                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Click to upload screenshot</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>JPG, PNG or WEBP (Max 5MB)</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div style={{ paddingTop: '1.5rem' }}>
                                    <Button type="submit" disabled={submitting || uploading} style={{ width: '100%', height: '52px' }}>
                                        {submitting ? 'Submitting Details...' : (
                                            <>
                                                {uploadFailed ? 'Continue with Manual Screenshot' : 'Submit Payment Details'}
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar Area: QR and Summary */}
                    <div className="space-y-6">
                        {/* QR Card */}
                        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                                <QrIcon size={20} />
                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Scan to Pay</span>
                            </div>

                            {summary?.active_qr ? (
                                <div style={{ display: 'inline-block', padding: '12px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
                                    <img
                                        src={summary.active_qr.public_url}
                                        alt="Payment QR"
                                        style={{ width: '200px', height: '200px' }}
                                    />
                                </div>
                            ) : (
                                <div style={{ padding: '2rem', height: '224px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                                    Loading QR Code...
                                </div>
                            )}

                            <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{summary?.active_qr?.qr_label || 'Official Academy QR'}</p>
                        </div>

                        {/* Fees Summary */}
                        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>Payment Summary</h3>

                            <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Course</span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'right' }}>{summary?.course_name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Batch</span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{summary?.batch_name}</span>
                                </div>
                                <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600 }}>Total Fee</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                                        ₹{summary?.total_fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', padding: '0.75rem', backgroundColor: 'rgba(255, 193, 7, 0.05)', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
                                <Info size={16} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: '2px' }} />
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                                    Please ensure the transaction ID matches your bank/UPI record exactly.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <style jsx>{`
        .form-group { display: flex; flex-direction: column; }
        .label { font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--color-text); }
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
          div[style*="sidebar"] { order: -1; }
        }
      `}</style>
        </div>
    )
}
