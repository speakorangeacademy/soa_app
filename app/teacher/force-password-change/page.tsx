'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ShieldAlert, Lock, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Validation Schema
const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string()
        .min(8, "New password must be at least 8 characters")
        .refine(val => /[A-Z]/.test(val), "Must include an uppercase letter")
        .refine(val => /[a-z]/.test(val), "Must include a lowercase letter")
        .refine(val => /[0-9]/.test(val), "Must include a number"),
    confirmPassword: z.string().min(1, "Please confirm your password")
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
}).refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"]
})

type FormValues = z.infer<typeof changePasswordSchema>

export default function ForcePasswordChangePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormValues>({
        resolver: zodResolver(changePasswordSchema)
    })

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/teacher/force-password-change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Password update failed')
            }

            setSuccess(true)
            setTimeout(() => {
                router.push('/teacher/dashboard')
            }, 2000)
        } catch (err: any) {
            setError(err.message)
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex-center container">
                <div className="card text-center animate-fade-up" style={{ maxWidth: '440px' }}>
                    <div style={{ color: 'var(--color-success)', marginBottom: '1.5rem' }}>
                        <CheckCircle2 size={64} style={{ margin: '0 auto' }} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Password Updated!</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                        Your new password has been set successfully. You are being redirected to your dashboard...
                    </p>
                    <Loader2 className="animate-spin" style={{ margin: '0 auto', color: 'var(--color-primary)' }} />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex-center container">
            <div className="card animate-fade-up" style={{ width: '100%', maxWidth: '440px' }}>
                <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ color: 'var(--color-warning)', backgroundColor: 'rgba(255, 193, 7, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <ShieldAlert size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', color: 'var(--color-text)' }}>Set Your New Password</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                        For your security, you must change the temporary password provided by your administrator.
                    </p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Current Password */}
                    <div className="form-group">
                        <label>Current Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                            <input
                                {...register('currentPassword')}
                                type="password"
                                placeholder="Enter temporary password"
                                style={{ paddingLeft: '40px' }}
                                className={errors.currentPassword ? 'error' : ''}
                            />
                        </div>
                        {errors.currentPassword && <p className="error-text"><AlertCircle size={14} /> {errors.currentPassword.message}</p>}
                    </div>

                    {/* New Password */}
                    <div className="form-group">
                        <label>New Secure Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                            <input
                                {...register('newPassword')}
                                type="password"
                                placeholder="Min 8 chars, A-Z, a-z, 0-9"
                                style={{ paddingLeft: '40px' }}
                                className={errors.newPassword ? 'error' : ''}
                            />
                        </div>
                        {errors.newPassword && <p className="error-text"><AlertCircle size={14} /> {errors.newPassword.message}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                            <input
                                {...register('confirmPassword')}
                                type="password"
                                placeholder="Repeat your new password"
                                style={{ paddingLeft: '40px' }}
                                className={errors.confirmPassword ? 'error' : ''}
                            />
                        </div>
                        {errors.confirmPassword && <p className="error-text"><AlertCircle size={14} /> {errors.confirmPassword.message}</p>}
                    </div>

                    {error && (
                        <div className="alert-error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{ marginTop: '0.5rem' }}
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Update Password
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>

            <style jsx>{`
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--color-text-muted);
                }
                .alert-error {
                    padding: 0.75rem;
                    background-color: rgba(229, 57, 53, 0.05);
                    border: 1px solid var(--color-danger);
                    border-radius: 4px;
                    color: var(--color-danger);
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    )
}
