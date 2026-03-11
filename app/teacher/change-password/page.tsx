'use client'

import { useState } from 'react'
import { updateTeacherPassword } from '@/app/auth/actions'
import { AlertCircle, Lock, ShieldCheck, ArrowRight } from 'lucide-react'

export default function ChangePasswordPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        const result = await updateTeacherPassword(formData)
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex-center container">
            <div className="card animate-fade-up delay-1" style={{ width: '100%', maxWidth: '440px' }}>
                <div className="text-center mb-8 delay-2 animate-fade-up">
                    <div style={{ background: 'rgba(255, 140, 66, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 1.5rem', color: 'var(--color-primary)' }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Set New Password</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>This is your first login. Please set a secure password to continue to your dashboard.</p>
                </div>

                <form action={handleSubmit} className="delay-3 animate-fade-up">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                            New Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Minimum 8 characters"
                                required
                                minLength={8}
                                className={error ? 'error' : ''}
                                style={{ paddingLeft: '2.75rem' }}
                            />
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                                <Lock size={18} />
                            </span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                            Confirm Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Re-enter password"
                                required
                                minLength={8}
                                className={error ? 'error' : ''}
                                style={{ paddingLeft: '2.75rem' }}
                            />
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                                <Lock size={18} />
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="error-text" style={{ marginBottom: '1.5rem' }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Updating Password...' : (
                            <>
                                Save & Continue
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
