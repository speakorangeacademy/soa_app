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
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="course-form" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {/* Row 1: Course Name & Level */}
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Course Name <span className="required-asterisk">*</span></label>
                        <input
                            {...register('course_name')}
                            className={`form-input ${errors.course_name ? 'error' : ''}`}
                            placeholder="e.g. Spoken English Basic"
                            type="text"
                        />
                        {errors.course_name && <p className="error-text"><AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} /> {errors.course_name.message}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Course Level <span className="required-asterisk">*</span></label>
                        <input
                            {...register('course_level')}
                            className={`form-input ${errors.course_level ? 'error' : ''}`}
                            placeholder="e.g. Level 1, Beginner"
                            type="text"
                        />
                        {errors.course_level && <p className="error-text"><AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} /> {errors.course_level.message}</p>}
                    </div>
                </div>

                {/* Row 2: Language & Duration */}
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Language <span className="required-asterisk">*</span></label>
                        <input
                            {...register('language')}
                            className={`form-input ${errors.language ? 'error' : ''}`}
                            placeholder="e.g. English"
                            type="text"
                        />
                        {errors.language && <p className="error-text"><AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} /> {errors.language.message}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Duration <span className="required-asterisk">*</span></label>
                        <input
                            {...register('course_duration')}
                            className={`form-input ${errors.course_duration ? 'error' : ''}`}
                            placeholder="e.g. 3 Months"
                            type="text"
                        />
                        {errors.course_duration && <p className="error-text"><AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} /> {errors.course_duration.message}</p>}
                    </div>
                </div>

                {/* Row 3: Fee & Mode */}
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Total Fee (₹) <span className="required-asterisk">*</span></label>
                        <input
                            {...register('total_fee')}
                            type="number"
                            step="0.01"
                            className={`form-input ${errors.total_fee ? 'error' : ''}`}
                            placeholder="0.00"
                        />
                        {errors.total_fee && <p className="error-text"><AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} /> {errors.total_fee.message}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mode <span className="required-asterisk">*</span></label>
                        <select {...register('mode')} className={`form-input form-select ${errors.mode ? 'error' : ''}`}>
                            <option value="">Select mode...</option>
                            <option value="Online">Online</option>
                            <option value="Offline">Offline</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                        {errors.mode && <p className="error-text"><AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} /> {errors.mode.message}</p>}
                    </div>
                </div>

                {/* Row 4: Status */}
                <div className="form-row single-field">
                    <div className="form-group">
                        <label className="form-label">Status <span className="required-asterisk">*</span></label>
                        <select {...register('course_status')} className={`form-input form-select ${errors.course_status ? 'error' : ''}`}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        {errors.course_status && <p className="error-text"><AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} /> {errors.course_status.message}</p>}
                    </div>
                </div>

                {/* Description */}
                <div className="form-row single-field">
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            {...register('course_description')}
                            className={`form-input form-textarea ${errors.course_description ? 'error' : ''}`}
                            placeholder="Detailed course description, learning outcomes, target audience..."
                            style={{ minHeight: '100px', resize: 'vertical' }}
                        />
                        {errors.course_description && <p className="error-text"><AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} /> {errors.course_description.message}</p>}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="form-actions">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="btn btn-cancel"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-submit"
                    >
                        <Save size={18} />
                        {isLoading ? 'Saving...' : (initialData ? 'Update Course' : 'Create Course')}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .course-form {
                    width: 100%;
                    padding: 0;
                    margin: 0;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                    width: 100%;
                    margin-bottom: 1.25rem;
                }

                .form-row.single-field {
                    grid-template-columns: 1fr;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    width: 100%;
                }

                .form-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--color-text);
                    display: block;
                    margin: 0;
                    padding: 0;
                    line-height: 1.4;
                }

                .required-asterisk {
                    color: var(--color-danger);
                    margin-left: 2px;
                }

                .form-input {
                    padding: 0.75rem 1rem;
                    border: 1px solid var(--color-border);
                    border-radius: 8px;
                    font-size: 0.95rem;
                    font-family: 'Work Sans', sans-serif;
                    color: var(--color-text);
                    background-color: var(--color-surface);
                    transition: all 150ms ease-out;
                    outline: none;
                    width: 100%;
                    box-sizing: border-box;
                    line-height: 1.5;
                }

                .form-input:focus {
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
                }

                .form-input:hover:not(:focus) {
                    border-color: var(--color-primary);
                    background-color: rgba(255, 140, 66, 0.02);
                }

                .form-input.error {
                    border-color: var(--color-danger);
                    background-color: rgba(229, 57, 53, 0.02);
                }

                .form-input.error:focus {
                    box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.1);
                }

                .form-textarea {
                    font-family: 'Work Sans', sans-serif;
                    resize: vertical;
                }

                .form-select {
                    cursor: pointer;
                    appearance: none;
                    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238B7355' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
                    background-repeat: no-repeat;
                    background-position: right 0.75rem center;
                    background-size: 1.25rem;
                    padding-right: 2.5rem;
                }

                .error-text {
                    font-size: 0.8125rem;
                    color: var(--color-danger);
                    margin: 0.25rem 0 0;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    line-height: 1.4;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--color-border);
                }

                .btn {
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    border: none;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 150ms ease-out;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-family: 'Outfit', sans-serif;
                    min-height: 44px;
                    text-align: center;
                }

                .btn:disabled {
                    cursor: not-allowed;
                    opacity: 0.6;
                }

                .btn-cancel {
                    background: none;
                    color: var(--color-text);
                    border: 1px solid var(--color-border);
                }

                .btn-cancel:hover:not(:disabled) {
                    background-color: var(--color-bg);
                    border-color: var(--color-primary);
                    color: var(--color-primary);
                }

                .btn-submit {
                    background-color: var(--color-primary);
                    color: white;
                }

                .btn-submit:hover:not(:disabled) {
                    background-color: var(--color-accent);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(255, 140, 66, 0.3);
                }

                .btn-submit:active:not(:disabled) {
                    transform: translateY(0);
                }

                @media (max-width: 640px) {
                    .form-row {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }

                    .form-actions {
                        flex-direction: column-reverse;
                    }

                    .btn {
                        width: 100%;
                    }
                }
            `}</style>
        </>
    )
}
