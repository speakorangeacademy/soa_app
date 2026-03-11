'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Badge, Skeleton } from '@/components/common/ui'
import { Clock, Users, AlertCircle, CheckCircle2, Calendar } from 'lucide-react'

interface Batch {
    id: string
    name: string
    schedule: string
    start_date: string
    max_capacity: number
    current_enrollment_count: number
    status: 'Open' | 'Full' | 'Closed'
}

interface BatchStatusListProps {
    courseId: string
    selectedBatchId?: string
    onSelect: (batchId: string) => void
}

export default function BatchStatusList({ courseId, selectedBatchId, onSelect }: BatchStatusListProps) {
    const [batches, setBatches] = useState<Batch[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchBatches = useCallback(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('batches')
                .select('id, name, schedule, start_date, max_capacity, current_enrollment_count, status')
                .eq('course_id', courseId)
                .order('start_date', { ascending: true })

            if (fetchError) throw fetchError
            setBatches(data as Batch[])
        } catch (err) {
            console.error('Error fetching batches:', err)
            setError('Unable to load batches. Please refresh the page.')
        } finally {
            setLoading(false)
        }
    }, [courseId, supabase])

    useEffect(() => {
        if (!courseId) {
            setBatches([])
            setLoading(false)
            return
        }

        setLoading(true)
        fetchBatches()

        const channel = supabase
            .channel(`batch-status-${courseId}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'batches', filter: `course_id=eq.${courseId}` },
                () => {
                    fetchBatches()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [courseId, fetchBatches, supabase])

    // Auto-deselect if selected batch becomes full or closed
    useEffect(() => {
        if (selectedBatchId) {
            const selectedBatch = batches.find(b => b.id === selectedBatchId)
            if (selectedBatch) {
                const availableSeats = selectedBatch.max_capacity - selectedBatch.current_enrollment_count
                if (selectedBatch.status !== 'Open' || availableSeats <= 0) {
                    onSelect('') // Clear selection in parent
                    // Use a slightly delayed alert or toast to avoid render-cycle issues
                    setTimeout(() => {
                        alert('Selected batch just became full or unavailable. Please choose another batch.')
                    }, 0)
                }
            }
        }
    }, [batches, selectedBatchId, onSelect])

    if (loading) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {[1, 2].map(i => (
                    <Skeleton key={i} style={{ height: '100px', width: '100%', borderRadius: '12px' }} />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div style={{ padding: '1rem', backgroundColor: 'rgba(229, 57, 53, 0.05)', borderRadius: '8px', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(229, 57, 53, 0.1)' }}>
                <AlertCircle size={20} />
                <p style={{ fontSize: '0.875rem' }}>{error}</p>
            </div>
        )
    }

    if (batches.length === 0) {
        return (
            <div style={{ padding: '2.5rem 2rem', textAlign: 'center', backgroundColor: 'rgba(255, 140, 66, 0.02)', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No batches available for this course at the moment.</p>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {batches.map((batch, index) => {
                const availableSeats = batch.max_capacity - batch.current_enrollment_count
                const isFull = batch.status === 'Full' || availableSeats <= 0
                const isClosed = batch.status === 'Closed'
                const isDisabled = isFull || isClosed
                const isSelected = selectedBatchId === batch.id

                return (
                    <div
                        key={batch.id}
                        onClick={() => !isDisabled && onSelect(batch.id)}
                        className="animate-fade-up"
                        style={{
                            animationDelay: `${index * 60}ms`,
                            padding: '1.25rem',
                            borderRadius: '12px',
                            border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            backgroundColor: isSelected ? 'rgba(255, 140, 66, 0.04)' : 'var(--color-surface)',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            opacity: isDisabled ? 0.6 : 1,
                            transition: 'all 200ms ease-out',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                            transform: isSelected ? 'scale(1.01)' : 'scale(1)'
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <h4 style={{ fontWeight: 600, fontSize: '1.05rem', color: isSelected ? 'var(--color-primary)' : 'var(--color-text)' }}>
                                    {batch.name}
                                </h4>
                                {isSelected && <CheckCircle2 size={18} style={{ color: 'var(--color-primary)' }} />}
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                    <Clock size={14} style={{ opacity: 0.7 }} />
                                    <span>{batch.schedule}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                    <Users size={14} style={{ opacity: 0.7 }} />
                                    <span style={{ fontWeight: availableSeats < 5 && availableSeats > 0 ? 600 : 400, color: availableSeats < 5 && availableSeats > 0 ? 'var(--color-warning)' : 'inherit' }}>
                                        {availableSeats > 0 ? `${availableSeats} seats left` : 'Batch Full'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', marginLeft: '1rem' }}>
                            <Badge variant={isClosed ? 'danger' : (isFull ? 'warning' : 'success')}>
                                {isClosed ? 'Closed' : (isFull ? 'Full' : 'Open')}
                            </Badge>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                <Calendar size={12} style={{ opacity: 0.7 }} />
                                <span>Starts: {new Date(batch.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                            </div>
                        </div>

                        {isDisabled && (
                            <div
                                title={isClosed ? "This batch is closed" : "This batch is full"}
                                style={{ position: 'absolute', inset: 0, zIndex: 1 }}
                            />
                        )}
                    </div>
                )
            })}

            <style jsx>{`
                .animate-fade-up {
                    animation: fadeUp 0.4s ease-out forwards;
                    opacity: 0;
                    transform: translateY(10px);
                }
                @keyframes fadeUp {
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
