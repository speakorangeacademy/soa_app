'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { courseSchema, CourseFormData, Course } from '@/types/course'
import { AlertCircle, Save, X } from 'lucide-react'

interface CourseFormProps {
    initialData?: Course
    onSubmit: (data: CourseFormData) => Promise<void>
    onCancel: () => void
    isLoading: boolean
}

export default function CourseForm({ initialData, onSubmit, onCancel, isLoading }: CourseFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema),
        defaultValues: initialData ? {
            course_name: initialData.course_name,
            course_level: initialData.course_level,
            language: initialData.language,
            course_description: initialData.course_description,
            course_duration: initialData.course_duration,
            total_fee: initialData.total_fee,
            mode: initialData.mode,
            course_status: initialData.course_status,
        } : {
            course_status: 'Active',
            mode: 'Offline'
        }
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                    <label className="label">Course Name</label>
                    <input
                        {...register('course_name')}
                        className={errors.course_name ? 'error' : ''}
                        placeholder="e.g. Spoken English Basic"
                    />
                    {errors.course_name && <p className="error-text"><AlertCircle size={14} /> {errors.course_name.message}</p>}
                </div>

                <div className="form-group">
                    <label className="label">Course Level</label>
                    <input
                        {...register('course_level')}
                        className={errors.course_level ? 'error' : ''}
                        placeholder="e.g. Level 1"
                    />
                    {errors.course_level && <p className="error-text"><AlertCircle size={14} /> {errors.course_level.message}</p>}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="form-group">
                    <label className="label">Language</label>
                    <input
                        {...register('language')}
                        className={errors.language ? 'error' : ''}
                        placeholder="e.g. English"
                    />
                    {errors.language && <p className="error-text"><AlertCircle size={14} /> {errors.language.message}</p>}
                </div>

                <div className="form-group">
                    <label className="label">Course Duration</label>
                    <input
                        {...register('course_duration')}
                        className={errors.course_duration ? 'error' : ''}
                        placeholder="e.g. 3 Months"
                    />
                    {errors.course_duration && <p className="error-text"><AlertCircle size={14} /> {errors.course_duration.message}</p>}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="form-group">
                    <label className="label">Total Fee (₹)</label>
                    <input
                        {...register('total_fee')}
                        type="number"
                        step="0.01"
                        className={errors.total_fee ? 'error' : ''}
                        placeholder="0.00"
                    />
                    {errors.total_fee && <p className="error-text"><AlertCircle size={14} /> {errors.total_fee.message}</p>}
                </div>

                <div className="form-group">
                    <label className="label">Mode</label>
                    <select {...register('mode')} className={errors.mode ? 'error' : ''}>
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                        <option value="Hybrid">Hybrid</option>
                    </select>
                    {errors.mode && <p className="error-text"><AlertCircle size={14} /> {errors.mode.message}</p>}
                </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="label">Course Status</label>
                <select {...register('course_status')} className={errors.course_status ? 'error' : ''}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
                {errors.course_status && <p className="error-text"><AlertCircle size={14} /> {errors.course_status.message}</p>}
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="label">Description</label>
                <textarea
                    {...register('course_description')}
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    placeholder="Detailed course description..."
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                <button
                    type="button"
                    onClick={onCancel}
                    style={{ background: 'none', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : (
                        <>
                            <Save size={18} />
                            {initialData ? 'Update Course' : 'Create Course'}
                        </>
                    )}
                </button>
            </div>

            <style jsx>{`
        .form-group { display: flex; flexDirection: column; }
        .label { font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--color-text); }
      `}</style>
        </form>
    )
}
