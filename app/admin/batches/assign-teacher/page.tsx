'use client'

import React from 'react'
import { ArrowLeft, UserPlus } from 'lucide-react'
import Link from 'next/link'
import AssignTeacherCard from '@/components/admin/assign-teacher-card'

export default function AssignTeacherPage() {
    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Navigation & Header */}
                <nav style={{ marginBottom: '2.5rem' }} className="animate-fade-up">
                    <Link
                        href="/admin/dashboard"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--color-text-muted)',
                            textDecoration: 'none',
                            fontSize: '0.875rem'
                        }}
                        className="hover-primary"
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </Link>
                </nav>

                <header style={{ marginBottom: '3rem' }} className="animate-fade-up">
                    <h1 style={{ fontSize: '2.25rem', color: 'var(--color-text)', marginBottom: '0.75rem' }}>Resource Planning</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>
                        Manage instructor allocations for upcoming and active course batches.
                    </p>
                </header>

                {/* Assignment Tool */}
                <div className="animate-fade-up delay-1">
                    <AssignTeacherCard />
                </div>

                {/* Quick Help */}
                <div style={{
                    marginTop: '3rem',
                    padding: '1.5rem',
                    backgroundColor: 'rgba(255, 140, 66, 0.05)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 140, 66, 0.1)',
                    display: 'flex',
                    gap: '1rem'
                }} className="animate-fade-up delay-2">
                    <div style={{ color: 'var(--color-primary)' }}>
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Assignment Guidelines</h4>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li>Assigning a teacher makes the batch immediately visible on their dashboard.</li>
                            <li>A notification email with batch details will be sent automatically.</li>
                            <li>Reassigning will replace the previous instructor and update their access.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .hover-primary:hover {
                    color: var(--color-primary) !important;
                }
            `}</style>
        </div>
    )
}
