'use client'

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    MoreVertical, UserX, UserCheck, Mail, Phone,
    Calendar, Shield, Loader2, AlertCircle
} from 'lucide-react'
import { Badge } from '@/components/common/ui'

interface AdminUser {
    id: string
    name: string
    email: string
    mobile: string
    role: 'admin' | 'super_admin'
    status: 'Active' | 'Disabled'
    created_at: string
}

export default function AdminListTable() {
    const queryClient = useQueryClient()

    // 1. Fetch Admins
    const { data: admins, isLoading, error } = useQuery<AdminUser[]>({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const res = await fetch('/api/admin/users')
            if (!res.ok) throw new Error('Failed to fetch admin list')
            return res.json()
        }
    })

    // 2. Toggle Status Mutation
    const statusMutation = useMutation({
        mutationFn: async ({ userId, newStatus }: { userId: string, newStatus: string }) => {
            const res = await fetch('/api/admin/status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, status: newStatus })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to update status')
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
        },
        onError: (err: any) => {
            alert(err.message)
        }
    })

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
                <Loader2 className="animate-spin" size={32} color="var(--color-primary)" />
                <p style={{ color: 'var(--color-text-muted)' }}>Loading administrators...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-danger)' }}>
                <AlertCircle size={40} style={{ margin: '0 auto 1rem' }} />
                <p>Error loading admin users. Please try again.</p>
            </div>
        )
    }

    return (
        <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                        <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>ADMINISTRATOR</th>
                        <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>CONTACT</th>
                        <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>ROLE</th>
                        <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>STATUS</th>
                        <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {admins?.map((admin, index) => (
                        <tr
                            key={admin.id}
                            style={{
                                borderBottom: '1px solid var(--color-border)',
                                animation: `fadeUp 0.4s ease-out forwards`,
                                animationDelay: `${index * 50}ms`,
                                opacity: 0
                            }}
                            className="table-row-hover"
                        >
                            <td style={{ padding: '1.25rem 1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        backgroundColor: admin.role === 'super_admin' ? 'rgba(217, 78, 31, 0.1)' : 'rgba(255, 140, 66, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: admin.role === 'super_admin' ? 'var(--color-accent)' : 'var(--color-primary)',
                                        fontWeight: 600
                                    }}>
                                        {admin.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{admin.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Joined {new Date(admin.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '1.25rem 1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text)' }}>
                                        <Mail size={14} style={{ color: 'var(--color-text-muted)' }} /> {admin.email}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text)' }}>
                                        <Phone size={14} style={{ color: 'var(--color-text-muted)' }} /> {admin.mobile}
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '1.25rem 1rem' }}>
                                <Badge variant={admin.role === 'super_admin' ? 'danger' : 'info'}>
                                    {admin.role.replace('_', ' ')}
                                </Badge>
                            </td>
                            <td style={{ padding: '1.25rem 1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: admin.status === 'Active' ? 'var(--color-success)' : 'var(--color-text-muted)'
                                    }}></div>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: admin.status === 'Active' ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                                        {admin.status}
                                    </span>
                                </div>
                            </td>
                            <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                                <button
                                    onClick={() => statusMutation.mutate({
                                        userId: admin.id,
                                        newStatus: admin.status === 'Active' ? 'Disabled' : 'Active'
                                    })}
                                    disabled={statusMutation.isPending}
                                    style={{
                                        display: 'inline-flex',
                                        backgroundColor: admin.status === 'Active' ? 'rgba(229, 57, 53, 0.05)' : 'rgba(76, 175, 80, 0.05)',
                                        color: admin.status === 'Active' ? 'var(--color-danger)' : 'var(--color-success)',
                                        border: `1px solid ${admin.status === 'Active' ? 'rgba(229, 57, 53, 0.1)' : 'rgba(76, 175, 80, 0.1)'}`,
                                        padding: '6px 12px',
                                        fontSize: '0.8125rem',
                                        borderRadius: '6px'
                                    }}
                                >
                                    {statusMutation.isPending && statusMutation.variables?.userId === admin.id ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : admin.status === 'Active' ? (
                                        <><UserX size={14} /> Disable</>
                                    ) : (
                                        <><UserCheck size={14} /> Enable</>
                                    )}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {admins?.length === 0 && (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <Shield size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                    <p>No administrative users found.</p>
                </div>
            )}

            <style jsx>{`
                .table-row-hover:hover {
                    background-color: rgba(255, 140, 66, 0.02);
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
