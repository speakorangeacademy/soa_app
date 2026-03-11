'use client'

import React, { useState, useEffect } from 'react'
import { QrCode as QrIcon, CheckCircle2, XCircle, History, Calendar, User } from 'lucide-react'
import { QrCode } from '@/types/qr'
import { Badge } from '@/components/common/ui'
import QrUploadForm from '@/components/super-admin/qr-upload-form'

export default function QrManagementPage() {
    const [activeQr, setActiveQr] = useState<QrCode | null>(null)
    const [history, setHistory] = useState<QrCode[]>([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    const fetchData = async () => {
        try {
            const [activeRes, allRes] = await Promise.all([
                fetch('/api/payment-qr/active'),
                fetch('/api/payment-qr')
            ])

            const activeData = await activeRes.json()
            const allData = await allRes.json()

            if (activeRes.ok) setActiveQr(activeData)
            if (allRes.ok) setHistory(allData)
        } catch (err) {
            showToast('error', 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message })
        setTimeout(() => setToast(null), 5000)
    }

    return (
        <div className="animate-fade-up">
            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    zIndex: 200,
                    backgroundColor: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center', gap: '12px',
                    boxShadow: 'var(--shadow-lg)',
                    animation: 'slideInRight 0.3s ease-out'
                }}>
                    {toast.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{toast.message}</span>
                </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Payment QR Management</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Manage the official payment QR code used by students for admissions.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: '2rem', alignItems: 'start' }}>
                {/* Left Column: Active QR and Form */}
                <div className="space-y-8" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Active QR Card */}
                    <div className="card animate-fade-up delay-1" style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
                                Active Payment QR
                            </h3>
                            <Badge variant="success">Active</Badge>
                        </div>

                        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(255, 140, 66, 0.02)' }}>
                            {loading ? (
                                <div className="skeleton" style={{ width: '200px', height: '200px', margin: '0 auto', background: 'var(--color-border)', opacity: 0.2, borderRadius: '8px' }}></div>
                            ) : activeQr ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{
                                        padding: '1rem',
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        boxShadow: 'var(--shadow-md)',
                                        border: '1px solid var(--color-border)'
                                    }}>
                                        <img
                                            src={activeQr.public_url}
                                            alt={activeQr.qr_label}
                                            style={{ width: '200px', height: '200px', display: 'block' }}
                                        />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.25rem' }}>{activeQr.qr_label}</p>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                            Updated on {new Date(activeQr.uploaded_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: '2rem', color: 'var(--color-text-muted)' }}>
                                    <QrIcon size={48} strokeWidth={1} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                    <p>No active QR code found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <QrUploadForm
                        onSuccess={fetchData}
                        showToast={showToast}
                    />
                </div>

                {/* Right Column: History */}
                <div className="card animate-fade-up delay-2" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <History size={18} style={{ color: 'var(--color-primary)' }} />
                        <h3 style={{ fontSize: '1.125rem' }}>QR Upload History</h3>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: 'rgba(240, 228, 215, 0.2)', fontSize: '0.875rem' }}>
                                <tr>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Label</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Date Uploaded</th>
                                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <td colSpan={3} style={{ padding: '1.25rem' }}><div className="skeleton" style={{ height: '20px', background: 'var(--color-border)', opacity: 0.2 }}></div></td>
                                        </tr>
                                    ))
                                ) : history.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No history available.</td>
                                    </tr>
                                ) : (
                                    history.map((qr, index) => (
                                        <tr
                                            key={qr.qr_id}
                                            className="table-row animate-fade-up"
                                            style={{
                                                borderBottom: '1px solid var(--color-border)',
                                                animationDelay: `${(index + 3) * 60}ms`
                                            }}
                                        >
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ fontWeight: 500, fontSize: '0.925rem' }}>{qr.qr_label}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
                                                    <Calendar size={14} />
                                                    {new Date(qr.uploaded_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <Badge variant={qr.is_active ? 'success' : 'info'}>
                                                    {qr.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .table-row:hover { background-color: rgba(255, 140, 66, 0.03); }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
        </div>
    )
}
