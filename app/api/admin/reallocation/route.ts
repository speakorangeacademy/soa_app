import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';
import { withAuditLogging } from '@/utils/audit-logger';

/**
 * Batch Re-allocation API
 * Moves a student from one batch to another within the same course.
 */
async function batchReallocationHandler(request: Request) {
    const supabase = createAdminClient();

    try {
        const { student_id, old_batch_id, new_batch_id, reason } = await request.json();

        if (!student_id || !old_batch_id || !new_batch_id) {
            return NextResponse.json({ error: 'Missing student_id, old_batch_id, or new_batch_id' }, { status: 400 });
        }

        // 0. Validate Capacity of the Target Batch
        const { validateBatchCapacity } = await import('@/utils/batch-validator');
        const capacityVal = await validateBatchCapacity(new_batch_id);

        if (!capacityVal.allowed) {
            return NextResponse.json({ error: capacityVal.reason }, { status: 400 });
        }

        // 1. Transactional re-allocation via RPC
        // This RPC should handle: 
        // - decreasing count in old_batch 
        // - increasing count in new_batch 
        // - updating the batch_enrollments record
        const { data, error } = await supabase.rpc('reallocate_student_batch', {
            p_student_id: student_id,
            p_old_batch_id: old_batch_id,
            p_new_batch_id: new_batch_id,
            p_reason: reason || 'Administrative re-allocation'
        });

        if (error) {
            console.error('Re-allocation RPC error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data.success) {
            return NextResponse.json({ error: data.error || 'Re-allocation failed' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            student_id,
            old_batch_id,
            new_batch_id,
            enrollment_id: data.enrollment_id,
            message: 'Student successfully re-allocated to new batch.'
        });

    } catch (error: any) {
        console.error('Re-allocation API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const POST = withAuditLogging(batchReallocationHandler, {
    actionType: 'BATCH_REALLOCATED',
    entityType: 'enrollment',
    entityIdResolver: (req, result) => result.enrollment_id,
    detailsResolver: (req, result) => ({
        student_id: result.student_id,
        old_batch_id: result.old_batch_id,
        new_batch_id: result.new_batch_id,
        reason: result.reason
    })
});
