'use client'

import React from 'react'
import { AlertCircle, ArrowLeft, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function UnauthorizedPage() {
    return (
        <div className="container flex-center min-h-screen">
            <div className="card text-center animate-fade-up" style={{ maxWidth: '480px' }}>
                <div style={{ color: 'var(--color-danger)', marginBottom: '1.5rem' }}>
                    <ShieldAlert size={64} style={{ margin: '0 auto' }} />
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Access Restricted</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                    You do not have the necessary permissions to access this dashboard. This area is reserved for administrative personnel.
                </p>
                <Link href="/" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'var(--color-text)',
                    color: 'var(--color-bg)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600
                }}>
                    <ArrowLeft size={18} />
                    Back to Home
                </Link>
            </div>
        </div>
    )
}
