'use client'

import React from 'react'
import { Calendar, Clock, MapPin, Users, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/common/ui'

interface Batch {
    id: string
    name: string
    course_name: string
    start_date: string
    timing: string
    capacity: number
    enrollment_count: number
    status: string
}

interface BatchCardProps {
    batch: Batch
    onClick: (id: string) => void
    isActive: boolean
}

export default function BatchCard({ batch, onClick, isActive }: BatchCardProps) {
    const isFull = batch.enrollment_count >= batch.capacity

    return (
        <div
            onClick={() => onClick(batch.id)}
            style={{
                backgroundColor: 'var(--color-surface)',
                border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: '16px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease-out',
                boxShadow: isActive ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                transform: isActive ? 'translateY(-2px)' : 'none',
                position: 'relative',
                overflow: 'hidden'
            }}
            className="batch-card"
        >
            {/* Active Indicator */}
            {isActive && (
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: 'var(--color-primary)' }} />
            )}

            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ fontSize: '1.125rem', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>{batch.course_name}</h3>
                    <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9375rem' }}>{batch.name}</p>
                </div>
                <Badge variant={isFull ? 'danger' : 'success'}>
                    {isFull ? 'Full' : 'Open'}
                </Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    <Calendar size={14} />
                    <span>Starts {new Date(batch.start_date).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    <Clock size={14} />
                    <span>{batch.timing}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    <Users size={14} />
                    <span>{batch.enrollment_count} / {batch.capacity} Enrolled</span>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-bg)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${(batch.enrollment_count / batch.capacity) * 100}%`,
                        height: '100%',
                        backgroundColor: isFull ? 'var(--color-danger)' : 'var(--color-success)',
                        borderRadius: '10px'
                    }} />
                </div>
                <ChevronRight
                    size={20}
                    style={{
                        marginLeft: '1rem',
                        color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        transform: isActive ? 'translateX(2px)' : 'none',
                        transition: '0.2s'
                    }}
                />
            </div>

            <style jsx>{`
                .batch-card:hover {
                    border-color: var(--color-primary);
                    box-shadow: var(--shadow-md);
                }
            `}</style>
        </div>
    )
}
