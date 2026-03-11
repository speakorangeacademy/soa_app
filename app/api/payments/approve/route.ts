import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { withAuditLogging } from '@/utils/audit-logger';

async function callInternalApi(endpoint: string, payload: any) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return res;
    } catch (err) {
        console.error(`Internal API call failed: ${endpoint}`, err);
        throw err;
    }
}

async function paymentApprovalHandler(request: Request) {
    const supabase = createClient();

    try {
        const body = await request.json();
        const { payment_id, action, admin_id, rejection_reason } = body;

        if (!payment_id || !action || !admin_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Fetch Payment details for metadata
        const { data: payment, error: fetchError } = await supabase
            .from('payments')
            .select('*, student:students(student_full_name, email_address), course:courses(course_name), batch:batches(batch_name)')
            .eq('payment_id', payment_id)
            .single();

        if (fetchError || !payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

        if (action === 'approve') {
            // 2. Execute DB Transaction via RPC
            const { data: dbResult, error: dbError } = await supabase.rpc('approve_payment_transaction', {
                p_payment_id: payment_id,
                p_admin_id: admin_id
            });

            if (dbError || !dbResult.success) {
                return NextResponse.json({ error: dbResult?.error || dbError?.message || 'Transaction failed' }, { status: 409 });
            }

            // 3. Post-Transaction Side Effects
            // a) Generate Receipt
            let receiptData = null;
            try {
                const receiptRes = await callInternalApi('/api/receipts/generate', { payment_id });
                receiptData = await receiptRes.json();
            } catch (err) {
                console.error('Receipt generation failed during approval workflow', err);
            }

            // b) Trigger Notifications
            try {
                await callInternalApi('/api/email/send', {
                    email_type: 'PAYMENT_APPROVED',
                    recipient_email: payment.student.email_address,
                    recipient_name: payment.student.student_full_name,
                    attachment_url: receiptData?.receipt_url,
                    metadata: {
                        student_name: payment.student.student_full_name,
                        course_name: payment.course.course_name,
                        batch_name: payment.batch?.batch_name || 'Assigned',
                        receipt_number: receiptData?.receipt_number || 'N/A'
                    }
                });
            } catch (err) {
                console.error('Notification dispatch failed', err);
            }

            return NextResponse.json({
                success: true,
                message: 'Payment approved successfully',
                payment_id,
                student_id: payment.student_id,
                amount: payment.fee_amount,
                action: 'approve'
            });

        } else if (action === 'reject') {
            if (!rejection_reason || rejection_reason.length < 10) {
                return NextResponse.json({ error: 'Rejection reason required (min 10 chars)' }, { status: 400 });
            }

            // 2. Execute DB Transaction via RPC
            const { data: dbResult, error: dbError } = await supabase.rpc('reject_payment_transaction', {
                p_payment_id: payment_id,
                p_admin_id: admin_id,
                p_reason: rejection_reason
            });

            if (dbError || !dbResult.success) {
                return NextResponse.json({ error: dbResult?.error || dbError?.message || 'Transaction failed' }, { status: 409 });
            }

            // 3. Post-Transaction Side Effects
            try {
                await callInternalApi('/api/email/send', {
                    email_type: 'PAYMENT_REJECTED',
                    recipient_email: payment.student.email_address,
                    recipient_name: payment.student.student_full_name,
                    metadata: {
                        student_name: payment.student.student_full_name,
                        rejection_reason: rejection_reason
                    }
                });
            } catch (err) {
                console.error('Rejection notification failed', err);
            }

            return NextResponse.json({
                success: true,
                message: 'Payment rejected successfully',
                payment_id,
                student_id: payment.student_id,
                action: 'reject',
                reason: rejection_reason
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Workflow error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const POST = withAuditLogging(paymentApprovalHandler, {
    actionType: (req, result) => result.action === 'approve' ? 'PAYMENT_APPROVED' : 'PAYMENT_REJECTED',
    entityType: 'payment',
    entityIdResolver: (req, result) => result.payment_id,
    detailsResolver: (req, result) => ({
        student_id: result.student_id,
        amount: result.amount,
        reason: result.reason
    })
});
