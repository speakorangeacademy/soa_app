'use client'

import React, { useState } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignupForm } from '@/components/auth/SignupForm'

export default function StudentAuthPage() {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(circle_at_center,_var(--color-bg)_0%,_#FFF4E8_100%)] relative overflow-hidden">
            {/* Faint noise texture overlay could be added here via CSS */}

            <div className="w-full max-w-lg z-10">
                <div className="bg-surface border border-border rounded-3xl shadow-xl shadow-border/50 overflow-hidden">
                    {/* Header/Logo section */}
                    <div className="p-8 text-center pb-2">
                        <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 tracking-wider uppercase">
                            Speak Orange Academy
                        </div>
                        <h1 className="font-heading text-3xl font-bold text-text tracking-tight mb-2">
                            {activeTab === 'login' ? 'Welcome Back' : 'Start Learning'}
                        </h1>
                        <p className="text-muted text-sm">
                            {activeTab === 'login'
                                ? 'Access your dashboard to continue your journey.'
                                : 'Join our community and transform your future today.'}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 mx-8 mb-6 bg-bg border border-border rounded-2xl">
                        <button
                            onClick={() => setActiveTab('login')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === 'login' ? 'bg-surface shadow-sm text-primary' : 'text-muted hover:text-text'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setActiveTab('signup')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === 'signup' ? 'bg-surface shadow-sm text-primary' : 'text-muted hover:text-text'}`}
                        >
                            New Account
                        </button>
                    </div>

                    {/* Form Container */}
                    <div className="px-8 pb-10">
                        {activeTab === 'login' ? <LoginForm /> : <SignupForm />}
                    </div>

                    {/* Footer / Social (Optional) */}
                    <div className="px-8 py-6 bg-bg/50 border-t border-border/50 text-center">
                        <p className="text-xs text-muted/60 lowercase font-medium">
                            By continuing, you agree to our Terms of Service & Privacy Policy.
                        </p>
                    </div>
                </div>

                {/* Back to Home Link */}
                <div className="mt-8 text-center animate-in fade-in slide-in-from-top-2 duration-700 delay-500">
                    <a href="/" className="text-sm font-semibold text-muted hover:text-primary transition-colors flex items-center justify-center gap-2">
                        ← Back to homepage
                    </a>
                </div>
            </div>
        </div>
    )
}
