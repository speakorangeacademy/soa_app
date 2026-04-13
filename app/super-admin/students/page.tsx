'use client'

import React, { useState } from 'react'
import { StudentSearch } from '@/components/admin/student-search'
import { StudentProfileForm } from '@/components/admin/student-profile-form'
import { StudentProfileData, StudentProfileFull } from '@/types/student'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, User, AlertCircle } from 'lucide-react'
import { Button } from '@/components/common/ui'
import Link from 'next/link'

export default function StudentsPage() {
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

            setStudent({ ...student, ...result.updated_student })
            setUpdateSuccess(true)
            setTimeout(() => setUpdateSuccess(false), 5000)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '1000px' }}>
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/super-admin/dashboard">
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
                                    width: '48px', height: '48px', borderRadius: '50%',
                                    backgroundColor: 'var(--color-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                }}>
                                    <User size={24} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem' }}>{student.first_name} {student.last_name}</h2>
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
    )
}
