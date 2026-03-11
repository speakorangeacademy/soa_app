import { createAdminClient } from '@/utils/supabase/admin';
import { logAudit } from '@/utils/audit-logger';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Batch Status Audit Cron Task
 * Automatically recalculates batch.current_enrollment_count for all batches weekly 
 * and corrects batch_status if drift is detected.
 * Scheduled: Sunday 3 AM IST (configured in vercel.json)
 */
export async function GET(request: Request) {
    const cronSecret = request.headers.get('x-cron-secret');

    // 1. Authorize cron request
    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
        console.warn('[BATCH_AUDIT_UNAUTHORIZED]: Invalid or missing cron secret.');
        return NextResponse.json({
            success: false,
            error_code: '401_UNAUTHORIZED',
            message: 'Unauthorized cron execution.'
        }, { status: 401 });
    }

    const supabase = createAdminClient();
    let batchesChecked = 0;
    let batchesCorrected = 0;

    try {
        // 2. Fetch all batches
        const { data: batches, error: batchError } = await supabase
            .from('batches')
            .select('batch_id, max_capacity, current_enrollment_count, batch_status');

        if (batchError) {
            console.error('[BATCH_AUDIT_FETCH_FAILED]:', batchError);
            throw new Error('Failed to fetch batches for audit.');
        }

        if (!batches || batches.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Batch audit completed. No batches found.',
                batches_checked: 0,
                batches_corrected: 0
            });
        }

        batchesChecked = batches.length;

        // 3. Compute actual enrollment counts for all batches
        // Definition of valid enrollment: allocation_status = 'Active'
        const { data: activeEnrollments, error: enrollError } = await supabase
            .from('batch_enrollments')
            .select('batch_id')
            .eq('allocation_status', 'Active');

        if (enrollError) {
            console.error('[BATCH_AUDIT_ENROLLMENT_QUERY_FAILED]:', enrollError);
            throw new Error('Failed to calculate actual enrollment counts.');
        }

        // Aggregate actual counts per batch
        const actualCountMap: Record<string, number> = {};
        activeEnrollments.forEach((e: { batch_id: string }) => {
            actualCountMap[e.batch_id] = (actualCountMap[e.batch_id] || 0) + 1;
        });

        // 4. Compare and Correct
        for (const batch of batches) {
            const actualCount = actualCountMap[batch.batch_id] || 0;
            const driftDetected = actualCount !== batch.current_enrollment_count;

            // Recalculate status (Business rule: 'Closed' is manual override)
            let recalculatedStatus = batch.batch_status;
            if (batch.batch_status !== 'Closed') {
                recalculatedStatus = actualCount >= batch.max_capacity ? 'Full' : 'Open';
            }

            const statusMismatch = recalculatedStatus !== batch.batch_status;

            if (driftDetected || statusMismatch) {
                // 5. Update Batch (Transaction per-batch as requested)
                const { error: updateError } = await supabase
                    .from('batches')
                    .update({
                        current_enrollment_count: actualCount,
                        batch_status: recalculatedStatus,
                        updated_at: new Date().toISOString()
                    })
                    .eq('batch_id', batch.batch_id);

                if (updateError) {
                    console.error(`[BATCH_AUDIT_TRANSACTION_FAILED] Batch ${batch.batch_id}:`, updateError);
                    // Skip to next batch, but do not log audit since update failed
                    continue;
                }

                // 6. Log Audit Correction
                // Note: user_id is null for system-triggered cron tasks
                try {
                    await logAudit({
                        userId: null as any,
                        actionType: 'BATCH_STATUS_AUDIT_CORRECTION',
                        entityType: 'batch',
                        entityId: batch.batch_id,
                        details: {
                            previous_count: batch.current_enrollment_count,
                            corrected_count: actualCount,
                            previous_status: batch.batch_status,
                            corrected_status: recalculatedStatus,
                            reason: 'Weekly automated enrollment audit'
                        }
                    });
                } catch (auditError) {
                    console.error(`[BATCH_AUDIT_LOG_FAILED] Batch ${batch.batch_id}:`, auditError);
                    // We don't fail the whole job if just the audit log insert fails after successful correction
                }

                batchesCorrected++;
            }
        }

        return NextResponse.json({
            success: true,
            batches_checked: batchesChecked,
            batches_corrected: batchesCorrected,
            message: batchesCorrected > 0
                ? 'Batch audit completed. Drift corrected successfully.'
                : 'Batch audit completed. No inconsistencies detected.'
        });

    } catch (error: any) {
        console.error('[BATCH_AUDIT_EXCEPTION]:', error);
        return NextResponse.json({
            success: false,
            error_code: '500_INTERNAL_ERROR',
            message: error.message || 'Scheduled audit failed.'
        }, { status: 500 });
    }
}
