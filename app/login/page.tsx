'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
    return (
        <div
            className="min-h-screen flex items-center justify-center p-6"
            style={{
                background: 'radial-gradient(circle at center, #FFF9F4 0%, #FFF4E8 100%)',
                fontFamily: 'Work Sans, sans-serif',
            }}
        >
            {/* Decorative blobs */}
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed', top: '10%', right: '10%',
                    width: 400, height: 400,
                    background: 'rgba(255,140,66,0.05)',
                    borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none',
                }}
            />
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed', bottom: '10%', left: '10%',
                    width: 300, height: 300,
                    background: 'rgba(217,78,31,0.03)',
                    borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
                }}
            />

            {/* Card */}
            <div
                className="relative z-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ maxWidth: 440 }}
            >
                <div
                    className="bg-white border border-border rounded-3xl p-10 shadow-2xl"
                    style={{ boxShadow: '0 20px 40px rgba(44,36,22,0.08)' }}
                >
                    {/* Header */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                            style={{ background: 'rgba(255,140,66,0.1)', color: '#FF8C42' }}
                        >
                            <Sparkles size={30} />
                        </div>
                        <h1
                            className="text-3xl font-bold text-text mb-1"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                        >
                            Welcome Back
                        </h1>
                        <p className="text-muted text-sm">
                            Sign in to your Academy account
                        </p>
                    </div>

                    {/* Form — all logic lives here */}
                    <LoginForm />
                </div>
            </div>
        </div>
    )
}
