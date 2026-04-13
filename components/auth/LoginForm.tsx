'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginIdentifierSchema, LoginIdentifierInput } from '@/lib/validations'
import { login } from '@/app/auth/actions'
import { ApiError } from '@/components/common/ui'
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface LoginFormProps {
    /** Called when the user clicks "Create one for free" — useful in tab-based layouts */
    onCreateAccount?: () => void
}

export function LoginForm({ onCreateAccount }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginIdentifierInput>({
        resolver: zodResolver(loginIdentifierSchema),
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    const onSubmit = async (data: LoginIdentifierInput) => {
        // Build FormData to match the server action's expected shape
        const formData = new FormData()
        formData.append('identifier', data.identifier.trim())
        formData.append('password', data.password)

        try {
            const result = await login(formData)
            if (result?.error) {
                toast.error(result.error, { duration: 4000 })
            }
            // Successful login triggers a redirect inside `login()` — no further
            // handling needed here; the component will unmount on navigation.
        } catch (err: any) {
            // Next.js redirect throws an internal error with message 'NEXT_REDIRECT'.
            // That is expected — don't show an error toast for it.
            if (err?.message !== 'NEXT_REDIRECT') {
                toast.error('An unexpected error occurred. Please try again.')
            }
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500"
            noValidate
        >
            {/* ── Identifier field (email or mobile) ─────────────────────────── */}
            <div className="space-y-1.5">
                <label
                    htmlFor="login-identifier"
                    className="block text-sm font-semibold text-text ml-0.5"
                >
                    Email or Mobile Number
                </label>
                <div className="relative group">
                    <input
                        {...register('identifier')}
                        id="login-identifier"
                        type="text"
                        inputMode="email"
                        autoComplete="username"
                        spellCheck={false}
                        autoCapitalize="none"
                        className={`
                            w-full px-4 py-3 bg-surface text-text
                            border rounded-xl transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                            placeholder:text-muted/50 disabled:opacity-60
                            ${errors.identifier ? 'border-danger' : 'border-border'}
                        `}
                        placeholder="name@example.com  or  9876543210"
                        disabled={isSubmitting}
                    />
                </div>
                {errors.identifier && <ApiError message={errors.identifier.message} />}
            </div>

            {/* ── Password field with show/hide toggle ───────────────────────── */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-0.5 mr-0.5">
                    <label
                        htmlFor="login-password"
                        className="text-sm font-semibold text-text"
                    >
                        Password
                    </label>
                    <Link
                        href="/forgot-password"
                        className="text-xs font-medium text-muted hover:text-primary transition-colors"
                        tabIndex={0}
                    >
                        Forgot password?
                    </Link>
                </div>
                <div className="relative group">
                    <input
                        {...register('password')}
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        className={`
                            w-full pl-4 pr-11 py-3 bg-surface text-text
                            border rounded-xl transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                            placeholder:text-muted/50 disabled:opacity-60
                            ${errors.password ? 'border-danger' : 'border-border'}
                        `}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                    />
                    {/* Eye toggle — keyboard accessible, won't submit the form */}
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-primary transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex={0}
                    >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                </div>
                {errors.password && <ApiError message={errors.password.message} />}
            </div>

            {/* ── Submit ─────────────────────────────────────────────────────── */}
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
                    <>
                        Sign In <LogIn size={17} />
                    </>
                )}
            </button>

            {/* ── Register link ──────────────────────────────────────────────── */}
            <p className="text-center text-sm text-muted pt-1">
                Don&apos;t have an account?{' '}
                {onCreateAccount ? (
                    <button
                        type="button"
                        onClick={onCreateAccount}
                        className="font-semibold text-primary hover:text-accent transition-colors underline underline-offset-4"
                    >
                        Create one for free
                    </button>
                ) : (
                    <Link
                        href="/register"
                        className="font-semibold text-primary hover:text-accent transition-colors underline underline-offset-4"
                    >
                        Join as Student
                    </Link>
                )}
            </p>
        </form>
    )
}
