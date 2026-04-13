'use client'

import React, { useState, useEffect } from 'react'
import { UserCog, UserPlus, Mail, Phone, Calendar, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/common/ui'

interface AdminUser {
    id: string
    name: string
    email: string
    mobile: string
    role: string
    status: string
    created_at: string
}

interface CreatedCredentials {
    email: string
    temporary_password: string
}

export default function AdminsPage() {
    const [admins, setAdmins] = useState<AdminUser[]>([])
    const [isLoadingList, setIsLoadingList] = useState(true)
    const [listError, setListError] = useState<string | null>(null)

    const [form, setForm] = useState({ name: '', email: '', mobile: '', role: 'admin' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)
    const [credentials, setCredentials] = useState<CreatedCredentials | null>(null)

    const fetchAdmins = async () => {
        setIsLoadingList(true)
        setListError(null)
        try {
            const res = await fetch('/api/admin/users')
            if (!res.ok) throw new Error('Failed to fetch admin list.')
            setAdmins(await res.json())
        } catch (err: any) {
            setListError(err.message)
        } finally {
            setIsLoadingList(false)
        }
    }

    useEffect(() => { fetchAdmins() }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setFormError(null)
        setCredentials(null)

        try {
            const res = await fetch('/api/admin/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to create admin.')
            setCredentials({ email: data.email, temporary_password: data.temporary_password })
            setForm({ name: '', email: '', mobile: '', role: 'admin' })
            fetchAdmins()
        } catch (err: any) {
            setFormError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <header className="animate-fade-up" style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ color: 'var(--color-primary)', backgroundColor: 'rgba(255, 140, 66, 0.1)', padding: '12px', borderRadius: '16px' }}>
                        <UserCog size={32} />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', color: 'var(--color-text)' }}>Admin Users</h1>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
                    Create and manage admin accounts with access to the administration panel.
                </p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                {/* Create Form */}
                <section className="animate-fade-up delay-1" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', textAlign: 'center' }}>Create Admin Account</h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Ravi Sharma"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    required
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>Email</label>
                                <input
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    required
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>Mobile</label>
                                <input
                                    type="tel"
                                    placeholder="10-digit mobile number"
                                    value={form.mobile}
                                    onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                                    required
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>Role</label>
                                <select
                                    value={form.role}
                                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>

                            {formError && (
                                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(229, 57, 53, 0.1)', border: '1px solid var(--color-danger)', borderRadius: '8px', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                    <AlertCircle size={16} /> {formError}
                                </div>
                            )}

                            {credentials && (
                                <div style={{ padding: '1rem', backgroundColor: 'rgba(76, 175, 80, 0.08)', border: '1px solid var(--color-success)', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', fontWeight: 600, marginBottom: '0.75rem' }}>
                                        <CheckCircle2 size={18} /> Admin created successfully
                                    </div>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Share these credentials with the new admin:</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <code style={{ fontSize: '0.875rem', background: 'var(--color-surface)', padding: '4px 8px', borderRadius: '4px', color: 'var(--color-text)' }}>Email: {credentials.email}</code>
                                        <code style={{ fontSize: '0.875rem', background: 'var(--color-surface)', padding: '4px 8px', borderRadius: '4px', color: 'var(--color-text)' }}>Password: {credentials.temporary_password}</code>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{ width: '100%', marginTop: '0.5rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                                {isSubmitting ? 'Creating...' : 'Create Admin Account'}
                            </button>
                        </form>
                    </div>
                </section>

                {/* Admin List */}
                <section className="animate-fade-up delay-2">
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                            <UserCog size={20} color="var(--color-primary)" />
                            <h2 style={{ fontSize: '1.25rem' }}>System Administrators</h2>
                        </div>

                        {isLoadingList ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', gap: '1rem' }}>
                                <Loader2 size={28} color="var(--color-primary)" className="animate-spin" />
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Loading admin list...</span>
                            </div>
                        ) : listError ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-danger)' }}>
                                <AlertCircle size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                <p>{listError}</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', textAlign: 'left' }}>
                                    <thead>
                                        <tr>
                                            {['Name', 'Contact', 'Role', 'Status', 'Created'].map(h => (
                                                <th key={h} style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {admins.map((admin, i) => (
                                            <tr key={admin.id} style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', opacity: 0, animation: 'fadeUp 0.4s ease-out forwards', animationDelay: `${i * 40}ms` }} className="admin-row">
                                                <td style={{ padding: '1.25rem 1.5rem', borderRadius: '8px 0 0 8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(255, 140, 66, 0.08)', border: '1px solid rgba(255,140,66,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 700, fontSize: '1rem' }}>
                                                            {admin.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{admin.name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8125rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={13} color="var(--color-text-muted)" />{admin.email}</div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={13} color="var(--color-text-muted)" />{admin.mobile}</div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                                    <Badge variant={admin.role === 'super_admin' ? 'warning' : 'default'}>
                                                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                                    </Badge>
                                                </td>
                                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: admin.status === 'Active' ? 'var(--color-success)' : 'var(--color-danger)' }} />
                                                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: admin.status === 'Active' ? 'var(--color-text)' : 'var(--color-danger)' }}>{admin.status}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.25rem 1.5rem', borderRadius: '0 8px 8px 0', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Calendar size={13} />
                                                        {new Date(admin.created_at).toLocaleDateString('en-IN')}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {admins.length === 0 && (
                                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        <UserCog size={48} style={{ margin: '0 auto 1rem', opacity: 0.15 }} />
                                        <p>No admin accounts found.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <style jsx global>{`
                .admin-row { transition: transform 0.15s ease; }
                .admin-row:hover { transform: translateX(4px); }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    )
}
