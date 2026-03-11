import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * Backend service to permanently delete payment screenshots after approval.
 * Safe to retry (idempotent).
 */
export async function POST(request: Request) {
    const supabase = createAdminClient();

    try {
        const { payment_id } = await request.json();

        if (!payment_id) {
            return NextResponse.json({ error: 'Payment ID required.' }, { status: 400 });
        }

        // 1. Fetch Payment details and Lock Row for consistency
        // Note: Suprabase JS doesn't support 'FOR UPDATE' directly, so we use a sequence of checks
        // or we could use an RPC. Since this is a cleanup task, we'll use a direct check.
        const { data: payment, error: fetchError } = await supabase
            .from('payments')
            .select('payment_id, verification_status, payment_screenshot_path')
            .eq('payment_id', payment_id)
            .single();

        if (fetchError || !payment) {
            return NextResponse.json({ error: 'Payment not found.' }, { status: 404 });
        }

        // 2. Validate Payment Status
        if (payment.verification_status !== 'Approved') {
            return NextResponse.json(
                { error: 'Screenshot can only be deleted after approval.' },
                { status: 400 }
            );
        }

        // 3. Handle Idempotency (Already deleted)
        if (!payment.payment_screenshot_path) {
            return NextResponse.json({
                success: true,
                message: 'Screenshot already removed.'
            }, { status: 200 });
        }

        const screenshotPath = payment.payment_screenshot_path;

        // 4. Delete from Storage
        // Ensure we are only deleting from the correct bucket
        const { error: storageError } = await supabase.storage
            .from('payment-screenshots')
            .remove([screenshotPath]);

        if (storageError) {
            console.error('Storage deletion failed:', storageError);
            return NextResponse.json({ error: 'Failed to delete screenshot from storage.' }, { status: 500 });
        }

        // 5. Update Database - Clear reference and record timestamp
        const { error: updateError } = await supabase
            .from('payments')
            .update({
                payment_screenshot_path: null,
                screenshot_deleted_at: new Date().toISOString()
            })
            .eq('payment_id', payment_id);

        if (updateError) {
            console.error('DB update failed after storage deletion:', updateError);
            return NextResponse.json({ error: 'Database update failed.' }, { status: 500 });
        }

        // 6. Log Audit Entry in system_logs
        await supabase.from('system_logs').insert({
            action_type: 'PAYMENT_SCREENSHOT_DELETED',
            entity_type: 'payment',
            entity_id: payment_id,
            action_details: {
                cleared_path: screenshotPath,
                reason: 'Automated cleanup after approval'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Payment screenshot permanently deleted and record updated.'
        });

    } catch (error: any) {
        console.error('Screenshot Cleanup Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
