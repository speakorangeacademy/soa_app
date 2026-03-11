'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { Course, CourseFormData } from '@/types/course'
import { Modal, Badge } from '@/components/common/ui'
import CourseForm from './course-form'

interface CoursePageProps {
    role: string
}

export default function CoursePage({ role }: CoursePageProps) {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState<Course | null>(null)
    const [formLoading, setFormLoading] = useState(false)
    const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const isSuperAdmin = role === 'Super Admin'

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/courses')
            const data = await res.json()
            if (res.ok) {
                setCourses(data)
            } else {
                showToast('error', data.error || 'Failed to fetch courses')
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

    const handleSubmit = async (data: CourseFormData) => {
        setFormLoading(true)
        try {
            const url = editingCourse ? `/api/courses/${editingCourse.course_id}` : '/api/courses'
            const method = editingCourse ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            const result = await res.json()

            if (res.ok) {
                showToast('success', editingCourse ? 'Course updated successfully' : 'Course created successfully')
                setIsModalOpen(false)
                fetchCourses()
            } else {
                showToast('error', result.error || 'Something went wrong')
            }
        } catch (err) {
            showToast('error', 'Failed to save course')
        } finally {
            setFormLoading(false)
        }
    }

    const handleDeactivate = async (id: string) => {
        try {
            const res = await fetch(`/api/courses/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ course_status: 'Inactive' })
            })

            if (res.ok) {
                showToast('success', 'Course deactivated successfully')
                setDeleteConfirm(null)
                fetchCourses()
            } else {
                const data = await res.json()
                showToast('error', data.error || 'Failed to deactivate course')
            }
        } catch (err) {
            showToast('error', 'Network error')
        }
    }

    const filteredCourses = courses.filter(c =>
        c.course_name.toLowerCase().includes(search.toLowerCase()) ||
        c.course_level.toLowerCase().includes(search.toLowerCase())
    )

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
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Course Management</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Create and manage academy courses and details.</p>
                </div>

                {isSuperAdmin && (
                    <button onClick={() => { setEditingCourse(null); setIsModalOpen(true); }}>
                        <Plus size={18} />
                        Add New Course
                    </button>
                )}
            </div>

            {/* Toolbar */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', gap: '1rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        placeholder="Search courses by name or level..."
                        style={{ paddingLeft: '2.5rem' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: 'rgba(240, 228, 215, 0.3)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0 }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Course Details</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Language</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Duration / Mode</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Total Fee</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Status</th>
                                {isSuperAdmin && <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <td colSpan={6} style={{ padding: '1.5rem' }}><div className="skeleton" style={{ height: '24px', width: '100%', background: 'var(--color-border)', opacity: 0.3, borderRadius: '4px' }}></div></td>
                                    </tr>
                                ))
                            ) : filteredCourses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        No courses found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredCourses.map((course, index) => (
                                    <tr key={course.course_id} className="table-row" style={{ borderBottom: '1px solid var(--color-border)', transition: '0.2s', animationDelay: `${index * 50}ms` }}>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ fontWeight: 600 }}>{course.course_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{course.course_level}</div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>{course.language}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ fontSize: '0.875rem' }}>{course.course_duration}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{course.mode}</div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>₹{course.total_fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <Badge variant={course.course_status === 'Active' ? 'success' : 'warning'}>
                                                {course.course_status}
                                            </Badge>
                                        </td>
                                        {isSuperAdmin && (
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => { setEditingCourse(course); setIsModalOpen(true); }}
                                                        style={{ padding: '8px', background: 'none', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', minHeight: 'unset' }}
                                                        className="icon-button"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(course.course_id)}
                                                        style={{ padding: '8px', background: 'none', color: 'var(--color-danger)', border: '1px solid rgba(229, 57, 53, 0.1)', minHeight: 'unset' }}
                                                        className="icon-button delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCourse ? 'Edit Course' : 'Add New Course'}
            >
                <CourseForm
                    initialData={editingCourse || undefined}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={formLoading}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Confirm Deactivation"
            >
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ color: 'var(--color-warning)', marginBottom: '1.5rem' }}>
                        <AlertTriangle size={48} style={{ margin: '0 auto' }} />
                    </div>
                    <p style={{ marginBottom: '2rem', color: 'var(--color-text)' }}>
                        Are you sure you want to deactivate this course? This will set the status to <strong>Inactive</strong>.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            style={{ background: 'none', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => deleteConfirm && handleDeactivate(deleteConfirm)}
                            style={{ backgroundColor: 'var(--color-danger)' }}
                        >
                            Deactivate Course
                        </button>
                    </div>
                </div>
            </Modal>

            <style jsx>{`
        .table-row:hover { background-color: rgba(255, 140, 66, 0.03); }
        .icon-button:hover { color: var(--color-primary); border-color: var(--color-primary); background-color: rgba(255, 140, 66, 0.05); }
        .icon-button.delete:hover { color: white; background-color: var(--color-danger); border-color: var(--color-danger); }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
        </div>
    )
}
