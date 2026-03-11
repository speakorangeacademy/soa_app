import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * Secure Payment Rejection Workflow
 * Handles administrative rejection of pending payments with reasoning and notifications.
 */
export async function POST(request: Request) {
    const supabase = createClient();
    const adminSupabase = createAdminClient();

    try {
        // 1. Authenticate Admin Session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

        const { payment_id, rejection_reason, admin_id } = await request.json();

        // 2. Validate Inputs
        if (!payment_id) return NextResponse.json({ error: 'Payment ID required.' }, { status: 400 });
        if (!rejection_reason || rejection_reason.trim().length < 10) {
            return NextResponse.json({ error: 'Rejection reason required (minimum 10 characters).' }, { status: 400 });
        }
        if (!admin_id || admin_id !== session.user.id) {
            return NextResponse.json({ error: 'Invalid admin ID or session mismatch.' }, { status: 403 });
        }

        // 3. Validate Role
        const role = session.user.app_metadata?.app_role;
        if (role !== 'Super Admin') {
            return NextResponse.json({ error: 'Access denied. Super Admin role required.' }, { status: 403 });
        }

        // 4. Fetch Payment Metadata (Pre-rejection)
        const { data: payment, error: fetchError } = await adminSupabase
            .from('payments')
            .select('*, student:students(student_full_name, email_address), course:courses(course_name)')
            .eq('payment_id', payment_id)
            .single();

        if (fetchError || !payment) {
            return NextResponse.json({ error: 'Payment record not found.' }, { status: 404 });
        }

        // 5. Execute DB Transaction via RPC
        const { data: dbResult, error: dbError } = await adminSupabase.rpc('reject_payment_transaction', {
            p_payment_id: payment_id,
            p_admin_id: admin_id,
            p_reason: rejection_reason.trim()
        });

        if (dbError || !dbResult.success) {
            return NextResponse.json({
                error: dbResult?.error || dbError?.message || 'Transaction failed during rejection.'
            }, { status: 409 });
        }

        // 6. Post-Transaction Side Effects: Notification
        try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            await fetch(`${baseUrl}/api/email/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email_type: 'PAYMENT_REJECTED',
                    recipient_email: payment.student.email_address,
                    recipient_name: payment.student.student_full_name,
                    metadata: {
                        student_name: payment.student.student_full_name,
                        course_name: payment.course.course_name,
                        rejection_reason: rejection_reason.trim()
                    }
                })
            });
        } catch (emailErr) {
            console.error('Rejection notification failed. Database state is still consistent.', emailErr);
            // Non-blocking: We don't rollback rejection just because email failed
        }

        return NextResponse.json({
            success: true,
            message: 'Payment rejected. Student has been notified and re-upload is enabled.'
        });

    } catch (error: any) {
        console.error('Payment Rejection API Error:', error);
        return NextResponse.json({ error: 'Internal server error during rejection workflow.' }, { status: 500 });
    }
}
