'use client'

import React, { useState } from 'react'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

interface IdCardToggleProps {
    studentId: string
    batchId: string
    initialStatus: boolean
    initialTimestamp: string | null
}

export default function IdCardToggle({
    studentId,
    batchId,
    initialStatus,
    initialTimestamp
}: IdCardToggleProps) {
    const [isDistributed, setIsDistributed] = useState(initialStatus)
    const [timestamp, setTimestamp] = useState(initialTimestamp)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)

    const handleToggle = async () => {
        const nextState = !isDistributed
        setIsLoading(true)
        setError(null)

        // Optimistic UI Update
        setIsDistributed(nextState)

        try {
            const res = await fetch('/api/batch-enrollment/id-card', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId,
                    batchId,
                    distributed: nextState
                })
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.error || 'Failed to update')
            }

            // Sync state with server response
            setIsDistributed(result.data.id_card_distributed)
            setTimestamp(result.data.id_card_distributed_at)

            if (result.data.id_card_distributed) {
                setShowSuccess(true)
                setTimeout(() => setShowSuccess(false), 2000)
            }
        } catch (err: any) {
            // Rollback on error
            setIsDistributed(!nextState)
            setError(err.message)
            setTimeout(() => setError(null), 3000)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                    onClick={!isLoading ? handleToggle : undefined}
                    style={{
                        width: '42px',
                        height: '24px',
                        backgroundColor: isDistributed ? 'var(--color-success)' : 'var(--color-border)',
                        borderRadius: '20px',
                        padding: '2px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'var(--transition-fast)',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isDistributed ? 'flex-end' : 'flex-start',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                    }}
                    className="id-toggle-track"
                >
                    <div style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }} />

                    {isLoading && (
                        <div style={{ position: 'absolute', right: isDistributed ? '48px' : '-24px', transition: '0.2s' }}>
                            <Loader2 size={14} className="animate-spin" color="var(--color-primary)" />
                        </div>
                    )}
                </div>

                {showSuccess && (
                    <CheckCircle2 size={18} color="var(--color-success)" className="animate-bounce-subtle" />
                )}
            </div>

            {isDistributed && timestamp && (
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', animation: 'fade-in 0.3s' }}>
                    Sent: {new Date(timestamp).toLocaleDateString()}
                </span>
            )}

            {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-danger)', fontSize: '0.7rem' }}>
                    <AlertCircle size={10} />
                    <span>{error}</span>
                </div>
            )}

            <style jsx>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes bounce { 
                    0% { transform: scale(1); } 
                    50% { transform: scale(1.2); } 
                    100% { transform: scale(1); } 
                }
                @keyframes fade-in { from { opacity: 0; transform: translateY(-2px); } to { opacity: 1; transform: translateY(0); } }
                .animate-spin { animation: spin 1s linear infinite; }
                .animate-bounce-subtle { animation: bounce 0.4s ease-out; }
                .id-toggle-track:hover:not(:disabled) {
                    filter: brightness(1.05);
                }
            `}</style>
        </div>
    )
}
