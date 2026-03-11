'use client'

import React, { useState, useEffect } from 'react'
import { CheckSquare, Square, Save, Loader2, CheckCircle2 } from 'lucide-react'

interface ChecklistCardProps {
    batchId: string
}

const CHECKLIST_ITEMS = [
    { id: 'welcome_kit', label: 'Welcome Kit Distributed' },
    { id: 'books', label: 'Course Books Distributed' },
    { id: 'id_card', label: 'Student ID Cards Issued' },
    { id: 'parent_onboarding', label: 'Parent Group Onboarding' }
]

export default function ChecklistCard({ batchId }: ChecklistCardProps) {
    const [values, setValues] = useState<Record<string, boolean>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<string | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(() => {
        fetchChecklist()
    }, [batchId])

    const fetchChecklist = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/teacher/batches/${batchId}/checklist`)
            const data = await res.json()
            if (data && data.item_values) {
                setValues(data.item_values)
                setLastUpdated(data.updated_at)
            }
        } catch (err) {
            console.error('Failed to fetch checklist')
        } finally {
            setIsLoading(false)
        }
    }

    const toggleItem = (id: string) => {
        setValues(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await fetch(`/api/teacher/batches/${batchId}/checklist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_values: values })
            })
            if (res.ok) {
                setShowSuccess(true)
                setLastUpdated(new Date().toISOString())
                setTimeout(() => setShowSuccess(false), 3000)
            }
        } catch (err) {
            alert('Checklist update failed. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" color="var(--color-primary)" />
            </div>
        )
    }

    return (
        <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckSquare size={20} color="var(--color-primary)" />
                Batch Distribution Checklist
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {CHECKLIST_ITEMS.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '1rem',
                            backgroundColor: values[item.id] ? 'rgba(76, 175, 80, 0.05)' : 'var(--color-bg)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            border: `1px solid ${values[item.id] ? 'var(--color-success)40' : 'var(--color-border)'}`,
                            transition: 'var(--transition-fast)'
                        }}
                    >
                        {values[item.id] ? (
                            <CheckSquare size={20} color="var(--color-success)" />
                        ) : (
                            <Square size={20} color="var(--color-text-muted)" />
                        )}
                        <span style={{ fontWeight: 500, color: values[item.id] ? 'var(--color-success)' : 'var(--color-text)' }}>
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {lastUpdated && `Last updated: ${new Date(lastUpdated).toLocaleString()}`}
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', minWidth: '140px' }}
                >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : (
                        showSuccess ? (
                            <><CheckCircle2 size={18} /> Saved</>
                        ) : (
                            <><Save size={18} /> Save Checklist</>
                        )
                    )}
                </button>
            </div>

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
