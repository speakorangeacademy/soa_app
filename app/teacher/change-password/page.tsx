'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ShieldCheck, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { updateTeacherPassword } from '@/app/auth/actions'

// ── Validation ────────────────────────────────────────────────────────────────
const schema = z
    .object({
        password: z
            .string()
            .min(8, 'At least 8 characters')
            .refine((v) => /[A-Z]/.test(v), 'Must include an uppercase letter')
            .refine((v) => /[a-z]/.test(v), 'Must include a lowercase letter')
            .refine((v) => /[0-9]/.test(v), 'Must include a number'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

type FormValues = z.infer<typeof schema>

// Strength check rules shown as live checklist under the password field
const STRENGTH_RULES = [
    { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
    { label: 'Uppercase letter (A-Z)', test: (v: string) => /[A-Z]/.test(v) },
    { label: 'Lowercase letter (a-z)', test: (v: string) => /[a-z]/.test(v) },
    { label: 'Number (0-9)',           test: (v: string) => /[0-9]/.test(v) },
]

export default function TeacherChangePasswordPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onChange' })

    const passwordValue = watch('password', '')

    const onSubmit = async (data: FormValues) => {
        const formData = new FormData()
        formData.append('password', data.password)
        formData.append('confirmPassword', data.confirmPassword)

        try {
            const result = await updateTeacherPassword(formData)
            if (result?.error) {
                toast.error(result.error, { duration: 4000 })
            }
            // On success updateTeacherPassword calls redirect('/teacher/dashboard')
            // which throws NEXT_REDIRECT — component unmounts automatically.
        } catch (err: any) {
            if (err?.message !== 'NEXT_REDIRECT') {
                toast.error('An unexpected error occurred. Please try again.')
            }
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6"
            style={{
                background: 'radial-gradient(circle at center, #FFF9F4 0%, #FFF4E8 100%)',
                fontFamily: 'Work Sans, sans-serif',
            }}
        >
            {/* Decorative blob */}
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed', top: '15%', right: '8%',
                    width: 360, height: 360,
                    background: 'rgba(255,140,66,0.05)',
                    borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none',
                }}
            />

            <div
                className="relative z-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ maxWidth: 440 }}
            >
                <div
                    className="bg-white border border-border rounded-3xl p-10 shadow-2xl"
                    style={{ boxShadow: '0 20px 40px rgba(44,36,22,0.08)' }}
                >
                    {/* ── Header ──────────────────────────────────────────────── */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                            style={{ background: 'rgba(255,140,66,0.1)', color: '#FF8C42' }}
                        >
                            <ShieldCheck size={30} />
                        </div>
                        <h1
                            className="text-3xl font-bold text-text mb-1"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                        >
                            Set Your Password
                        </h1>
                        <p className="text-sm text-muted max-w-xs">
                            This is your first login. Set a secure password to unlock your dashboard.
                        </p>
                    </div>

                    {/* ── Form ────────────────────────────────────────────────── */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

                        {/* New password */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="cp-password"
                                className="block text-sm font-semibold text-text ml-0.5"
                            >
                                New Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted transition-colors group-focus-within:text-primary">
                                    <Lock size={17} />
                                </div>
                                <input
                                    {...register('password')}
                                    id="cp-password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    disabled={isSubmitting}
                                    className={`
                                        w-full pl-10 pr-11 py-3 bg-surface text-text
                                        border rounded-xl transition-all duration-200
                                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                        placeholder:text-muted/50 disabled:opacity-60
                                        ${errors.password ? 'border-danger' : 'border-border'}
                                    `}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-primary transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    tabIndex={0}
                                >
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>

                            {/* Live strength checklist */}
                            {passwordValue.length > 0 && (
                                <ul className="mt-2 space-y-1 pl-0.5">
                                    {STRENGTH_RULES.map((rule) => {
                                        const passed = rule.test(passwordValue)
                                        return (
                                            <li
                                                key={rule.label}
                                                className={`flex items-center gap-1.5 text-xs transition-colors ${
                                                    passed ? 'text-success' : 'text-muted'
                                                }`}
                                            >
                                                <CheckCircle2
                                                    size={13}
                                                    className={passed ? 'opacity-100' : 'opacity-30'}
                                                />
                                                {rule.label}
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}

                            {errors.password && (
                                <p className="flex items-center gap-1 text-xs text-danger mt-1">
                                    <AlertCircle size={13} />
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="cp-confirm"
                                className="block text-sm font-semibold text-text ml-0.5"
                            >
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted transition-colors group-focus-within:text-primary">
                                    <Lock size={17} />
                                </div>
                                <input
                                    {...register('confirmPassword')}
                                    id="cp-confirm"
                                    type={showConfirm ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    disabled={isSubmitting}
                                    className={`
                                        w-full pl-10 pr-11 py-3 bg-surface text-text
                                        border rounded-xl transition-all duration-200
                                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                        placeholder:text-muted/50 disabled:opacity-60
                                        ${errors.confirmPassword ? 'border-danger' : 'border-border'}
                                    `}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((p) => !p)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-primary transition-colors"
                                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                    tabIndex={0}
                                >
                                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="flex items-center gap-1 text-xs text-danger mt-1">
                                    <AlertCircle size={13} />
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="
                                w-full h-[50px] mt-1 flex items-center justify-center gap-2
                                bg-primary text-white font-bold rounded-xl
                                shadow-md shadow-primary/20
                                hover:bg-accent hover:shadow-lg hover:shadow-primary/30
                                active:scale-[0.98] transition-all duration-200
                                disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
                            "
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                        >
                            {isSubmitting ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                'Save & Go to Dashboard'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
