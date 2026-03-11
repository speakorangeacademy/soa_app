'use client'

import React, { useState } from 'react'
import { StudentSearch } from '@/components/admin/student-search'
import { StudentProfileForm } from '@/components/admin/student-profile-form'
import { StudentProfileData, StudentProfileFull } from '@/types/student'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, User, AlertCircle } from 'lucide-react'
import { Button } from '@/components/common/ui'
import Link from 'next/link'

export default function StudentLookupPage() {
    const [student, setStudent] = useState<StudentProfileFull | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [updateSuccess, setUpdateSuccess] = useState(false)

    const handleSearch = async (studentId: string) => {
        setIsLoading(true)
        setError(null)
        setStudent(null)
        setUpdateSuccess(false)

        try {
            const response = await fetch(`/api/admin/students/${studentId}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch student profile.')
            }

            setStudent(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async (data: StudentProfileData) => {
        if (!student) return

        setIsSaving(true)
        setError(null)
        setUpdateSuccess(false)

        try {
            const response = await fetch(`/api/admin/students/${student.student_id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update student profile.')
            }

            if (result.message === 'No changes to save.') {
                // Handle as success but maybe different feedback if desired
                setUpdateSuccess(true)
                return
            }

            setStudent({ ...student, ...result.updated_student })
            setUpdateSuccess(true)

            // Auto hide success message after 5 seconds
            setTimeout(() => setUpdateSuccess(false), 5000)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link href="/admin/dashboard">
                            <Button variant="ghost" size="sm" style={{ padding: '8px' }}>
                                <ArrowLeft size={20} />
                            </Button>
                        </Link>
                        <div>
                            <h1 style={{ fontSize: '1.75rem', color: 'var(--color-text)' }}>Student Profile Lookup & Edit</h1>
                            <p style={{ color: 'var(--color-text-muted)' }}>Search by Student ID to view or update personal details</p>
                        </div>
                    </div>
                    {student && (
                        <Button variant="outline" size="sm" onClick={() => setStudent(null)}>
                            Clear Search
                        </Button>
                    )}
                </motion.div>

                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <AnimatePresence mode="wait">
                        {!student ? (
                            <motion.div
                                key="search"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <StudentSearch onSearch={handleSearch} isLoading={isLoading} />

                                {error && !isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{
                                            maxWidth: '600px',
                                            margin: '1.5rem auto 0',
                                            padding: '1rem',
                                            backgroundColor: 'rgba(229, 57, 53, 0.1)',
                                            border: '1px solid var(--color-danger)',
                                            borderRadius: '8px',
                                            color: 'var(--color-danger)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem'
                                        }}
                                    >
                                        <AlertCircle size={20} />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <header style={{
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem',
                                    background: 'var(--color-surface)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--color-border)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--color-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.25rem' }}>{student.first_name || student.student_full_name} {student.last_name || ''}</h2>
                                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>ID: {student.student_id}</p>
                                    </div>
                                    {error && (
                                        <div style={{ marginLeft: 'auto', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                            <AlertCircle size={16} />
                                            {error}
                                        </div>
                                    )}
                                </header>

                                <StudentProfileForm
                                    student={student}
                                    onSave={handleSave}
                                    isSubmitting={isSaving}
                                    isSuccess={updateSuccess}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Custom Background Styles (Verbatim from design enforcement) */}
            <style jsx global>{`
                :root {
                    --color-bg: #FFF9F4;
                    --color-surface: #FFFFFF;
                    --color-border: #F0E4D7;
                    --color-text: #2C2416;
                    --color-text-muted: #8B7355;
                    --color-primary: #FF8C42;
                    --color-accent: #D94E1F;
                    --color-success: #4CAF50;
                    --color-warning: #FFC107;
                    --color-danger: #E53935;
                }

                body {
                    background: radial-gradient(circle at center, #FFF9F4 0%, #FFF4E8 100%) !important;
                    position: relative;
                }

                body::before {
                    content: "";
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0.03;
                    pointer-events: none;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                    z-index: -1;
                }

                h1, h2, h3, h4, h5, h6 {
                    font-family: 'Outfit', sans-serif !important;
                    font-weight: 600 !important;
                }

                div, p, span, label, input, button, textarea, select {
                    font-family: 'Work Sans', sans-serif;
                }

                button {
                    border-radius: 4px !important;
                    transition: 150ms ease-out !important;
                    min-height: 44px !important;
                }

                input, select, textarea {
                    min-height: 44px !important;
                    transition: 150ms ease-out !important;
                    border-radius: 4px !important;
                }

                input:focus, select:focus, textarea:focus {
                    box-shadow: 0 0 0 2px var(--color-primary) !important;
                }

                .card {
                    background: var(--color-surface);
                    border: 1px solid var(--color-border);
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(44, 36, 22, 0.05);
                }
            `}</style>
        </div>
    )
}
