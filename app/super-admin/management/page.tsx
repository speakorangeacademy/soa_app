'use client'

import React from 'react'
import CreateAdminForm from '@/components/super-admin/create-admin-form'
import AdminListTable from '@/components/super-admin/admin-list-table'
import { ShieldCheck } from 'lucide-react'

/**
 * Admin User Management Page
 * Exclusive to Super Admins.
 */
export default function AdminManagementPage() {
    return (
        <div className="container min-h-screen" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            {/* Header section */}
            <header className="animate-fade-up" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ color: 'var(--color-primary)', backgroundColor: 'rgba(255, 140, 66, 0.1)', padding: '10px', borderRadius: '12px' }}>
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', color: 'var(--color-text)' }}>Admin User Management</h1>
                        <p style={{ color: 'var(--color-text-muted)' }}>Create and manage administrative access for the platform.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Create Admin Form Section (Left/Top) */}
                <aside className="lg:col-span-4 animate-fade-up delay-1">
                    <div className="card" style={{ position: 'sticky', top: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                            Add New Administrator
                        </h2>
                        <CreateAdminForm />
                    </div>
                </aside>

                {/* Admin List Table Section (Right/Bottom) */}
                <main className="lg:col-span-8 animate-fade-up delay-2">
                    <section className="card" style={{ minHeight: '500px' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                            Existing Admin Accounts
                        </h2>
                        <AdminListTable />
                    </section>
                </main>
            </div>

            <style jsx>{`
                .grid {
                    display: grid;
                }
                @media (min-width: 1024px) {
                    .lg\\:col-span-4 { grid-column: span 4 / span 12; }
                    .lg\\:col-span-8 { grid-column: span 8 / span 12; }
                }
            `}</style>
        </div>
    )
}
