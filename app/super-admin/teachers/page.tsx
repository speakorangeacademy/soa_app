'use client'

import React from 'react'
import CreateTeacherForm from '@/components/admin/create-teacher-form'
import TeacherListTable from '@/components/admin/teacher-list-table'
import { UserPlus, Users } from 'lucide-react'

export default function TeachersPage() {
    return (
        <div className="container" style={{ paddingTop: '0.5rem', paddingBottom: '4rem' }}>
            <header className="animate-fade-up" style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ color: 'var(--color-primary)', backgroundColor: 'rgba(255, 140, 66, 0.1)', padding: '12px', borderRadius: '16px' }}>
                        <UserPlus size={32} />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', color: 'var(--color-text)' }}>Teacher Management</h1>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
                    Onboard new educators and manage their system access credentials.
                </p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                <section className="animate-fade-up delay-1" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', textAlign: 'center' }}>Create Teacher Account</h2>
                        <CreateTeacherForm />
                    </div>
                </section>

                <section className="animate-fade-up delay-2">
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                            <Users size={20} color="var(--color-primary)" />
                            <h2 style={{ fontSize: '1.25rem' }}>Active Teaching Staff</h2>
                        </div>
                        <TeacherListTable />
                    </div>
                </section>
            </div>
        </div>
    )
}
