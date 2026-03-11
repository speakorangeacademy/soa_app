'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Users, BookOpen, UserPlus, AlertCircle,
    CheckCircle2, Loader2, Info, ArrowRight,
    Search
} from 'lucide-react'
import { Modal } from '@/components/common/ui'

interface Teacher {
    id: string
    name: string
    email: string
}

interface Batch {
    id: string
    name: string
    course_name: string
    timing: string
    enrollment_count: number
    capacity: number
    teacher_id: string | null
}

export default function AssignTeacherCard() {
    const queryClient = useQueryClient()
    const [selectedBatchId, setSelectedBatchId] = useState('')
    const [selectedTeacherId, setSelectedTeacherId] = useState('')
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    // Data Fetching
    const { data: batches, isLoading: loadingBatches } = useQuery<Batch[]>({
        queryKey: ['admin-batches'],
        queryFn: async () => {
            const res = await fetch('/api/teacher/batches') // Reusing this for now or could create a specific admin one
            // Wait, I need an admin-specific list if I want ALL batches, not just assigned to current teacher
            // Let's create an admin/batches/list endpoint if it doesn't exist
            const adminRes = await fetch('/api/admin/batches/list')
            return adminRes.json()
        }
    })

    const { data: teachers, isLoading: loadingTeachers } = useQuery<Teacher[]>({
        queryKey: ['admin-teachers'],
        queryFn: async () => {
            const res = await fetch('/api/teachers/list')
            return res.json()
        }
    })

    // Assignment Mutation
    const assignmentMutation = useMutation({
        mutationFn: async (data: { batchId: string, teacherId: string }) => {
            const res = await fetch('/api/admin/batches/assign-teacher', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Assignment failed')
            return result
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-batches'] })
            queryClient.invalidateQueries({ queryKey: ['teacher-batches'] })
            setToast({ type: 'success', message: data.message || 'Teacher assigned successfully!' })
            setSelectedBatchId('')
            setSelectedTeacherId('')
            setTimeout(() => setToast(null), 4000)
        },
        onError: (err: any) => {
            setToast({ type: 'error', message: err.message })
            setTimeout(() => setToast(null), 4000)
        }
    })

    const handleAssign = () => {
        if (!selectedBatchId || !selectedTeacherId) return

        const batch = batches?.find(b => b.id === selectedBatchId)
        if (batch?.teacher_id) {
            setIsReassignModalOpen(true)
        } else {
            assignmentMutation.mutate({ batchId: selectedBatchId, teacherId: selectedTeacherId })
        }
    }

    const confirmReassignment = () => {
        setIsReassignModalOpen(false)
        assignmentMutation.mutate({ batchId: selectedBatchId, teacherId: selectedTeacherId })
    }

    if (loadingBatches || loadingTeachers) {
        return (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: 'var(--color-primary)' }} />
                <p style={{ color: 'var(--color-text-muted)' }}>Preparing assignment tools...</p>
            </div>
        )
    }

    const currentBatch = batches?.find(b => b.id === selectedBatchId)
    const currentTeacher = teachers?.find(t => t.id === currentBatch?.teacher_id)

    return (
        <div className="card animate-fade-up">
            <header style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '8px', backgroundColor: 'rgba(255, 140, 66, 0.1)', color: 'var(--color-primary)', borderRadius: '10px' }}>
                        <UserPlus size={20} />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text)' }}>Batch Instructor Assignment</h2>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Link a teaching professional to a specific course batch.</p>
            </header>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Batch Selection */}
                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Select Batch</label>
                    <div style={{ position: 'relative' }}>
                        <BookOpen size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <select
                            value={selectedBatchId}
                            onChange={(e) => setSelectedBatchId(e.target.value)}
                            style={{ paddingLeft: '40px' }}
                        >
                            <option value="">Choose a Batch...</option>
                            {batches?.map(batch => (
                                <option key={batch.id} value={batch.id}>
                                    {batch.course_name} - {batch.name} ({batch.timing})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Teacher Selection */}
                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Assign Instructor</label>
                    <div style={{ position: 'relative' }}>
                        <Users size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <select
                            value={selectedTeacherId}
                            onChange={(e) => setSelectedTeacherId(e.target.value)}
                            style={{ paddingLeft: '40px' }}
                        >
                            <option value="">Select Teaching Professional...</option>
                            {teachers?.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name} ({teacher.email})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Current Assignment Info */}
                {selectedBatchId && (
                    <div style={{
                        padding: '1.25rem',
                        backgroundColor: 'var(--color-bg)',
                        borderRadius: '12px',
                        border: '1px dashed var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }} className="animate-fade-up">
                        <Info size={20} color="var(--color-text-muted)" />
                        <div style={{ fontSize: '0.875rem' }}>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2px' }}>Current Assignment:</p>
                            <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                                {currentBatch?.teacher_id ? (
                                    <>Already assigned to <span style={{ color: 'var(--color-primary)' }}>{currentTeacher?.name || 'Loading...'}</span></>
                                ) : 'No instructor assigned yet.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Validation/Toast Message */}
                {toast && (
                    <div className={`toast animate-fade-up ${toast.type}`} style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        backgroundColor: toast.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(229, 57, 53, 0.1)',
                        color: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                        border: `1px solid ${toast.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}40`
                    }}>
                        {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{toast.message}</span>
                    </div>
                )}

                <button
                    onClick={handleAssign}
                    disabled={!selectedBatchId || !selectedTeacherId || assignmentMutation.isPending}
                    style={{ marginTop: '1rem' }}
                >
                    {assignmentMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : (
                        <>Assign Instructor <ArrowRight size={18} /></>
                    )}
                </button>
            </div>

            {/* Reassign Modal */}
            {isReassignModalOpen && (
                <Modal
                    isOpen={isReassignModalOpen}
                    onClose={() => setIsReassignModalOpen(false)}
                    title="Instructor Reassignment"
                >
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{ color: 'var(--color-warning)', marginBottom: '1.5rem' }}>
                            <AlertCircle size={64} style={{ margin: '0 auto' }} />
                        </div>
                        <p style={{ color: 'var(--color-text)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                            This batch is currently assigned to <strong>{currentTeacher?.name}</strong>.
                            Are you sure you want to reassign it to <strong>{teachers?.find(t => t.id === selectedTeacherId)?.name}</strong>?
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button
                                onClick={() => setIsReassignModalOpen(false)}
                                style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReassignment}
                                style={{ backgroundColor: 'var(--color-danger)', color: 'white' }}
                            >
                                Confirm Reassign
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    )
}
