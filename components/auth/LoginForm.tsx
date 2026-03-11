'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginInput } from '@/lib/validations'
import { studentLogin } from '@/app/auth/student/auth-actions'
import { InlineButtonLoader, ApiError, CardSkeleton } from '@/components/common/ui'
import { Mail, Lock, AlertCircle } from 'lucide-react'

export function LoginForm() {
    const [serverError, setServerError] = useState<string | null>(null)
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur',
    })

    const onSubmit = async (data: LoginInput) => {
        setServerError(null)
        try {
            const result = await studentLogin(data)
            if (result?.error) {
                setServerError(result.error)
            }
        } catch (err) {
            setServerError('An unexpected error occurred. Please try again.')
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {serverError && (
                <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg flex items-start gap-3 text-danger text-sm animate-in zoom-in-95 duration-200">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-semibold text-text ml-1">Email Address</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted transition-colors group-focus-within:text-primary">
                        <Mail size={18} />
                    </div>
                    <input
                        {...register('email')}
                        type="email"
                        autoComplete="email"
                        className={`w-full pl-10 pr-4 py-3 bg-surface border ${errors.email ? 'border-danger' : 'border-border'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 tap-target`}
                        placeholder="you@example.com"
                        disabled={isSubmitting}
                    />
                </div>
                {errors.email && <ApiError message={errors.email.message} />}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-semibold text-text">Password</label>
                    <a href="/auth/forgot-password" size="sm" className="text-xs font-semibold text-muted hover:text-primary transition-colors">
                        Forgot?
                    </a>
                </div>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted transition-colors group-focus-within:text-primary">
                        <Lock size={18} />
                    </div>
                    <input
                        {...register('password')}
                        type="password"
                        autoComplete="current-password"
                        className={`w-full pl-10 pr-4 py-3 bg-surface border ${errors.password ? 'border-danger' : 'border-border'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 tap-target`}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                    />
                </div>
                {errors.password && <ApiError message={errors.password.message} />}
            </div>

            <InlineButtonLoader
                type="submit"
                isLoading={isSubmitting}
                className="w-full py-3 h-[48px] bg-primary text-bg font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200"
            >
                Sign In
            </InlineButtonLoader>

            <p className="text-center text-sm text-muted">
                Don't have an account?{' '}
                <button
                    type="button"
                    className="font-bold text-primary hover:text-accent transition-colors underline underline-offset-4"
                    onClick={() => {/* Parent will handle tab switch */ }}
                >
                    Create one for free
                </button>
            </p>
        </form>
    )
}
