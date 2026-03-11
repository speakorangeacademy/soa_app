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

async function adminPaymentApprovalHandler(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient();

    try {
        // 1. Fetch Payment and related info
        const { data: payment, error: pError } = await supabase
            .from('payments')
            .select(`
        *,
        student:students(student_full_name, email_address),
        course:courses(course_name),
        batch:batches(batch_name, max_capacity, current_enrollment_count)
      `)
            .eq('payment_id', params.id)
            .single();

        if (pError || !payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        if (payment.verification_status !== 'Pending') return NextResponse.json({ error: 'Payment already processed' }, { status: 400 });

        // 2. Begin Approval Process
        const now = new Date();
        const { data: { user } } = await supabase.auth.getUser();

        // 2a. Update Payment
        const { error: updateError } = await supabase
            .from('payments')
            .update({
                verification_status: 'Approved',
                verified_by: user?.id,
                verification_timestamp: now.toISOString(),
                updated_at: now.toISOString()
            })
            .eq('payment_id', params.id);

        if (updateError) throw updateError;

        // 2b. Trigger Receipt Generation Service
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const receiptRes = await fetch(`${baseUrl}/api/receipts/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment_id: params.id })
        });

        const receiptData = await receiptRes.json();
        if (!receiptRes.ok) throw new Error(receiptData.error || 'Failed to generate receipt');

        const receiptNumber = receiptData.receipt_number;
        const receiptUrl = receiptData.receipt_url;

        // 2c. Handle Batch Enrollment
        let enrollmentCreated = false;
        if (payment.batch_id) {
            const { validateBatchCapacity } = await import('@/utils/batch-validator');
            const capacityVal = await validateBatchCapacity(payment.batch_id);

            if (capacityVal.allowed) {
                const { error: enrollError } = await supabase
                    .from('batch_enrollments')
                    .insert({
                        student_id: payment.student_id,
                        batch_id: payment.batch_id,
                        enrollment_date: now.toISOString(),
                        allocation_status: 'Active',
                        allocated_by: user?.id
                    });
                if (!enrollError) enrollmentCreated = true;
            } else {
                console.warn(`Enrollment blocked: ${capacityVal.reason}`);
            }
        }

        // 3. Trigger Emails
        triggerEmail({
            email_type: 'PAYMENT_APPROVED',
            recipient_email: (payment as any).student.email_address,
            recipient_name: (payment as any).student.student_full_name,
            attachment_url: receiptUrl,
            metadata: {
                student_name: (payment as any).student.student_full_name,
                course_name: (payment as any).course.course_name,
                batch_name: (payment as any).batch.batch_name,
                receipt_number: receiptNumber
            }
        });

        if (enrollmentCreated) {
            triggerEmail({
                email_type: 'BATCH_ALLOCATED',
                recipient_email: (payment as any).student.email_address,
                recipient_name: (payment as any).student.student_full_name,
                metadata: {
                    student_name: (payment as any).student.student_full_name,
                    course_name: (payment as any).course.course_name,
                    batch_name: (payment as any).batch.batch_name,
                    batch_timing: 'Check dashboard',
                    start_date: 'Check dashboard'
                }
            });
        }

        return NextResponse.json({
            success: true,
            payment_id: params.id,
            student_id: payment.student_id,
            amount: payment.fee_amount,
            receipt_number: receiptNumber,
            enrolled: enrollmentCreated
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Approval failed' }, { status: 500 });
    }
}

export const PATCH = withAuditLogging(adminPaymentApprovalHandler, {
    actionType: 'PAYMENT_APPROVED',
    entityType: 'payment',
    entityIdResolver: (req, result) => result.payment_id,
    detailsResolver: (req, result) => ({
        student_id: result.student_id,
        amount: result.amount,
        receipt_number: result.receipt_number,
        enrolled: result.enrolled
    })
});
