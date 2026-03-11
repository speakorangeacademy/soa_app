import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized cron execution.' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const BUCKET_NAME = 'payment-screenshots';
    const BATCH_SIZE = 100;

    let processedCount = 0;
    let deletedCount = 0;
    const failures: string[] = [];

    try {
        // 1. Identify eligible payments
        // Status: Approved
        // Has Screenshot Path
        // Not already deleted
        // Approved at least 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: eligiblePayments, error: fetchError } = await supabase
            .from('payments')
            .select('payment_id, payment_screenshot_path, verified_at')
            .eq('verification_status', 'Approved')
            .eq('screenshot_deleted', false)
            .not('payment_screenshot_path', 'is', null)
            .lte('verified_at', thirtyDaysAgo.toISOString())
            .limit(BATCH_SIZE);

        if (fetchError) {
            console.error('Cleanup Fetch Error:', fetchError);
            return NextResponse.json({ error: 'Failed to retrieve eligible payment screenshots.' }, { status: 500 });
        }

        if (!eligiblePayments || eligiblePayments.length === 0) {
            return NextResponse.json({ message: 'No screenshots eligible for cleanup.', processed: 0, deleted: 0 });
        }

        processedCount = eligiblePayments.length;

        // 2. Process each payment
        for (const payment of eligiblePayments) {
            const path = payment.payment_screenshot_path;

            try {
                // Delete from Supabase Storage
                const { error: deleteError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .remove([path]);

                if (deleteError) {
                    console.error(`Storage Deletion Failed for Payment ${payment.payment_id}:`, deleteError);
                    failures.push(payment.payment_id);
                    continue;
                }

                // Update Database Record
                const { error: updateError } = await supabase
                    .from('payments')
                    .update({
                        screenshot_deleted: true,
                        screenshot_deleted_at: new Date().toISOString()
                    })
                    .eq('payment_id', payment.payment_id);

                if (updateError) {
                    console.error(`DB Update Failed for Payment ${payment.payment_id} after deletion:`, updateError);
                    // Note: File is gone, but DB is not updated. This might lead to re-attempts if not careful,
                    // but since path exists, .remove() will just return error/ok depending on Supabase version.
                    // Usually, we should log this and maybe even try to re-update or notify admin.
                } else {
                    deletedCount++;
                }

            } catch (err: any) {
                console.error(`Unexpected error processing payment ${payment.payment_id}:`, err);
                failures.push(payment.payment_id);
            }
        }

        // 3. Return Summary
        return NextResponse.json({
            processed: processedCount,
            deleted: deletedCount,
            failed: failures.length,
            failureIds: failures
        }, { status: failures.length > 0 ? 207 : 200 });

    } catch (error: any) {
        console.error('Scheduled Cleanup Failed:', error);
        return NextResponse.json({ error: 'Scheduled cleanup failed.' }, { status: 500 });
    }
}
