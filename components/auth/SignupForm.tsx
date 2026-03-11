'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, SignupInput } from '@/lib/validations'
import { studentSignup } from '@/app/auth/student/auth-actions'
import { InlineButtonLoader, ApiError } from '@/components/common/ui'
import { User, Mail, Phone, Lock, CheckCircle2, AlertCircle } from 'lucide-react'

export function SignupForm() {
    const [serverError, setServerError] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignupInput>({
        resolver: zodResolver(signupSchema),
        mode: 'onBlur',
    })

    const onSubmit = async (data: SignupInput) => {
        setServerError(null)
        try {
            const result = await studentSignup(data)
            if (result?.error) {
                setServerError(result.error)
            } else {
                setIsSuccess(true)
            }
        } catch (err) {
            setServerError('An unexpected error occurred. Please try again.')
        }
    }

    if (isSuccess) {
        return (
            <div className="text-center p-8 space-y-6 animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={48} />
                </div>
                <h3 className="text-2xl font-bold text-text">Account Created!</h3>
                <p className="text-muted leading-relaxed">
                    Welcome to Speak Orange Academy! Your account has been created successfully.
                    Please check your email to verify your account before logging in.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="w-full py-3 bg-primary text-bg font-bold rounded-xl transition-all hover:shadow-lg"
                >
                    Back to Login
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {serverError && (
                <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg flex items-start gap-3 text-danger text-sm">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                </div>
            )}

            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-text ml-1">Full Name</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-primary">
                        <User size={18} />
                    </div>
                    <input
                        {...register('full_name')}
                        type="text"
                        className={`w-full pl-10 pr-4 py-2.5 bg-surface border ${errors.full_name ? 'border-danger' : 'border-border'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 tap-target`}
                        placeholder="John Doe"
                        disabled={isSubmitting}
                    />
                </div>
                {errors.full_name && <ApiError message={errors.full_name.message} />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-text ml-1">Email</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-primary">
                            <Mail size={18} />
                        </div>
                        <input
                            {...register('email')}
                            type="email"
                            className={`w-full pl-10 pr-4 py-2.5 bg-surface border ${errors.email ? 'border-danger' : 'border-border'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 tap-target`}
                            placeholder="john@example.com"
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.email && <ApiError message={errors.email.message} />}
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-text ml-1">Phone</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-primary">
                            <Phone size={18} />
                        </div>
                        <input
                            {...register('phone')}
                            type="tel"
                            className={`w-full pl-10 pr-4 py-2.5 bg-surface border ${errors.phone ? 'border-danger' : 'border-border'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 tap-target`}
                            placeholder="9876543210"
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.phone && <ApiError message={errors.phone.message} />}
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-text ml-1">Password</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-primary">
                        <Lock size={18} />
                    </div>
                    <input
                        {...register('password')}
                        type="password"
                        className={`w-full pl-10 pr-4 py-2.5 bg-surface border ${errors.password ? 'border-danger' : 'border-border'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 tap-target`}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                    />
                </div>
                {errors.password && <ApiError message={errors.password.message} />}
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-text ml-1">Confirm Password</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-primary">
                        <Lock size={18} />
                    </div>
                    <input
                        {...register('confirmPassword')}
                        type="password"
                        className={`w-full pl-10 pr-4 py-2.5 bg-surface border ${errors.confirmPassword ? 'border-danger' : 'border-border'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 tap-target`}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                    />
                </div>
                {errors.confirmPassword && <ApiError message={errors.confirmPassword.message} />}
            </div>

            <InlineButtonLoader
                type="submit"
                isLoading={isSubmitting}
                className="w-full py-3 h-[48px] bg-primary text-bg font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 mt-2"
            >
                Create Account
            </InlineButtonLoader>
        </form>
    )
}
