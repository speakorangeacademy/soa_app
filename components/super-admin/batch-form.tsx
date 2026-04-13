'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { batchSchema, BatchFormData, Batch } from '@/types/batch'
import { AlertCircle, Save } from 'lucide-react'

interface BatchFormProps {
    initialData?: Batch
    onSubmit: (data: BatchFormData) => Promise<void>
    onCancel: () => void
    isLoading: boolean
}

export default function BatchForm({ initialData, onSubmit, onCancel, isLoading }: BatchFormProps) {
    const [options, setOptions] = useState<{ courses: any[], teachers: any[] }>({ courses: [], teachers: [] })

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<BatchFormData>({
        resolver: zodResolver(batchSchema),
        defaultValues: initialData ? {
            batch_name: initialData.batch_name,
            course_id: initialData.course_id,
            teacher_id: initialData.teacher_id,
            batch_timing: initialData.batch_timing,
            start_date: initialData.start_date,
            end_date: initialData.end_date,
            max_capacity: initialData.max_capacity,
        } : {
            max_capacity: 30
        }
    })

    useEffect(() => {
        fetch('/api/batches/options')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load options')
                return res.json()
            })
            .then(data => setOptions(data))
            .catch(err => console.error('BatchForm options fetch failed:', err))
    }, [])

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="form-group">
                <label className="label">Batch Name</label>
                <input
                    {...register('batch_name')}
                    className={errors.batch_name ? 'error' : ''}
                    placeholder="e.g. Evening Advanced A"
                />
                {errors.batch_name && <p className="error-text"><AlertCircle size={14} /> {errors.batch_name.message}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                    <label className="label">Course</label>
                    <select {...register('course_id')} className={errors.course_id ? 'error' : ''}>
                        <option value="">Select Course</option>
                        {options.courses.map(c => (
                            <option key={c.course_id} value={c.course_id}>{c.course_name} ({c.course_level})</option>
                        ))}
                    </select>
                    {errors.course_id && <p className="error-text"><AlertCircle size={14} /> {errors.course_id.message}</p>}
                </div>

                <div className="form-group">
                    <label className="label">Teacher</label>
                    <select {...register('teacher_id')} className={errors.teacher_id ? 'error' : ''}>
                        <option value="">Assign Teacher (Optional)</option>
                        {options.teachers.map(t => (
                            <option key={t.teacher_id} value={t.teacher_id}>{t.teacher_name}</option>
                        ))}
                    </select>
                    {errors.teacher_id && <p className="error-text"><AlertCircle size={14} /> {errors.teacher_id.message}</p>}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                    <label className="label">Start Date</label>
                    <input
                        type="date"
                        {...register('start_date')}
                        className={errors.start_date ? 'error' : ''}
                    />
                    {errors.start_date && <p className="error-text"><AlertCircle size={14} /> {errors.start_date.message}</p>}
                </div>

                <div className="form-group">
                    <label className="label">End Date</label>
                    <input
                        type="date"
                        {...register('end_date')}
                        className={errors.end_date ? 'error' : ''}
                    />
                    {errors.end_date && <p className="error-text"><AlertCircle size={14} /> {errors.end_date.message}</p>}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                    <label className="label">Batch Timing</label>
                    <input
                        {...register('batch_timing')}
                        className={errors.batch_timing ? 'error' : ''}
                        placeholder="e.g. 6:00 PM - 8:00 PM"
                    />
                    {errors.batch_timing && <p className="error-text"><AlertCircle size={14} /> {errors.batch_timing.message}</p>}
                </div>

                <div className="form-group">
                    <label className="label">Max Capacity</label>
                    <input
                        type="number"
                        {...register('max_capacity')}
                        className={errors.max_capacity ? 'error' : ''}
                    />
                    {errors.max_capacity && <p className="error-text"><AlertCircle size={14} /> {errors.max_capacity.message}</p>}
                </div>
            </div>

            {initialData && (
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255, 140, 66, 0.05)', borderRadius: '4px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    Current Enrollment: <strong>{initialData.current_enrollment_count}</strong> students.
                </div>
            )}

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
                            {initialData ? 'Update Batch' : 'Create Batch'}
                        </>
                    )}
                </button>
            </div>

            <style jsx>{`
        .form-group { display: flex; flex-direction: column; }
        .label { font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--color-text); }
      `}</style>
        </form>
    )
}
