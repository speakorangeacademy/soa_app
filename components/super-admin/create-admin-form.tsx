'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    User, Mail, Phone, Shield, Copy, CheckCircle2,
    AlertCircle, RefreshCcw, Loader2
} from 'lucide-react'
import { Modal } from '@/components/common/ui'

// Validation Schema
const adminSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email format"),
    mobile: z.string().regex(/^[0-9]{10,15}$/, "Mobile must be 10-15 digits"),
    role: z.enum(['admin', 'super_admin']),
    password: z.string() // Read-only generated field
})

type AdminFormValues = z.infer<typeof adminSchema>

// Helper to generate a secure random password for UI display
function generatePassword() {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    return Array.from({ length: 12 }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
}

export default function CreateAdminForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [successData, setSuccessData] = useState<{ email: string; pass: string } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = useForm<AdminFormValues>({
        resolver: zodResolver(adminSchema),
        defaultValues: {
            role: 'admin',
            password: generatePassword()
        }
    })

    const currentPassword = watch('password')

    const regeneratePassword = () => {
        setValue('password', generatePassword())
    }

    const onSubmit = async (data: AdminFormValues) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/admin/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create admin')
            }

            setSuccessData({ email: result.email, pass: result.temporary_password })
            reset({
                name: '',
                email: '',
                mobile: '',
                role: 'admin',
                password: generatePassword()
            })
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Full Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            {...register('name')}
                            placeholder="John Doe"
                            style={{ paddingLeft: '40px' }}
                            className={errors.name ? 'error' : ''}
                        />
                    </div>
                    {errors.name && <p className="error-text"><AlertCircle size={14} /> {errors.name.message}</p>}
                </div>

                {/* Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="john@example.com"
                            style={{ paddingLeft: '40px' }}
                            className={errors.email ? 'error' : ''}
                        />
                    </div>
                    {errors.email && <p className="error-text"><AlertCircle size={14} /> {errors.email.message}</p>}
                </div>

                {/* Mobile */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Mobile Number</label>
                    <div style={{ position: 'relative' }}>
                        <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            {...register('mobile')}
                            placeholder="9876543210"
                            style={{ paddingLeft: '40px' }}
                            className={errors.mobile ? 'error' : ''}
                        />
                    </div>
                    {errors.mobile && <p className="error-text"><AlertCircle size={14} /> {errors.mobile.message}</p>}
                </div>

                {/* Role */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Administrative Role</label>
                    <div style={{ position: 'relative' }}>
                        <Shield size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <select
                            {...register('role')}
                            style={{ paddingLeft: '40px', appearance: 'none' }}
                        >
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>
                </div>

                {/* Password (Read-only + Auto-gen) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Generated Password</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            value={currentPassword}
                            readOnly
                            style={{ fontFamily: 'monospace', backgroundColor: '#f9f9f9', cursor: 'default' }}
                        />
                        <button
                            type="button"
                            onClick={regeneratePassword}
                            style={{ width: '44px', padding: 0, backgroundColor: 'var(--color-border)', color: 'var(--color-text)' }}
                            title="Regenerate Password"
                        >
                            <RefreshCcw size={18} />
                        </button>
                    </div>
                </div>

                {error && (
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(229, 57, 53, 0.05)', borderRadius: '4px', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', fontSize: '0.875rem', display: 'flex', gap: '0.5rem' }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{ marginTop: '0.5rem', width: '100%' }}
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Admin Account'}
                </button>
            </form>

            {/* Success Modal */}
            <Modal
                isOpen={!!successData}
                onClose={() => setSuccessData(null)}
                title="Admin Account Created"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
                    <div style={{ margin: '0 auto', color: 'var(--color-success)', backgroundColor: 'rgba(76, 175, 80, 0.1)', padding: '20px', borderRadius: '50%' }}>
                        <CheckCircle2 size={48} />
                    </div>

                    <div>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                            Account has been successfully created. Copy the temporary credentials below and share them securely.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Email box */}
                        <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>EMAIL ADDRESS</p>
                                <p style={{ fontWeight: 600 }}>{successData?.email}</p>
                            </div>
                            <button
                                onClick={() => successData && copyToClipboard(successData.email)}
                                style={{ background: 'none', color: 'var(--color-primary)', padding: '8px' }}
                            >
                                <Copy size={18} />
                            </button>
                        </div>

                        {/* Password box */}
                        <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>TEMPORARY PASSWORD</p>
                                <p style={{ fontWeight: 600, fontFamily: 'monospace' }}>{successData?.pass}</p>
                            </div>
                            <button
                                onClick={() => successData && copyToClipboard(successData.pass)}
                                style={{ background: 'none', color: 'var(--color-primary)', padding: '8px' }}
                            >
                                <Copy size={18} />
                            </button>
                        </div>
                    </div>

                    <p style={{ fontSize: '0.875rem', color: copied ? 'var(--color-success)' : 'transparent', transition: '0.2s' }}>
                        Copied to clipboard!
                    </p>

                    <button
                        onClick={() => setSuccessData(null)}
                        style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', width: '100%' }}
                    >
                        Done
                    </button>
                </div>
            </Modal>

            <style jsx>{`
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
