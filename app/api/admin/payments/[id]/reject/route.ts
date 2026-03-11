import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { withAuditLogging } from '@/utils/audit-logger';

async function triggerEmail(payload: any) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await fetch(`${baseUrl}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error('Email trigger failed:', err);
    }
}

async function adminPaymentRejectionHandler(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient();

    try {
        const { rejection_reason } = await request.json();

        if (!rejection_reason || rejection_reason.length < 10) {
            return NextResponse.json({ error: 'Valid rejection reason required' }, { status: 400 });
        }

        // 1. Fetch student info for email
        const { data: payment } = await supabase
            .from('payments')
            .select('student_id, students(student_full_name, email_address)')
            .eq('payment_id', params.id)
            .single();

        if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

        // 2. Update status
        const { data: { user } } = await supabase.auth.getUser();
        const { error: updateError } = await supabase
            .from('payments')
            .update({
                verification_status: 'Rejected',
                rejection_remarks: rejection_reason,
                verified_by: user?.id,
                verification_timestamp: new Date().toISOString()
            })
            .eq('payment_id', params.id);

        if (updateError) throw updateError;

        // 3. Trigger Rejection Email
        triggerEmail({
            email_type: 'PAYMENT_REJECTED',
            recipient_email: (payment as any).students.email_address,
            recipient_name: (payment as any).students.student_full_name,
            metadata: {
                student_name: (payment as any).students.student_full_name,
                rejection_reason: rejection_reason
            }
        });

        return NextResponse.json({
            success: true,
            payment_id: params.id,
            student_id: payment.student_id,
            reason: rejection_reason
        });

    } catch (error: any) {
        return NextResponse.json({ error: 'Rejection failed' }, { status: 500 });
    }
}

export const PATCH = withAuditLogging(adminPaymentRejectionHandler, {
    actionType: 'PAYMENT_REJECTED',
    entityType: 'payment',
    entityIdResolver: (req, result) => result.payment_id,
    detailsResolver: (req, result) => ({
        student_id: result.student_id,
        reason: result.reason
    })
});
