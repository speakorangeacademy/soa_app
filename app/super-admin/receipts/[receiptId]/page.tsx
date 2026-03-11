import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import ReceiptSummaryCard from '@/components/admin/receipts/receipt-summary-card';
import CancellationForm from '@/components/admin/receipts/cancellation-form';
import { LayoutDashboard, Receipt as ReceiptIcon } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
    params: { receiptId: string }
}

export default async function ReceiptManagementPage({ params }: PageProps) {
    const { receiptId } = params;
    const supabase = createClient();

    // 1. Validate Session & Role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/login');
    }

    const role = user.app_metadata?.app_role;
    if (role !== 'Super Admin') {
        redirect('/unauthorized');
    }

    // 2. Fetch Receipt Details
    const { data: receipt, error: fetchError } = await supabase
        .from('receipts')
        .select(`
            receipt_id,
            receipt_number,
            amount_paid,
            payment_date,
            status,
            student:students(student_full_name),
            course_name,
            batch_name
        `)
        .eq('receipt_id', receiptId)
        .single();

    if (fetchError || !receipt) {
        notFound();
    }

    return (
        <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>

            {/* Header */}
            <header className="animate-fade-up" style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                    <Link href="/super-admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'inherit', textDecoration: 'none' }}>
                        <LayoutDashboard size={18} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dashboard</span>
                    </Link>
                    <span style={{ color: 'var(--color-text-muted)' }}>/</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Receipt Management</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[rgba(255,140,66,0.1)] rounded-lg text-[var(--color-primary)]">
                        <ReceiptIcon size={32} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', color: 'var(--color-text)' }}>Manage Receipt</h1>
                        <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                            View details and perform administrative actions on receipt {receipt.receipt_number}.
                        </p>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>

                {/* Summary Section */}
                <div className="space-y-6">
                    <ReceiptSummaryCard receipt={receipt as any} />

                    {/* Cancellation Section */}
                    <div className="max-w-2xl">
                        <CancellationForm
                            receiptId={receipt.receipt_id}
                            isCancelled={receipt.status === 'Cancelled'}
                        />
                    </div>
                </div>

            </div>

            {/* Background Texture Overlay (matching the theme) */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: -1,
                    background: 'radial-gradient(circle at center, var(--color-bg) 0%, #FFF4E8 100%)',
                    pointerEvents: 'none'
                }}
            />
        </div>
    )
}
