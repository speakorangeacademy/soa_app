'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { studentRegistrationSchema, StudentRegistrationFormData } from '@/types/registration'
import { useRouter } from 'next/navigation'
import {
    User,
    Users,
    MapPin,
    Calendar,
    Mail,
    Phone,
    BookOpen,
    Layers,
    AlertCircle,
    ArrowRight,
    ShieldCheck,
    Loader2
} from 'lucide-react'
import BatchStatusList from '@/components/registration/batch-status-list'

export default function RegistrationPage() {
    const router = useRouter()
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [dataLoading, setDataLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<StudentRegistrationFormData>({
        resolver: zodResolver(studentRegistrationSchema),
        defaultValues: {
            gender: 'Male'
        }
    })

    const selectedCourseId = watch('course_id')

    useEffect(() => {
        fetch('/api/courses/public')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCourses(data)
                } else {
                    console.error("Courses API returned non-array data:", data)
                    setError(data.error || "Failed to load courses")
                }
                setDataLoading(false)
            })
            .catch((err) => {
                console.error("Failed to fetch courses:", err)
                setError("Connection error. Please refresh.")
                setDataLoading(false)
            })
    }, [])

    useEffect(() => {
        if (selectedCourseId) {
            setValue('batch_id', '')
        }
    }, [selectedCourseId, setValue])

    const onSubmit = async (data: StudentRegistrationFormData) => {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            const result = await res.json()

            if (res.ok) {
                router.push(`/payment/${result.student_id}?course=${result.course_id}&batch=${result.batch_id}`)
            } else {
                setError(result.error || 'Registration failed')
                setLoading(false)
            }
        } catch (err) {
            setError('Connection error. Please try again.')
            setLoading(false)
        }
    }

    if (dataLoading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="#FF8C42" />
            </div>
        )
    }

    return (
        <div style={{
            minHeight: '100vh',
            padding: '80px 24px',
            background: 'radial-gradient(circle at center, #FFF9F4 0%, #FFF4E8 100%)',
            fontFamily: 'Work Sans, sans-serif'
        }}>
            <div style={{
                maxWidth: '840px',
                margin: '0 auto',
                background: '#ffffff',
                border: '1px solid #F0E4D7',
                borderRadius: '24px',
                padding: 'min(48px, 6vw)',
                boxShadow: '0 20px 40px rgba(44, 36, 22, 0.08)',
                animation: 'fadeUp 0.6s ease-out'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div style={{ 
                        backgroundColor: 'rgba(255, 140, 66, 0.1)', 
                        width: '72px', height: '72px', borderRadius: '20px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        margin: '0 auto 20px', color: '#FF8C42' 
                    }}>
                        <ShieldCheck size={36} />
                    </div>
                    <h1 style={{ 
                        fontSize: '2.5rem', fontWeight: 700, marginBottom: '12px', 
                        color: '#2C2416', fontFamily: 'Outfit, sans-serif' 
                    }}>Student Registration</h1>
                    <p style={{ color: '#8B7355', fontSize: '1.1rem' }}>
                        Join Speak Orange Academy today. Secure your batch in just a few steps.
                    </p>
                </div>

                {error && (
                    <div style={{ 
                        padding: '16px 20px', backgroundColor: 'rgba(229, 57, 53, 0.05)', 
                        color: '#E53935', borderRadius: '12px', marginBottom: '32px', 
                        display: 'flex', alignItems: 'center', gap: '12px',
                        border: '1px solid rgba(229, 57, 53, 0.15)'
                    }}>
                        <AlertCircle size={20} />
                        <p style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                    
                    {/* Section 1: Student Details */}
                    <section>
                        <h2 style={{ 
                            fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px', 
                            display: 'flex', alignItems: 'center', gap: '10px', 
                            color: '#2C2416', fontFamily: 'Outfit, sans-serif'
                        }}>
                            <User size={22} color="#FF8C42" />
                            Personal Information
                        </h2>

                        <div className="grid-responsive" style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2C2416' }}>Student Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        {...register('student_full_name')} 
                                        placeholder="Full Name"
                                        style={inputStyle(!!errors.student_full_name)} 
                                    />
                                    <User size={16} style={iconStyle} />
                                </div>
                                {errors.student_full_name && <p style={errorTextStyle}>{errors.student_full_name.message}</p>}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2C2416' }}>Parent / Guardian Name</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        {...register('parent_name')} 
                                        placeholder="Guardian's Name"
                                        style={inputStyle(!!errors.parent_name)} 
                                    />
                                    <Users size={16} style={iconStyle} />
                                </div>
                                {errors.parent_name && <p style={errorTextStyle}>{errors.parent_name.message}</p>}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2C2416' }}>Mobile Number</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        {...register('mobile_number')} 
                                        placeholder="10-digit mobile number"
                                        style={inputStyle(!!errors.mobile_number)} 
                                    />
                                    <Phone size={16} style={iconStyle} />
                                </div>
                                {errors.mobile_number && <p style={errorTextStyle}>{errors.mobile_number.message}</p>}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2C2416' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        {...register('email_address')} 
                                        placeholder="name@example.com"
                                        style={inputStyle(!!errors.email_address)} 
                                    />
                                    <Mail size={16} style={iconStyle} />
                                </div>
                                {errors.email_address && <p style={errorTextStyle}>{errors.email_address.message}</p>}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2C2416' }}>Date of Birth</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="date" 
                                        {...register('date_of_birth')} 
                                        style={inputStyle(!!errors.date_of_birth)} 
                                    />
                                    <Calendar size={16} style={iconStyle} />
                                </div>
                                {errors.date_of_birth && <p style={errorTextStyle}>{errors.date_of_birth.message}</p>}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2C2416' }}>Gender</label>
                                <select 
                                    {...register('gender')} 
                                    style={inputStyle(!!errors.gender)}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.gender && <p style={errorTextStyle}>{errors.gender.message}</p>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2C2416' }}>Permanent Address</label>
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    {...register('address')}
                                    placeholder="House No, Street, City, State, PIN Code"
                                    style={{
                                        ...inputStyle(!!errors.address),
                                        minHeight: '100px',
                                        paddingTop: '12px'
                                    }}
                                />
                                <MapPin size={16} style={{ ...iconStyle, top: '20px', transform: 'none' }} />
                            </div>
                            {errors.address && <p style={errorTextStyle}>{errors.address.message}</p>}
                        </div>
                    </section>

                    {/* Section 2: Course & Batch */}
                    <section style={{ paddingTop: '40px', borderTop: '1px solid #F0E4D7' }}>
                        <h2 style={{ 
                            fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px', 
                            display: 'flex', alignItems: 'center', gap: '10px', 
                            color: '#2C2416', fontFamily: 'Outfit, sans-serif'
                        }}>
                            <BookOpen size={22} color="#FF8C42" />
                            Select Your Course
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2C2416' }}>Course & Language Preference</label>
                                <div style={{ position: 'relative' }}>
                                    <select 
                                        {...register('course_id')} 
                                        style={inputStyle(!!errors.course_id)}
                                    >
                                        <option value="">Choose a course</option>
                                        {courses.map(course => (
                                            <option key={course.course_id} value={course.course_id}>
                                                {course.course_name} ({course.course_level}) - {course.language}
                                            </option>
                                        ))}
                                    </select>
                                    <Layers size={16} style={iconStyle} />
                                </div>
                                {errors.course_id && <p style={errorTextStyle}>{errors.course_id.message}</p>}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2C2416' }}>Available Batches</label>
                                <BatchStatusList
                                    courseId={selectedCourseId}
                                    selectedBatchId={watch('batch_id')}
                                    onSelect={(id) => setValue('batch_id', id, { shouldValidate: true })}
                                />
                                {errors.batch_id && <p style={errorTextStyle}><AlertCircle size={14} /> {errors.batch_id.message}</p>}
                            </div>
                        </div>

                        {selectedCourseId && courses.find(c => c.course_id === selectedCourseId) && (
                            <div
                                style={{
                                    marginTop: '32px',
                                    padding: '24px',
                                    backgroundColor: 'rgba(255, 140, 66, 0.05)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: '1px solid rgba(255, 140, 66, 0.2)',
                                    animation: 'fadeUp 0.3s ease-out'
                                }}
                            >
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: '#8B7355', marginBottom: '4px' }}>Registration Fee</p>
                                    <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FF8C42' }}>
                                        ₹{courses.find(c => c.course_id === selectedCourseId).total_fee.toLocaleString('en-IN')}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ 
                                        display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', 
                                        background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', 
                                        fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' 
                                    }}>SECURE ADMISSION</div>
                                    <p style={{ fontSize: '0.75rem', color: '#8B7355' }}>All-inclusive payment</p>
                                </div>
                            </div>
                        )}
                    </section>

                    <div style={{ paddingTop: '16px' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ 
                                width: '100%', padding: '16px', 
                                background: '#FF8C42', color: '#fff', 
                                border: 'none', borderRadius: '12px',
                                fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.125rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                boxShadow: '0 8px 24px rgba(255, 140, 66, 0.25)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = '#D94E1F'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                            onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.background = '#FF8C42'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                <>
                                    Complete Selection & Pay <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: '#8B7355', lineHeight: '1.5' }}>
                            By joining, you agree to our Academy's enrollment policies.<br/>
                            Payment confirmation is required to secure your seat.
                        </p>
                    </div>
                </form>
            </div>

            <style jsx global>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .grid-responsive {
                    grid-template-columns: 1fr 1fr;
                }
                @media (max-width: 640px) {
                    .grid-responsive {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    )
}

const inputStyle = (isError: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '12px 16px 12px 40px',
    borderRadius: '12px',
    border: isError ? '1.5px solid #E53935' : '1.5px solid #F0E4D7',
    outline: 'none',
    fontSize: '15px',
    color: '#2C2416',
    background: '#fff',
    transition: 'all 0.2s',
    minHeight: '48px'
})

const iconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#8B7355',
    opacity: 0.7
}

const errorTextStyle: React.CSSProperties = {
    color: '#E53935',
    fontSize: '0.8125rem',
    fontWeight: 500,
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
}
