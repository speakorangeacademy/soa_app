import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Receipt, Search, ExternalLink } from 'lucide-react'

export default async function ReceiptsPage() {
    const supabase = createClient()

    const { data: receipts } = await supabase
        .from('receipts')
        .select(`
            receipt_id,
            receipt_number,
            amount_paid,
            payment_date,
            status,
            course_name,
            batch_name,
            student:students(student_full_name)
        `)
        .order('payment_date', { ascending: false })
        .limit(100)

    const statusColor: Record<string, string> = {
        Paid: '#4CAF50',
        Cancelled: '#E53935',
        Pending: '#FFC107',
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <header className="animate-fade-up" style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ color: 'var(--color-primary)', backgroundColor: 'rgba(255, 140, 66, 0.1)', padding: '12px', borderRadius: '16px' }}>
                        <Receipt size={32} />
                    </div>
                    <h1 style={{ fontSize: '2.25rem', color: 'var(--color-text)' }}>Receipts Management</h1>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
                    View and manage all payment receipts. Click a receipt to view details or perform actions.
                </p>
            </header>

            <div className="card animate-fade-up delay-1">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
                        <thead>
                            <tr>
                                {['Receipt #', 'Student', 'Course / Batch', 'Amount', 'Date', 'Status', ''].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {receipts?.map(r => (
                                <tr key={r.receipt_id} style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <td style={{ padding: '1rem 1.25rem', borderRadius: '8px 0 0 8px', fontWeight: 600, color: 'var(--color-text)' }}>
                                        {r.receipt_number}
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text)' }}>
                                        {(r.student as any)?.student_full_name ?? '—'}
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <p style={{ color: 'var(--color-text)', fontSize: '0.875rem' }}>{r.course_name}</p>
                                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{r.batch_name}</p>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--color-text)' }}>
                                        ₹{Number(r.amount_paid).toLocaleString('en-IN')}
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                        {r.payment_date ? new Date(r.payment_date).toLocaleDateString('en-IN') : '—'}
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px',
                                            borderRadius: '9999px',
                                            color: statusColor[r.status] ?? 'var(--color-text-muted)',
                                            backgroundColor: `${statusColor[r.status] ?? 'var(--color-border)'}22`
                                        }}>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusColor[r.status] ?? 'var(--color-text-muted)' }} />
                                            {r.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', borderRadius: '0 8px 8px 0' }}>
                                        <Link href={`/super-admin/receipts/${r.receipt_id}`}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}>
                                            <ExternalLink size={14} /> Manage
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {(!receipts || receipts.length === 0) && (
                        <div style={{ padding: '5rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                            <p style={{ fontSize: '1.125rem' }}>No receipts found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
