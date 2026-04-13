'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    User, Mail, Phone, Lock, RefreshCcw,
    CheckCircle2, AlertCircle, Copy, Loader2, Info
} from 'lucide-react'
import { Modal } from '@/components/common/ui'
import { useQueryClient } from '@tanstack/react-query'

// Validation Schema
const teacherSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Enter a valid email address"),
    mobile: z.string().regex(/^[0-9]{10,15}$/, "Mobile must be 10-15 digits"),
    password: z.string().min(10, "Password must be at least 10 characters")
        .refine(val => /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val), {
            message: "Must include uppercase, lowercase, and a number"
        })
})

type TeacherFormValues = z.infer<typeof teacherSchema>

// Secure Password Generator
function generateSecurePassword() {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const lowercase = "abcdefghijklmnopqrstuvwxyz"
    const numbers = "0123456789"
    const symbols = "!@#$%^&*"
    const all = uppercase + lowercase + numbers + symbols

    // Ensure at least one of each
    let pass = uppercase[Math.floor(Math.random() * uppercase.length)] +
        lowercase[Math.floor(Math.random() * lowercase.length)] +
        numbers[Math.floor(Math.random() * numbers.length)] +
        symbols[Math.floor(Math.random() * symbols.length)]

    // Fill the rest up to 12 chars
    for (let i = 0; i < 8; i++) {
        pass += all[Math.floor(Math.random() * all.length)]
    }

    // Shuffle the result
    return pass.split('').sort(() => 0.5 - Math.random()).join('')
}

export default function CreateTeacherForm() {
    const queryClient = useQueryClient()
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
    } = useForm<TeacherFormValues>({
        resolver: zodResolver(teacherSchema),
        defaultValues: {
            password: generateSecurePassword()
        }
    })

    const currentPassword = watch('password')

    const regeneratePassword = () => {
        setValue('password', generateSecurePassword())
    }

    const onSubmit = async (data: TeacherFormValues) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/teachers/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create teacher account')
            }

            setSuccessData({ email: result.email, pass: result.temporary_password })
            reset({
                name: '',
                email: '',
                mobile: '',
                password: generateSecurePassword()
            })
            queryClient.invalidateQueries({ queryKey: ['teachers'] })
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }).catch(() => {
            alert("Unable to copy. Please copy manually.")
        })
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Full Name */}
                <div className="form-group">
                    <label>Full Name</label>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                        <input
                            {...register('name')}
                            placeholder="Teacher's Full Name"
                            style={{ paddingLeft: '40px' }}
                            className={errors.name ? 'error' : ''}
                        />
                    </div>
                    {errors.name && <p className="error-text"><AlertCircle size={14} /> {errors.name.message}</p>}
                </div>

                {/* Email */}
                <div className="form-group">
                    <label>Email Address</label>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="teacher@academy.com"
                            style={{ paddingLeft: '40px' }}
                            className={errors.email ? 'error' : ''}
                        />
                    </div>
                    {errors.email && <p className="error-text"><AlertCircle size={14} /> {errors.email.message}</p>}
                </div>

                {/* Mobile */}
                <div className="form-group">
                    <label>Mobile Number</label>
                    <div style={{ position: 'relative' }}>
                        <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                        <input
                            {...register('mobile')}
                            placeholder="9876543210"
                            style={{ paddingLeft: '40px' }}
                            className={errors.mobile ? 'error' : ''}
                        />
                    </div>
                    {errors.mobile && <p className="error-text"><AlertCircle size={14} /> {errors.mobile.message}</p>}
                </div>

                {/* Temporary Password */}
                <div className="form-group">
                    <label>Temporary Password</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                            <input
                                {...register('password')}
                                readOnly
                                style={{ paddingLeft: '40px', fontFamily: 'monospace', backgroundColor: 'var(--color-bg)', cursor: 'default' }}
                                className={errors.password ? 'error' : ''}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={regeneratePassword}
                            className="regenerate-btn"
                            title="Regenerate Secure Password"
                        >
                            <RefreshCcw size={18} />
                        </button>
                    </div>
                    {errors.password && <p className="error-text"><AlertCircle size={14} /> {errors.password.message}</p>}
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
                    className="submit-btn"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Teacher Account'}
                </button>
            </form>

            {/* Success Modal */}
            <Modal
                isOpen={!!successData}
                onClose={() => setSuccessData(null)}
                title="Teacher Credentials Generated"
                maxWidth="max-w-md"
            >
                <div className="success-modal-content">
                    {/* Success Icon */}
                    <div className="success-icon-wrapper">
                        <CheckCircle2 size={48} />
                    </div>

                    {/* Heading */}
                    <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: 'var(--color-text)',
                        margin: '0.5rem 0 0',
                        padding: '0'
                    }}>Account Provisioned Successfully</h3>

                    {/* Description */}
                    <p className="modal-description">
                        The account has been created. Use the credentials below to allow the teacher to sign in for the first time.
                    </p>

                    {/* Credentials Section */}
                    <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                        <div className="credential-stack">
                            {/* Email */}
                            <div className="credential-item">
                                <div className="item-labels">
                                    <span className="item-tag">LOGIN EMAIL</span>
                                    <span className="item-value">{successData?.email}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => successData && copyToClipboard(successData.email)}
                                    className="copy-btn"
                                    aria-label="Copy email"
                                >
                                    <Copy size={18} />
                                </button>
                            </div>

                            {/* Password */}
                            <div className="credential-item">
                                <div className="item-labels">
                                    <span className="item-tag">TEMPORARY PASSWORD</span>
                                    <span className="item-value" style={{ fontFamily: 'monospace', overflowWrap: 'break-word', wordBreak: 'break-all' }}>{successData?.pass}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => successData && copyToClipboard(successData.pass)}
                                    className="copy-btn"
                                    aria-label="Copy password"
                                    style={{ flexShrink: 0, marginLeft: '0.75rem' }}
                                >
                                    <Copy size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Instruction Box */}
                    <div className="instruction-box">
                        <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <p style={{ margin: 0 }}>Please email these credentials to the teacher. They will be required to update their password on first login.</p>
                    </div>

                    {/* Feedback Message */}
                    <div style={{
                        height: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <p style={{
                            fontSize: '0.875rem',
                            color: 'var(--color-success)',
                            opacity: copied ? 1 : 0,
                            transition: 'opacity 0.2s ease-out',
                            margin: 0
                        }}>
                            ✓ Copied to clipboard!
                        </p>
                    </div>

                    {/* Action Button */}
                    <button
                        type="button"
                        onClick={() => setSuccessData(null)}
                        className="done-btn"
                        style={{ marginTop: '1.5rem' }}
                    >
                        Close & Finish
                    </button>
                </div>
            </Modal>

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
                .regenerate-btn {
                    width: 44px;
                    min-width: 44px;
                    padding: 0;
                    background-color: var(--color-bg);
                    border: 1px solid var(--color-border);
                    color: var(--color-text);
                }
                .regenerate-btn:hover {
                    background-color: var(--color-border);
                    transform: none;
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
                .submit-btn {
                    width: 100%;
                    margin-top: 0.5rem;
                }

                /* Modal Styles */
                .success-modal-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    text-align: center;
                    align-items: center;
                }
                .success-icon-wrapper {
                    margin: 0 auto 1.25rem;
                    color: var(--color-success);
                    background-color: rgba(76, 175, 80, 0.1);
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .modal-description {
                    color: var(--color-text-muted);
                    font-size: 0.875rem;
                    margin: 0.75rem 0 1rem;
                    line-height: 1.5;
                }
                .credential-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    width: 100%;
                    margin: 0 0 1rem;
                }
                .credential-item {
                    background-color: var(--color-bg);
                    border: 1px solid var(--color-border);
                    border-radius: 8px;
                    padding: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                    width: 100%;
                }
                .item-labels {
                    text-align: left;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    flex: 1;
                    min-width: 0;
                }
                .item-tag {
                    font-size: 0.625rem;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    color: var(--color-text-muted);
                    text-transform: uppercase;
                }
                .item-value {
                    font-weight: 600;
                    color: var(--color-text);
                    word-break: break-all;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                .copy-btn {
                    background: none;
                    color: var(--color-primary);
                    padding: 8px;
                    min-height: auto;
                    border: 1px solid transparent;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 150ms ease-out;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .copy-btn:hover {
                    background: rgba(255, 140, 66, 0.1);
                    border-color: var(--color-primary);
                    transform: none;
                }
                .instruction-box {
                    background-color: rgba(255, 193, 7, 0.05);
                    border: 1px solid rgba(255, 193, 7, 0.2);
                    border-radius: 8px;
                    padding: 0.875rem 1rem;
                    display: flex;
                    gap: 0.75rem;
                    text-align: left;
                    font-size: 0.8125rem;
                    color: var(--color-text-muted);
                    margin: 0 0 1rem;
                    width: 100%;
                    align-items: flex-start;
                }
                .instruction-box p {
                    margin: 0;
                    line-height: 1.4;
                }
                .done-btn {
                    background-color: var(--color-text);
                    color: var(--color-bg);
                    width: 100%;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 150ms ease-out;
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
