'use client'

import React, { useState, useEffect } from 'react'
import { GraduationCap, LogOut, BookOpen, AlertCircle, Users, LayoutDashboard, Settings } from 'lucide-react'
import { logout } from '@/app/auth/actions'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import BatchCard from '@/components/teacher/batch-card'
import StudentTable from '@/components/teacher/student-table'
import ChecklistCard from '@/components/teacher/checklist-card'

interface Teacher {
    id: string
    name: string
}

export default function TeacherDashboard() {
    const router = useRouter()
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
    const [teacher, setTeacher] = useState<Teacher | null>(null)

    // 1. Fetch Teacher Profile
    const { data: profile } = useQuery({
        queryKey: ['teacher-profile'],
        queryFn: async () => {
            const { data: { user } } = await (await fetch('/api/auth/session')).json() // Fallback if no direct endpoint
            const res = await fetch(`/api/teacher/profile`)
            return res.json()
        }
    })

    // 2. Fetch Batches
    const { data: batches, isLoading: batchesLoading, error: batchesError } = useQuery({
        queryKey: ['teacher-batches'],
        queryFn: async () => {
            const res = await fetch('/api/teacher/batches')
            if (!res.ok) throw new Error('Failed to load batches')
            return res.json()
        }
    })

    // 3. Fetch Students for selected batch
    const { data: students, isLoading: studentsLoading, error: studentsError } = useQuery({
        queryKey: ['batch-students', selectedBatchId],
        queryFn: async () => {
            if (!selectedBatchId) return []
            const res = await fetch(`/api/teacher/batches/${selectedBatchId}/students`)
            if (!res.ok) throw new Error('Failed to load students')
            return res.json()
        },
        enabled: !!selectedBatchId
    })

    // Set first batch as default selection if none selected
    useEffect(() => {
        if (batches && batches.length > 0 && !selectedBatchId) {
            setSelectedBatchId(batches[0].id)
        }
    }, [batches, selectedBatchId])

    const selectedBatch = batches?.find((b: any) => b.id === selectedBatchId)

    return (
        <div className="container min-h-screen" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            {/* Nav Header */}
            <header className="animate-fade-up" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ color: 'var(--color-primary)', backgroundColor: 'rgba(255, 140, 66, 0.1)', padding: '12px', borderRadius: '16px' }}>
                        <LayoutDashboard size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', color: 'var(--color-text)' }}>
                            Welcome, {profile?.name || 'Teacher'}
                        </h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Monitor your assigned batches and student enrollments.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => router.push('/settings')}
                        className="settings-btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--color-border)', padding: '0 1rem', borderRadius: '4px', cursor: 'pointer', transition: 'all 150ms ease-out' }}
                    >
                        <Settings size={18} />
                        Settings
                    </button>
                    <button
                        onClick={() => logout()}
                        className="logout-btn"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </header>

            {batchesError ? (
                <div className="card text-center" style={{ padding: '4rem' }}>
                    <AlertCircle size={48} color="var(--color-danger)" style={{ margin: '0 auto 1.5rem' }} />
                    <h3 style={{ marginBottom: '0.5rem' }}>Failed to load dashboard data</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>Unable to load batches. Please refresh the page or contact support.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar: Batches */}
                    <aside className="lg:col-span-4 animate-fade-up delay-1">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <BookOpen size={20} color="var(--color-primary)" />
                            <h2 style={{ fontSize: '1.25rem' }}>Assigned Batches</h2>
                        </div>

                        {batchesLoading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[1, 2, 3].map(i => <div key={i} className="skeleton-card" />)}
                            </div>
                        ) : batches?.length === 0 ? (
                            <div className="card text-center" style={{ padding: '3rem 1.5rem' }}>
                                <GraduationCap size={48} style={{ margin: '0 auto 1rem', opacity: 0.1 }} />
                                <p style={{ color: 'var(--color-text-muted)' }}>You have no assigned batches yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {batches?.map((batch: any) => (
                                    <BatchCard
                                        key={batch.id}
                                        batch={batch}
                                        onClick={setSelectedBatchId}
                                        isActive={selectedBatchId === batch.id}
                                    />
                                ))}
                            </div>
                        )}
                    </aside>

                    {/* Right Content: Student Roster & Checklist */}
                    {selectedBatchId ? (
                        <main className="lg:col-span-8 animate-fade-up delay-2">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {/* Students Section */}
                                <section className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Users size={20} color="var(--color-primary)" />
                                            <h2 style={{ fontSize: '1.25rem' }}>Student Roster</h2>
                                        </div>
                                        {selectedBatch && (
                                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                                                {selectedBatch.enrollment_count} Students Enrolled
                                            </div>
                                        )}
                                    </div>
                                    <StudentTable students={students || []} isLoading={studentsLoading} />
                                </section>

                                {/* Checklist Section */}
                                <section className="animate-fade-up delay-3">
                                    <ChecklistCard batchId={selectedBatchId} />
                                </section>
                            </div>
                        </main>
                    ) : !batchesLoading && (
                        <div className="lg:col-span-8 flex-center card" style={{ minHeight: '400px', backgroundColor: 'rgba(255, 140, 66, 0.02)', borderStyle: 'dashed' }}>
                            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                <BookOpen size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
                                <h3>Select a batch to view details</h3>
                                <p>Choose a batch from the sidebar to manage students and checklists.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                .grid { display: grid; }
                .logout-btn {
                    background-color: transparent;
                    color: var(--color-text-muted);
                    border: 1px solid var(--color-border);
                    min-height: 40px;
                    padding: 0 1rem;
                }
                .logout-btn:hover {
                    background-color: var(--color-bg);
                    color: var(--color-danger);
                    border-color: var(--color-danger);
                }
                .settings-btn:hover {
                    background-color: var(--color-bg);
                    color: var(--color-primary);
                    border-color: var(--color-primary);
                }
                @media (min-width: 1024px) {
                    .lg\\:col-span-4 { grid-column: span 4 / span 12; }
                    .lg\\:col-span-8 { grid-column: span 8 / span 12; }
                }
                .skeleton-card {
                    height: 160px;
                    background: var(--color-surface);
                    border: 1px solid var(--color-border);
                    border-radius: 16px;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
            `}</style>
        </div>
    )
}
