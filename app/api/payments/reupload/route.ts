import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * Secure Student Payment Re-upload API
 * Allows students to re-submit rejected payments with new screenshots and updated info.
 */
export async function POST(request: Request) {
    const supabase = createClient();
    const adminSupabase = createAdminClient();

    try {
        // 1. Authenticate Student Session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
        }

        // Verify role via the users table — the same source of truth the middleware uses.
        // app_metadata.app_role is not set in this project, so we don't rely on it.
        const { data: appUser } = await adminSupabase
            .from('users')
            .select('role, status')
            .eq('id', user.id)
            .single();

        if (!appUser || appUser.role?.toLowerCase() !== 'student') {
            return NextResponse.json({ error: 'Access restricted to students.' }, { status: 403 });
        }
        if (appUser.status !== 'Active') {
            return NextResponse.json({ error: 'Your account is inactive.' }, { status: 403 });
        }

        // 2. Parse and Validate Form Data
        const formData = await request.formData();
        const paymentId = formData.get('payment_id') as string;
        const transactionId = formData.get('transaction_id') as string;
        const paymentDate = formData.get('payment_date') as string;
        const screenshotFile = formData.get('screenshot') as File;

        if (!paymentId || !transactionId || !paymentDate || !screenshotFile) {
            return NextResponse.json({ error: 'Missing required fields or screenshot file.' }, { status: 400 });
        }

        // Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(screenshotFile.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only JPEG and PNG allowed.' }, { status: 400 });
        }
        if (screenshotFile.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
        }

        // 3. Fetch Student record to verify ownership
        const { data: student } = await adminSupabase
            .from('students')
            .select('student_id')
            .eq('user_id', user.id)
            .single();

        if (!student) {
            return NextResponse.json({ error: 'Student profile not found.' }, { status: 404 });
        }

        // 4. Lock and Validate Payment Record
        const { data: payment, error: paymentError } = await adminSupabase
            .from('payments')
            .select('payment_id, student_id, verification_status, reupload_allowed, payment_screenshot_path')
            .eq('payment_id', paymentId)
            .single();

        if (paymentError || !payment) {
            return NextResponse.json({ error: 'Payment record not found.' }, { status: 404 });
        }

        // Ownership and Status Check
        if (payment.student_id !== student.student_id) {
            return NextResponse.json({ error: 'Unauthorized. This payment does not belong to you.' }, { status: 403 });
        }
        if (payment.verification_status !== 'Rejected') {
            return NextResponse.json({ error: 'Only rejected payments can be re-uploaded.' }, { status: 400 });
        }
        if (!payment.reupload_allowed) {
            return NextResponse.json({ error: 'Re-upload is not enabled for this record.' }, { status: 400 });
        }

        // 5. Upload New Screenshot to Storage
        const fileExt = screenshotFile.name.split('.').pop();
        const timestamp = Date.now();
        const fileName = `payment_${paymentId}_${timestamp}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await adminSupabase.storage
            .from('payment-screenshots')
            .upload(filePath, screenshotFile, { upsert: false });

        if (uploadError) {
            console.error('Storage upload failed:', uploadError);
            return NextResponse.json({ error: 'Failed to upload screenshot.' }, { status: 500 });
        }

        // 6. Delete Old Screenshot if it exists
        if (payment.payment_screenshot_path) {
            await adminSupabase.storage
                .from('payment-screenshots')
                .remove([payment.payment_screenshot_path]);
        }

        // 7. Update Payment Record to Pending (Atomic)
        const { error: updateError } = await adminSupabase
            .from('payments')
            .update({
                verification_status: 'Pending',
                transaction_id: transactionId,
                payment_date: paymentDate,
                payment_screenshot_path: filePath,
                reupload_allowed: false,
                rejection_remarks: null,
                resubmitted_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('payment_id', paymentId);

        if (updateError) {
            // Rollback: try to delete the newly uploaded file if DB update fails
            await adminSupabase.storage.from('payment-screenshots').remove([filePath]);
            console.error('Database update failed:', updateError);
            return NextResponse.json({ error: 'Failed to update payment record.' }, { status: 500 });
        }

        // 8. Audit Log
        await adminSupabase.from('system_logs').insert({
            user_id: user.id,
            user_role: 'Student',
            action_type: 'PAYMENT_RESUBMITTED',
            entity_type: 'payment',
            entity_id: paymentId,
            action_details: { transaction_id: transactionId }
        });

        // 9. Notify Admin (Optional internal logic or placeholder for notification service)
        // This could be a call to a centralized notification API or an insert into an admin_notifications table

        return NextResponse.json({
            success: true,
            message: 'Payment re-submitted successfully. Status reset to Pending for verification.'
        });

    } catch (error: any) {
        console.error('Re-upload API System Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
