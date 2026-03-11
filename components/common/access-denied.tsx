'use client'

import React from 'react'
import Link from 'next/link'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export default function AccessDenied() {
    return (
        <div className="min-h-screen flex-center container" style={{ flexDirection: 'column', textAlign: 'center' }}>
            <div
                style={{
                    background: 'rgba(229, 57, 53, 0.1)',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-danger)',
                    marginBottom: '2rem'
                }}
                className="animate-fade-up"
            >
                <ShieldAlert size={40} />
            </div>

            <h1 className="animate-fade-up delay-1" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Access Denied</h1>
            <p className="animate-fade-up delay-2" style={{ color: 'var(--color-text-muted)', maxWidth: '480px', marginBottom: '2.5rem' }}>
                You do not have permission to access this page. This area is reserved for Super Admin accounts only.
            </p>

            <Link href="/login" className="animate-fade-up delay-3">
                <button style={{ minWidth: '200px' }}>
                    <ArrowLeft size={18} />
                    Back to Login
                </button>
            </Link>
        </div>
    )
}
