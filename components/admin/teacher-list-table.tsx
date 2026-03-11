'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Mail, Phone, Calendar, Loader2, AlertCircle,
    CheckCircle2, XCircle, Clock
} from 'lucide-react'
import { Badge } from '@/components/common/ui'

interface TeacherUser {
    id: string
    name: string
    email: string
    mobile: string
    status: 'Active' | 'Disabled'
    is_first_login: boolean
    created_at: string
}

export default function TeacherListTable() {
    // Fetch Teachers
    const { data: teachers, isLoading, error } = useQuery<TeacherUser[]>({
        queryKey: ['teachers'],
        queryFn: async () => {
            const res = await fetch('/api/teachers/list')
            if (!res.ok) throw new Error('Failed to fetch teacher list')
            return res.json()
        }
    })

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
                <Loader2 className="animate-spin" size={32} color="var(--color-primary)" />
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Synchronizing teacher roster...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-danger)' }}>
                <AlertCircle size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p style={{ fontWeight: 500 }}>System Error: Failed to retrieve staff data.</p>
                <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>Please verify your network connection and permissions.</p>
            </div>
        )
    }

    return (
        <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', textAlign: 'left' }}>
                <thead>
                    <tr>
                        <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teacher Details</th>
                        <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Communication</th>
                        <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Onboarding</th>
                        <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Status</th>
                    </tr>
                </thead>
                <tbody>
                    {teachers?.map((teacher, index) => (
                        <tr
                            key={teacher.id}
                            style={{
                                backgroundColor: 'var(--color-surface)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                transition: '0.2s',
                                animation: `fadeUp 0.4s ease-out forwards`,
                                animationDelay: `${index * 50}ms`,
                                opacity: 0
                            }}
                            className="teacher-row"
                        >
                            {/* Teacher Info */}
                            <td style={{ padding: '1.25rem 1.5rem', borderRadius: '8px 0 0 8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '12px',
                                        backgroundColor: 'rgba(255, 140, 66, 0.05)',
                                        border: '1px solid rgba(255, 140, 66, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--color-primary)',
                                        fontWeight: 600,
                                        fontSize: '1.125rem'
                                    }}>
                                        {teacher.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '1rem' }}>{teacher.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                            <Calendar size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                            Joined {new Date(teacher.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </td>

                            {/* Contact Info */}
                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
                                        <Mail size={14} color="var(--color-text-muted)" />
                                        <span style={{ color: 'var(--color-text)' }}>{teacher.email}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
                                        <Phone size={14} color="var(--color-text-muted)" />
                                        <span style={{ color: 'var(--color-text)' }}>{teacher.mobile}</span>
                                    </div>
                                </div>
                            </td>

                            {/* First Login Status */}
                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                {teacher.is_first_login ? (
                                    <Badge variant="warning">
                                        <Clock size={12} style={{ marginRight: '6px' }} /> Awaiting First Login
                                    </Badge>
                                ) : (
                                    <Badge variant="success">
                                        <CheckCircle2 size={12} style={{ marginRight: '6px' }} /> Fully Onboarded
                                    </Badge>
                                )}
                            </td>

                            {/* Status */}
                            <td style={{ padding: '1.25rem 1.5rem', borderRadius: '0 8px 8px 0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        backgroundColor: teacher.status === 'Active' ? 'var(--color-success)' : 'var(--color-danger)'
                                    }}></div>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: teacher.status === 'Active' ? 'var(--color-text)' : 'var(--color-danger)' }}>
                                        {teacher.status}
                                    </span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {teachers?.length === 0 && (
                <div style={{ padding: '5rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px dashed var(--color-border)' }}>
                    <Users size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.1 }} />
                    <p style={{ fontSize: '1.125rem' }}>No teacher profiles found in the system.</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Onboard your first teacher using the form above.</p>
                </div>
            )}

            <style jsx>{`
                .teacher-row:hover {
                    transform: translateX(4px);
                    box-shadow: 4px 4px 12px rgba(44, 36, 22, 0.05);
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
