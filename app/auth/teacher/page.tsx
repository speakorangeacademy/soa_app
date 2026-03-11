'use client'

import React from 'react'
import { TeacherLoginForm } from '@/components/auth/TeacherLoginForm'
import { GraduationCap } from 'lucide-react'

export default function TeacherAuthPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(circle_at_center,_var(--color-bg)_0%,_#FFF4E8_100%)] relative">
            <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-surface border border-border rounded-[2rem] shadow-2xl shadow-border/30 overflow-hidden">
                    <div className="p-10 pb-6 text-center">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce-subtle">
                            <GraduationCap size={32} />
                        </div>
                        <h1 className="font-heading text-3xl font-bold text-text tracking-tight mb-2">
                            Teacher Login
                        </h1>
                        <p className="text-muted text-sm px-2">
                            Welcome back! Access your class management dashboard and schedules.
                        </p>
                    </div>

                    <div className="px-10 pb-12">
                        <TeacherLoginForm />
                    </div>

                    <div className="px-10 py-6 bg-bg/50 border-t border-border/50 text-center">
                        <a href="/" className="text-xs font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">
                            Return to Homepage
                        </a>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
}
