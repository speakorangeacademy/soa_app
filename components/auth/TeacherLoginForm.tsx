'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginInput } from '@/lib/validations'
import { teacherLogin } from '@/app/auth/teacher/auth-actions'
import { InlineButtonLoader, ApiError } from '@/components/common/ui'
import { Mail, Lock, GraduationCap, AlertCircle } from 'lucide-react'

export function TeacherLoginForm() {
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
            const result = await teacherLogin(data)
            if (result?.error) {
                setServerError(result.error)
            }
        } catch (err) {
            setServerError('An unexpected error occurred. Please try again.')
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {serverError && (
                <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3 text-danger text-sm animate-in zoom-in-95 duration-200">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-semibold text-text ml-1 flex items-center gap-2">
                    <Mail size={16} className="text-muted" />
                    Work Email
                </label>
                <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className={`w-full px-4 py-3 bg-surface border ${errors.email ? 'border-danger' : 'border-border'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 tap-target`}
                    placeholder="teacher@speakorange.academy"
                    disabled={isSubmitting}
                />
                {errors.email && <ApiError message={errors.email.message} />}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-text ml-1 flex items-center gap-2">
                    <Lock size={16} className="text-muted" />
                    Password
                </label>
                <input
                    {...register('password')}
                    type="password"
                    autoComplete="current-password"
                    className={`w-full px-4 py-3 bg-surface border ${errors.password ? 'border-danger' : 'border-border'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 tap-target`}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                />
                {errors.password && <ApiError message={errors.password.message} />}
            </div>

            <InlineButtonLoader
                type="submit"
                isLoading={isSubmitting}
                className="w-full py-4 h-[52px] mt-2 bg-primary text-bg font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
                <GraduationCap size={20} />
                Sign In to Portal
            </InlineButtonLoader>

            <div className="text-center pt-2">
                <a href="/auth/forgot-password" className="text-xs font-semibold text-muted hover:text-primary transition-colors">
                    Trouble signing in? Reset Password
                </a>
            </div>
        </form>
    )
}
