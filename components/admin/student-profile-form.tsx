'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { studentProfileSchema, StudentProfileData, StudentProfileFull } from '@/types/student'
import { Card, CardContent, CardHeader, CardTitle, Input, Button, Label, Select, Textarea } from '@/components/common/ui'
import { motion } from 'framer-motion'
import { Save, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react'

interface StudentProfileFormProps {
    student: StudentProfileFull
    onSave: (data: StudentProfileData) => Promise<void>
    isSubmitting: boolean
    isSuccess: boolean
}

export function StudentProfileForm({ student, onSave, isSubmitting, isSuccess }: StudentProfileFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty }
    } = useForm<StudentProfileData>({
        resolver: zodResolver(studentProfileSchema),
        defaultValues: {
            first_name: student.first_name || '',
            last_name: student.last_name || '',
            date_of_birth: student.date_of_birth || '',
            gender: (student.gender as any) || 'Male',
            parent_name: student.parent_name || '',
            parent_phone: student.parent_phone || '',
            alternate_phone: student.alternate_phone || '',
            email: student.email || '',
            address_line_1: student.address_line_1 || '',
            address_line_2: student.address_line_2 || '',
            city: student.city || '',
            state: student.state || '',
            pincode: student.pincode || '',
            notes: student.notes || '',
        }
    })

    const onSubmit = (data: StudentProfileData) => {
        onSave(data)
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
            {isSuccess && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        border: '1px solid var(--color-success)',
                        padding: '1rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: 'var(--color-success)'
                    }}
                >
                    <CheckCircle2 size={20} />
                    <span style={{ fontWeight: 500 }}>Profile updated successfully!</span>
                </motion.div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>System Information (Read-Only)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <Label>Student ID</Label>
                            <Input value={student.student_id} disabled style={{ backgroundColor: '#F8F9FA' }} />
                        </div>
                        <div>
                            <Label>Registration Date</Label>
                            <Input value={student.admission_date ? new Date(student.admission_date).toLocaleDateString() : 'N/A'} disabled style={{ backgroundColor: '#F8F9FA' }} />
                        </div>
                        <div>
                            <Label>Enrollment Status</Label>
                            <Input value={student.enrollment_status} disabled style={{ backgroundColor: '#F8F9FA' }} />
                        </div>
                        <div>
                            <Label>Current Course</Label>
                            <Input value={student.course_name} disabled style={{ backgroundColor: '#F8F9FA' }} />
                        </div>
                        <div>
                            <Label>Current Batch</Label>
                            <Input value={student.batch_name} disabled style={{ backgroundColor: '#F8F9FA' }} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                            {/* Names */}
                            <motion.div variants={item}>
                                <Label>First Name</Label>
                                <Input
                                    {...register('first_name')}
                                    style={{ border: errors.first_name ? '1px solid var(--color-danger)' : undefined }}
                                />
                                {errors.first_name && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px' }}>{errors.first_name.message}</p>}
                            </motion.div>
                            <motion.div variants={item}>
                                <Label>Last Name</Label>
                                <Input
                                    {...register('last_name')}
                                    style={{ border: errors.last_name ? '1px solid var(--color-danger)' : undefined }}
                                />
                                {errors.last_name && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px' }}>{errors.last_name.message}</p>}
                            </motion.div>

                            {/* DOB & Gender */}
                            <motion.div variants={item}>
                                <Label>Date of Birth</Label>
                                <Input
                                    type="date"
                                    {...register('date_of_birth')}
                                    style={{ border: errors.date_of_birth ? '1px solid var(--color-danger)' : undefined }}
                                />
                                {errors.date_of_birth && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px' }}>{errors.date_of_birth.message}</p>}
                            </motion.div>
                            <motion.div variants={item}>
                                <Label>Gender</Label>
                                <Select {...register('gender')}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </Select>
                            </motion.div>

                            {/* Contact */}
                            <motion.div variants={item}>
                                <Label>Email Address</Label>
                                <Input
                                    {...register('email')}
                                    style={{ border: errors.email ? '1px solid var(--color-danger)' : undefined }}
                                />
                                {errors.email && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px' }}>{errors.email.message}</p>}
                            </motion.div>
                            <motion.div variants={item}>
                                <Label>Parent/Guardian Name</Label>
                                <Input
                                    {...register('parent_name')}
                                    style={{ border: errors.parent_name ? '1px solid var(--color-danger)' : undefined }}
                                />
                                {errors.parent_name && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px' }}>{errors.parent_name.message}</p>}
                            </motion.div>
                            <motion.div variants={item}>
                                <Label>Parent Phone</Label>
                                <Input
                                    {...register('parent_phone')}
                                    style={{ border: errors.parent_phone ? '1px solid var(--color-danger)' : undefined }}
                                />
                                {errors.parent_phone && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px' }}>{errors.parent_phone.message}</p>}
                            </motion.div>
                            <motion.div variants={item}>
                                <Label>Alternate Phone (Optional)</Label>
                                <Input
                                    {...register('alternate_phone')}
                                    style={{ border: errors.alternate_phone ? '1px solid var(--color-danger)' : undefined }}
                                />
                                {errors.alternate_phone && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px' }}>{errors.alternate_phone.message}</p>}
                            </motion.div>

                            {/* Address */}
                            <motion.div variants={item} style={{ gridColumn: '1 / -1' }}>
                                <Label>Address Line 1</Label>
                                <Input
                                    {...register('address_line_1')}
                                    style={{ border: errors.address_line_1 ? '1px solid var(--color-danger)' : undefined }}
                                />
                                {errors.address_line_1 && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px' }}>{errors.address_line_1.message}</p>}
                            </motion.div>
                            <motion.div variants={item} style={{ gridColumn: '1 / -1' }}>
                                <Label>Address Line 2 (Optional)</Label>
                                <Input {...register('address_line_2')} />
                            </motion.div>

                            <motion.div variants={item}>
                                <Label>City</Label>
                                <Input
                                    {...register('city')}
                                    style={{ border: errors.city ? '1px solid var(--color-danger)' : undefined }}
                                />
                                {errors.city && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px' }}>{errors.city.message}</p>}
                            </motion.div>
                            <motion.div variants={item}>
                                <Label>State</Label>
                                <Input
                                    {...register('state')}
                                    style={{ border: errors.state ? '1px solid var(--color-danger)' : undefined }}
                                />
                                {errors.state && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px' }}>{errors.state.message}</p>}
                            </motion.div>
                            <motion.div variants={item}>
                                <Label>Pincode</Label>
                                <Input
                                    {...register('pincode')}
                                    style={{ border: errors.pincode ? '1px solid var(--color-danger)' : undefined }}
                                />
                                {errors.pincode && <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '4px' }}>{errors.pincode.message}</p>}
                            </motion.div>

                            <motion.div variants={item} style={{ gridColumn: '1 / -1' }}>
                                <Label>Notes (Optional)</Label>
                                <Textarea {...register('notes')} />
                            </motion.div>
                        </div>

                        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => reset()}
                                disabled={isSubmitting || !isDirty}
                            >
                                <RotateCcw size={18} />
                                Reset
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting || !isDirty}
                            >
                                <Save size={18} />
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                        {!isDirty && !isSubmitting && (
                            <p style={{ textAlign: 'right', fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                No changes detected.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </form>
        </motion.div>
    )
}
