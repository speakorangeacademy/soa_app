'use client'

import React from 'react'
import { AdminLoginForm } from '@/components/auth/AdminLoginForm'
import { ShieldAlert } from 'lucide-react'

export default function AdminAuthPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(circle_at_center,_var(--color-bg)_0%,_#FFF4E8_100%)] relative">
            <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-surface border border-border rounded-[2.5rem] shadow-2xl shadow-border/40 overflow-hidden">
                    <div className="p-10 pb-6 text-center">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-inner">
                            <ShieldAlert size={32} />
                        </div>
                        <h1 className="font-heading text-3xl font-bold text-text tracking-tight mb-2">
                            Admin Portal
                        </h1>
                        <p className="text-muted text-sm px-4">
                            Authorized personnel only. Please enter your credentials to manage the academy.
                        </p>
                    </div>

                    <div className="px-10 pb-12">
                        <AdminLoginForm />
                    </div>

                    <div className="px-10 py-6 bg-bg/50 border-t border-border/50 text-center">
                        <a href="/" className="text-xs font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">
                            Return to Homepage
                        </a>
                    </div>
                </div>

                <p className="mt-8 text-center text-[10px] text-muted/40 uppercase tracking-[0.2em] font-bold">
                    System Version 2.4.0 • Secure Session
                </p>
            </div>
        </div>
    )
}
