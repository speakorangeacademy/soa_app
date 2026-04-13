'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    User,
    CreditCard,
    BookOpen,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download,
    ExternalLink,
    MapPin,
    Calendar,
    ShieldCheck,
    ChevronRight,
    LogOut,
    Settings
} from 'lucide-react'
import { Badge } from '@/components/common/ui'
import { ReuploadProofForm } from '@/components/student/ReuploadProofForm'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

// Helper for status colors
const getStatusConfig = (status: string, resubmitted_at?: any) => {
    switch (status?.toLowerCase()) {
        case 'approved':
        case 'active':
            return { color: 'var(--color-success)', icon: <CheckCircle2 size={16} />, label: 'Approved' }
        case 'pending':
            if (resubmitted_at) {
                return { color: 'var(--color-warning)', icon: <Clock size={16} />, label: 'Re-submitted – Awaiting Verification' }
            }
            return { color: 'var(--color-warning)', icon: <Clock size={16} />, label: 'Pending Verification' }
        case 'rejected':
            return { color: 'var(--color-danger)', icon: <AlertCircle size={16} />, label: 'Rejected – Action Required' }
        default:
            return { color: 'var(--color-text-muted)', icon: <Clock size={16} />, label: status || 'N/A' }
    }
}

export default function StudentDashboard() {
    const router = useRouter()
    const supabase = createClient()

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['student', 'dashboard'],
        queryFn: async () => {
            const res = await fetch('/api/student/dashboard')
            if (!res.ok) {
                if (res.status === 401) router.push('/login')
                throw new Error('Failed to fetch dashboard data')
            }
            return res.json()
        }
    })

    const student = data?.student
    const payment = data?.payment
    const enrollment = data?.enrollment
    const batch = enrollment?.batch

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const handleDownloadReceipt = async () => {
        if (!payment?.payment_id) return
        window.location.href = `/api/receipts/download?payment_id=${payment.payment_id}`
    }

    if (isLoading) return <DashboardSkeleton />

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div style={{ padding: '2rem', border: '1px solid var(--color-danger)', borderRadius: '12px', textAlign: 'center' }}>
                <AlertCircle size={48} color="var(--color-danger)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>Unable to load dashboard</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{error.message}</p>
                <button onClick={() => refetch()} style={{ backgroundColor: 'var(--color-primary)' }}>Retry</button>
            </div>
        </div>
    )

    return (
        <div className="animate-fade-up max-w-6xl mx-auto space-y-6">
            {/* 1. Welcome Header Section */}
            <section style={{ animationDelay: '0ms' }} className="animate-fade-up">
                <header className="card" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            width: '4rem',
                            height: '4rem',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 140, 66, 0.1)',
                            color: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <User size={32} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Jai Swaminarayan, {student?.student_full_name}!</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{student?.email_address}</span>
                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-border)' }}></span>
                                <Badge variant={student?.is_active ? 'success' : 'warning'}>
                                    {student?.is_active ? 'Active Account' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => router.push('/settings')}
                            style={{
                                background: 'none',
                                color: 'var(--color-text-muted)',
                                border: '1px solid var(--color-border)',
                                fontSize: '0.875rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0 1rem',
                                borderRadius: '4px',
                                minHeight: '40px',
                                cursor: 'pointer'
                            }}
                        >
                            <Settings size={16} /> Settings
                        </button>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'none',
                                color: 'var(--color-text-muted)',
                                border: '1px solid var(--color-border)',
                                fontSize: '0.875rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0 1rem',
                                borderRadius: '4px',
                                minHeight: '40px',
                                cursor: 'pointer'
                            }}
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </header>
            </section>

            {/* ── Rejection Alert Banner (shown only when payment is Rejected) ── */}
            {payment?.verification_status === 'Rejected' && (
                <section className="animate-fade-up" style={{ animationDelay: '40ms' }}>
                    <div style={{
                        border: '1.5px solid rgba(229,57,53,0.25)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                    }}>
                        {/* Red header strip */}
                        <div style={{
                            background: 'rgba(229,57,53,0.08)',
                            borderBottom: '1px solid rgba(229,57,53,0.15)',
                            padding: '1rem 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                backgroundColor: 'rgba(229,57,53,0.12)',
                                color: 'var(--color-danger)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, color: 'var(--color-danger)', fontFamily: 'Outfit, sans-serif', fontSize: '1rem' }}>
                                    Payment Rejected — Action Required
                                </p>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                    Your payment proof could not be verified. Please review the reason below.
                                </p>
                            </div>
                        </div>

                        {/* Reason + conditional reupload */}
                        <div style={{ padding: '1.25rem 1.5rem', backgroundColor: 'rgba(229,57,53,0.03)' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-danger)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
                                Reason
                            </p>
                            <p style={{ fontSize: '0.9375rem', color: 'var(--color-text)', fontWeight: 500, lineHeight: 1.5 }}>
                                {payment.rejection_remarks || 'Please contact administration for details.'}
                            </p>

                            {payment.reupload_allowed ? (
                                <ReuploadProofForm
                                    paymentId={payment.payment_id}
                                    onSuccess={() => refetch()}
                                />
                            ) : (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '0.875rem 1rem',
                                    backgroundColor: 'rgba(139,115,85,0.06)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '10px',
                                    fontSize: '0.875rem',
                                    color: 'var(--color-text-muted)',
                                }}>
                                    Re-upload is not permitted for this payment. Please contact the academy directly.
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 2. Payment Status Card */}
                <section style={{ animationDelay: '60ms' }} className="animate-fade-up h-full">
                    <div className="card h-full" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ color: 'var(--color-primary)', backgroundColor: 'rgba(255, 140, 66, 0.05)', padding: '8px', borderRadius: '8px' }}>
                                    <CreditCard size={20} />
                                </div>
                                <h2 style={{ fontSize: '1.25rem' }}>Latest Payment</h2>
                            </div>
                            {payment && (() => {
                                const statusCfg = getStatusConfig(payment.verification_status, payment.resubmitted_at);
                                return (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: statusCfg.color,
                                        backgroundColor: `${statusCfg.color}10`,
                                        padding: '4px 10px',
                                        borderRadius: '100px'
                                    }}>
                                        {statusCfg.icon}
                                        {statusCfg.label}
                                    </div>
                                );
                            })()}
                        </div>

                        {!payment ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <AlertCircle size={32} color="var(--color-warning)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No payment records found.</p>
                                <button
                                    onClick={() => router.push('/register')}
                                    style={{ marginTop: '1rem', backgroundColor: 'var(--color-primary)' }}
                                >
                                    Register Now
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ flex: 1, spaceY: '1rem' }}>
                                    <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Course Enrolled</p>
                                        <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>{payment.course.course_name}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Amount Paid</p>
                                            <p style={{ fontWeight: 600 }}>₹{payment.fee_amount.toLocaleString('en-IN')}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Transaction ID</p>
                                            <p style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{payment.transaction_id}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Payment Date</p>
                                            <p style={{ fontWeight: 600 }}>{new Date(payment.payment_date).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Method</p>
                                            <p style={{ fontWeight: 600 }}>{payment.payment_method}</p>
                                        </div>
                                    </div>

                                    {/* Rejection detail is shown in the full-width banner above the grid */}
                                </div>

                                {payment.verification_status === 'Approved' && payment.receipt && (
                                    <button
                                        onClick={handleDownloadReceipt}
                                        style={{
                                            marginTop: '2rem',
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.75rem',
                                            backgroundColor: 'var(--color-primary)'
                                        }}
                                    >
                                        <Download size={18} /> Download Receipt
                                    </button>
                                )}

                                {/* Re-upload form lives in the rejection banner above the grid */}
                            </div>
                        )}
                    </div>
                </section>

                {/* 3. Batch Details Card */}
                <section style={{ animationDelay: '120ms' }} className="animate-fade-up h-full">
                    <div className="card h-full" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ color: 'var(--color-primary)', backgroundColor: 'rgba(255, 140, 66, 0.05)', padding: '8px', borderRadius: '8px' }}>
                                <BookOpen size={20} />
                            </div>
                            <h2 style={{ fontSize: '1.25rem' }}>Batch Allocation</h2>
                        </div>

                        {payment?.verification_status === 'Approved' && enrollment ? (
                            <div className="space-y-6">
                                <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3 style={{ fontSize: '1.125rem' }}>{batch?.batch_name}</h3>
                                        <Badge variant="success">Confirmed</Badge>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Clock size={16} style={{ color: 'var(--color-primary)' }} />
                                            <div>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Timing</p>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{batch?.batch_timing}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <User size={16} style={{ color: 'var(--color-primary)' }} />
                                            <div>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Teacher</p>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{batch?.teacher?.teacher_name || 'Allocating...'}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Calendar size={16} style={{ color: 'var(--color-primary)' }} />
                                            <div>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Schedule</p>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{new Date(batch?.start_date).toLocaleDateString()} to {new Date(batch?.end_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
                                            <div>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Learning Mode</p>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Live Interactive Hybrid</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '1rem', backgroundColor: 'rgba(139, 115, 85, 0.05)', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <ShieldCheck size={20} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                                    <p>Your enrollment is verified. You can access the course materials from the student portal starting on the batch commencement date.</p>
                                </div>
                            </div>
                        ) : payment?.verification_status === 'Approved' ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                <Clock size={48} color="var(--color-warning)" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
                                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Allocation in Progress</h3>
                                <p style={{ color: 'var(--color-text-muted)', maxWidth: '280px', margin: '0 auto' }}>Payment is verified! We are assigning your batch teacher and final timetable. Check back shortly.</p>
                                <div style={{ marginTop: '1.5rem', height: '4px', backgroundColor: 'var(--color-border)', borderRadius: '100px', overflow: 'hidden' }}>
                                    <div className="progress-bar-animate" style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-warning)' }}></div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.6 }}>
                                <Clock size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1.5rem' }} />
                                <p style={{ color: 'var(--color-text-muted)' }}>Available after payment verification.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* 4. Support Footer Card */}
            <section style={{ animationDelay: '180ms' }} className="animate-fade-up">
                <div className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ color: 'var(--color-primary)' }}>
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Need Assistance?</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Our support team is available 10 AM to 7 PM.</p>
                        </div>
                    </div>
                    <button
                        style={{
                            background: 'none',
                            color: 'var(--color-primary)',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0 1rem'
                        }}
                    >
                        Contact Support <ChevronRight size={16} />
                    </button>
                </div>
            </section>

            <style jsx>{`
        .progress-bar-animate {
          animation: progress 2s infinite ease-in-out;
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
        </div>
    )
}

function DashboardSkeleton() {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="skeleton h-32 w-full rounded-2xl bg-surface" style={{ opacity: 0.5 }}></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="skeleton h-96 w-full rounded-2xl bg-surface" style={{ opacity: 0.5 }}></div>
                <div className="skeleton h-96 w-full rounded-2xl bg-surface" style={{ opacity: 0.5 }}></div>
            </div>
        </div>
    )
}
