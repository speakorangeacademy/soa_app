'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
    AlertCircle,
    Upload,
    CheckCircle2,
    Clock,
    ArrowLeft,
    Loader2,
    Calendar,
    CreditCard,
    FileImage
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Badge } from '@/components/common/ui'

interface ReuploadFormData {
    transaction_id: string
    payment_date: string
    screenshot: FileList
}

export default function PaymentReuploadPage() {
    const { payment_id } = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const supabase = createClient()
    const [preview, setPreview] = useState<string | null>(null)

    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<ReuploadFormData>()

    // 1. Fetch Payment Details — fetch directly via API, no redundant auth check
    const { data: payment, isLoading, error } = useQuery({
        queryKey: ['student', 'payment', payment_id],
        queryFn: async () => {
            const res = await fetch('/api/student/dashboard')
            if (!res.ok) throw new Error('Unauthorized')
            const dashboardData = await res.json()
            const p = dashboardData.payment
            if (p && p.payment_id === payment_id) return p
            // Fallback: fetch directly if dashboard payment doesn't match
            const { data } = await supabase
                .from('payments')
                .select('*, course:courses(course_name)')
                .eq('payment_id', payment_id)
                .single()
            return data
        },
        staleTime: 1000 * 30
    })

    // 2. Pre-fill transaction ID
    useEffect(() => {
        if (payment) {
            setValue('transaction_id', payment.transaction_id)
            setValue('payment_date', payment.payment_date)
        }
    }, [payment, setValue])

    // 3. File Preview
    const screenshotFile = watch('screenshot')
    useEffect(() => {
        if (screenshotFile && screenshotFile.length > 0) {
            const file = screenshotFile[0]
            const reader = new FileReader()
            reader.onloadend = () => setPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }, [screenshotFile])

    // 4. Re-upload Mutation
    const reuploadMutation = useMutation({
        mutationFn: async (data: ReuploadFormData) => {
            const formData = new FormData()
            formData.append('payment_id', payment_id as string)
            formData.append('transaction_id', data.transaction_id)
            formData.append('payment_date', data.payment_date)
            formData.append('screenshot', data.screenshot[0])

            const res = await fetch('/api/payments/reupload', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Submission failed')
            }
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student', 'dashboard'] })
            // Delay redirect to show success state
            setTimeout(() => router.push('/student/dashboard'), 2000)
        }
    })

    const onSubmit = (data: ReuploadFormData) => {
        reuploadMutation.mutate(data)
    }

    if (isLoading) return <LoadingSpinner />

    if (error || (payment && payment.verification_status !== 'Rejected')) {
        return (
            <div className="max-w-lg mx-auto mt-20 p-8 card text-center space-y-4">
                <AlertCircle size={48} color="var(--color-danger)" className="mx-auto" />
                <h2 style={{ fontSize: '1.5rem' }}>Invalid Re-upload Request</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>This payment record is either not rejected or you don't have permission to modify it.</p>
                <button onClick={() => router.push('/student/dashboard')} style={{ margin: '0 auto' }}>Back to Dashboard</button>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
            {/* Header */}
            <button
                onClick={() => router.push('/student/dashboard')}
                style={{
                    background: 'none',
                    color: 'var(--color-text-muted)',
                    padding: '0',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            {/* Rejection Notification Card */}
            <section className="animate-fade-up delay-1">
                <div className="card" style={{ borderColor: 'var(--color-danger)', borderStyle: 'dashed', backgroundColor: 'rgba(229, 57, 53, 0.02)' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ color: 'var(--color-danger)', backgroundColor: 'rgba(229, 57, 53, 0.1)', padding: '10px', borderRadius: '8px' }}>
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', color: 'var(--color-danger)', marginBottom: '0.5rem' }}>Action Required: Payment Rejected</h2>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', fontWeight: 500 }}>Reason from Admin:</p>
                            <p style={{ fontSize: '0.925rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                                "{payment.rejection_remarks || 'No remarks provided. Please re-check your screenshot and transaction ID.'}"
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Re-upload Form Card */}
            <section className="animate-fade-up delay-2">
                <div className="card" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <div style={{ color: 'var(--color-primary)', backgroundColor: 'rgba(255, 140, 66, 0.1)', padding: '8px', borderRadius: '8px' }}>
                            <Upload size={20} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem' }}>Update Payment Details</h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                                    Transaction ID / UTR
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <CreditCard size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-border)' }} />
                                    <input
                                        {...register('transaction_id', { required: 'Transaction ID is required' })}
                                        style={{ paddingLeft: '2.75rem' }}
                                        placeholder="Enter UTR/Transaction ID"
                                    />
                                </div>
                                {errors.transaction_id && <p className="error-text">{errors.transaction_id.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                                    Payment Date
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-border)' }} />
                                    <input
                                        type="date"
                                        {...register('payment_date', { required: 'Payment date is required' })}
                                        style={{ paddingLeft: '2.75rem' }}
                                    />
                                </div>
                                {errors.payment_date && <p className="error-text">{errors.payment_date.message}</p>}
                            </div>
                        </div>

                        {/* File Upload Area */}
                        <div className="space-y-2">
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                                New Payment Screenshot
                            </label>
                            <div
                                style={{
                                    border: '2px dashed var(--color-border)',
                                    borderRadius: '12px',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    backgroundColor: 'var(--color-bg)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'var(--transition-medium)'
                                }}
                                className="hover:border-primary"
                                onClick={() => document.getElementById('screenshot-input')?.click()}
                            >
                                <input
                                    id="screenshot-input"
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    style={{ display: 'none' }}
                                    {...register('screenshot', { required: 'Please upload a new screenshot' })}
                                />

                                {preview ? (
                                    <div className="space-y-3">
                                        <img src={preview} alt="Preview" style={{ maxHeight: '200px', margin: '0 auto', borderRadius: '8px' }} />
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>Click to replace screenshot</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div style={{ color: 'var(--color-border)', margin: '0 auto' }}>
                                            <FileImage size={48} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600 }}>Click to upload new receipt</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Only PNG or JPG (Max 5MB)</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {errors.screenshot && <p className="error-text">{errors.screenshot.message}</p>}
                        </div>

                        {/* Submit Button */}
                        <div style={{ paddingTop: '1rem' }}>
                            {reuploadMutation.isSuccess ? (
                                <div className="animate-fade-up" style={{ padding: '1rem', backgroundColor: 'rgba(76, 175, 80, 0.1)', color: 'var(--color-success)', borderRadius: '8px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                    <CheckCircle2 size={24} />
                                    <span style={{ fontWeight: 600 }}>Re-submitted Successfully! Redirecting...</span>
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={reuploadMutation.isPending}
                                    style={{ width: '100%', height: '3.5rem', fontSize: '1.125rem' }}
                                >
                                    {reuploadMutation.isPending ? (
                                        <Loader2 className="animate-spin" size={24} />
                                    ) : (
                                        'Re-submit for Verification'
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </section>

            {/* Footer Support */}
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    Need help? Contact our support team at <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>it-support@soa.edu</span>
                </p>
            </div>

            <style jsx>{`
        .hover\:border-primary:hover {
          border-color: var(--color-primary) !important;
        }
      `}</style>
        </div>
    )
}

function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
            <p style={{ color: 'var(--color-text-muted)' }}>Loading payment details...</p>
        </div>
    )
}
