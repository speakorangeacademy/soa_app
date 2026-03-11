'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Users,
    Clock,
    BookOpen,
    AlertCircle,
    TrendingUp,
    CheckCircle2,
    ArrowUpRight,
    LayoutDashboard,
    PieChart,
    ChevronRight,
    Search
} from 'lucide-react'
import { Badge } from '@/components/common/ui'
import Link from 'next/link'

// --- Types ---
interface Stats {
    admissions: number
    pending: number
    activeBatches: number
}

interface BatchOccupancy {
    id: string
    name: string
    courseName: string
    teacherName: string
    capacity: number
    currentEnrollment: number
    status: string
    occupancy: number
}

interface PendingVerification {
    id: string
    transactionId: string
    paymentDate: string
    status: string
    studentName: string
    courseName: string
    batchName: string
}

// --- Components ---

const StatCard = ({ title, value, subtitle, icon: Icon, color, delay }: any) => (
    <div className={`card animate-fade-up ${delay}`} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
        <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: `${color}15`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Icon size={28} />
        </div>
        <div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{title}</p>
            <h3 style={{ fontSize: '1.75rem', color: 'var(--color-text)', margin: '4px 0' }}>{value}</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{subtitle}</p>
        </div>
    </div>
)

export default function AdminDashboardPage() {
    // 1. Fetch Stats
    const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
        queryKey: ['admin-stats'],
        queryFn: () => fetch('/api/admin/dashboard/stats').then(res => res.json())
    })

    // 2. Fetch Occupancy
    const { data: occupancy, isLoading: occupancyLoading } = useQuery<BatchOccupancy[]>({
        queryKey: ['admin-occupancy'],
        queryFn: () => fetch('/api/admin/dashboard/occupancy').then(res => res.json())
    })

    // 3. Fetch Pending
    const { data: pending, isLoading: pendingLoading } = useQuery<PendingVerification[]>({
        queryKey: ['admin-pending'],
        queryFn: () => fetch('/api/admin/dashboard/pending').then(res => res.json())
    })

    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
            <header className="animate-fade-up" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                        <LayoutDashboard size={18} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overview</span>
                    </div>
                    <h1 style={{ fontSize: '2.25rem', color: 'var(--color-text)' }}>Admin Dashboard</h1>
                </div>
            </header>

            {/* Metrics Row */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                <StatCard
                    title="Total Admissions"
                    value={statsLoading ? '...' : stats?.admissions}
                    subtitle="Approved & Allocated Students"
                    icon={Users}
                    color="var(--color-success)"
                    delay="delay-1"
                />
                <StatCard
                    title="Pending Verifications"
                    value={statsLoading ? '...' : stats?.pending}
                    subtitle="Ready for Payment Check"
                    icon={Clock}
                    color="var(--color-warning)"
                    delay="delay-2"
                />
                <StatCard
                    title="Active Batches"
                    value={statsLoading ? '...' : stats?.activeBatches}
                    subtitle="Currently Running Sessions"
                    icon={BookOpen}
                    color="var(--color-primary)"
                    delay="delay-3"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>

                {/* Batch Occupancy Section */}
                <section className="card animate-fade-up delay-4">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <PieChart size={20} color="var(--color-primary)" />
                            <h2 style={{ fontSize: '1.25rem' }}>Batch Occupancy Projection</h2>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Batch Details</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Teacher</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Enrollment</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Occupancy %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {occupancyLoading ? (
                                    [1, 2, 3].map(i => <tr key={i}><td colSpan={4} style={{ padding: '1rem' }}><div className="skeleton-row" /></td></tr>)
                                ) : occupancy?.length === 0 ? (
                                    <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No batches found.</td></tr>
                                ) : occupancy?.map((batch) => (
                                    <tr key={batch.id} style={{ borderBottom: '1px solid var(--color-border)' }} className="table-row">
                                        <td style={{ padding: '1rem' }}>
                                            <p style={{ fontWeight: 600 }}>{batch.name}</p>
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{batch.courseName}</p>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{batch.teacherName}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <Badge variant={batch.occupancy >= 100 ? 'success' : 'outline'}>
                                                {batch.currentEnrollment} / {batch.capacity}
                                            </Badge>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-bg)', borderRadius: '10px', minWidth: '80px' }}>
                                                    <div style={{
                                                        width: `${batch.occupancy}%`,
                                                        height: '100%',
                                                        backgroundColor: batch.occupancy >= 90 ? 'var(--color-danger)' : batch.occupancy >= 70 ? 'var(--color-warning)' : 'var(--color-success)',
                                                        borderRadius: '10px'
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: batch.occupancy >= 90 ? 'var(--color-danger)' : 'var(--color-text)' }}>
                                                    {batch.occupancy}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Pending Verifications Section */}
                <section className="card animate-fade-up delay-5">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Clock size={20} color="var(--color-warning)" />
                            <h2 style={{ fontSize: '1.25rem' }}>Pending Digital Verifications</h2>
                        </div>
                        <Link href="/admin/payments/verify" style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View All <ChevronRight size={14} />
                        </Link>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Student</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Academic Info</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Transaction ID</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Submission</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingLoading ? (
                                    [1, 2, 3].map(i => <tr key={i}><td colSpan={4} style={{ padding: '1rem' }}><div className="skeleton-row" /></td></tr>)
                                ) : pending?.length === 0 ? (
                                    <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No pending verifications.</td></tr>
                                ) : pending?.slice(0, 5).map((payment) => (
                                    <tr key={payment.id} style={{ borderBottom: '1px solid var(--color-border)' }} className="table-row">
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                                                    <Users size={16} />
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{payment.studentName}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <p style={{ fontSize: '0.875rem' }}>{payment.courseName}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{payment.batchName}</p>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <code style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-bg)', padding: '2px 6px', borderRadius: '4px' }}>{payment.transactionId}</code>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                                            {new Date(payment.paymentDate).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            <style jsx>{`
                .skeleton-row {
                    height: 48px;
                    background: linear-gradient(90deg, var(--color-bg) 25%, var(--color-border) 50%, var(--color-bg) 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-radius: 8px;
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .table-row:hover {
                    background-color: rgba(255, 140, 66, 0.02);
                }
            `}</style>
        </div>
    )
}
