'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Search, CheckCircle2, XCircle, Users, Calendar, Clock } from 'lucide-react'
import { Batch, BatchFormData } from '@/types/batch'
import { Modal, Badge } from '@/components/common/ui'
import BatchForm from './batch-form'

export default function BatchPage() {
    const [batches, setBatches] = useState<Batch[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
    const [formLoading, setFormLoading] = useState(false)
    const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    useEffect(() => {
        fetchBatches()
    }, [])

    const fetchBatches = async () => {
        try {
            const res = await fetch('/api/batches')
            const data = await res.json()
            if (res.ok) {
                setBatches(data)
            } else {
                showToast('error', data.error || 'Failed to fetch batches')
            }
        } catch (err) {
            showToast('error', 'Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message })
        setTimeout(() => setToast(null), 5000)
    }

    const handleSubmit = async (data: BatchFormData) => {
        setFormLoading(true)
        try {
            const url = editingBatch ? `/api/batches/${editingBatch.batch_id}` : '/api/batches'
            const method = editingBatch ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            const result = await res.json()

            if (res.ok) {
                showToast('success', editingBatch ? 'Batch updated successfully' : 'Batch created successfully')
                setIsModalOpen(false)
                fetchBatches()
            } else {
                showToast('error', result.error || 'Something went wrong')
            }
        } catch (err) {
            showToast('error', 'Failed to save batch')
        } finally {
            setFormLoading(false)
        }
    }

    const filteredBatches = batches.filter(b =>
        b.batch_name.toLowerCase().includes(search.toLowerCase()) ||
        b.course_name?.toLowerCase().includes(search.toLowerCase()) ||
        b.teacher_name?.toLowerCase().includes(search.toLowerCase())
    )

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Open': return 'success'
            case 'Full': return 'warning'
            case 'Closed': return 'danger'
            default: return 'info'
        }
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
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: 'var(--shadow-lg)',
                    animation: 'slideInRight 0.3s ease-out'
                }}>
                    {toast.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{toast.message}</span>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Batch Management</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Manage academic schedules, teacher assignments, and capacity.</p>
                </div>

                <button onClick={() => { setEditingBatch(null); setIsModalOpen(true); }}>
                    <Plus size={18} />
                    Create New Batch
                </button>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', gap: '1rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        placeholder="Search batches, courses, or teachers..."
                        style={{ paddingLeft: '2.5rem' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: 'rgba(240, 228, 215, 0.3)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 10 }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Batch & Course</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Teacher</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Timeline & Timing</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Capacity</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <td colSpan={6} style={{ padding: '1.5rem' }}><div className="skeleton" style={{ height: '40px', background: 'var(--color-border)', opacity: 0.3, borderRadius: '4px' }}></div></td>
                                    </tr>
                                ))
                            ) : filteredBatches.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        No batches found.
                                    </td>
                                </tr>
                            ) : (
                                filteredBatches.map((batch, index) => {
                                    const fillPercentage = (batch.current_enrollment_count / batch.max_capacity) * 100
                                    return (
                                        <tr key={batch.batch_id} className="table-row" style={{ borderBottom: '1px solid var(--color-border)', transition: '0.2s', animationDelay: `${index * 50}ms` }}>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{batch.batch_name}</div>
                                                <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                                                    <CheckCircle2 size={12} /> {batch.course_name}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                                    <Users size={16} style={{ color: 'var(--color-text-muted)' }} />
                                                    {batch.teacher_name || <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>Unassigned</span>}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                                    <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
                                                    {batch.start_date} to {batch.end_date}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                    <Clock size={14} />
                                                    {batch.batch_timing}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ width: '120px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.375rem' }}>
                                                        <span>{batch.current_enrollment_count}/{batch.max_capacity}</span>
                                                        <span>{Math.round(fillPercentage)}%</span>
                                                    </div>
                                                    <div style={{ height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div style={{
                                                            width: `${fillPercentage}%`,
                                                            height: '100%',
                                                            backgroundColor: fillPercentage >= 100 ? 'var(--color-warning)' : 'var(--color-primary)',
                                                            transition: 'width 0.5s ease-out'
                                                        }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <Badge variant={getStatusVariant(batch.batch_status)}>
                                                    {batch.batch_status}
                                                </Badge>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => { setEditingBatch(batch); setIsModalOpen(true); }}
                                                    style={{ padding: '8px', background: 'none', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', minHeight: 'unset' }}
                                                    className="icon-button"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingBatch ? 'Edit Batch' : 'Create New Batch'}
            >
                <BatchForm
                    initialData={editingBatch || undefined}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={formLoading}
                />
            </Modal>

            <style jsx>{`
        .table-row:hover { background-color: rgba(255, 140, 66, 0.03); }
        .icon-button:hover { color: var(--color-primary); border-color: var(--color-primary); background-color: rgba(255, 140, 66, 0.05); }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
        </div>
    )
}
