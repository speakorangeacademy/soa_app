import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';
import { withAuditLogging } from '@/utils/audit-logger';

async function batchAllocationHandler(request: Request) {
    const supabase = createAdminClient();

    try {
        const { student_id, batch_id, payment_id } = await request.json();

        if (!student_id || !batch_id || !payment_id) {
            return NextResponse.json({ error: 'Missing student_id, batch_id, or payment_id' }, { status: 400 });
        }

        // 1. Transactional check using RPC
        const { data, error } = await supabase.rpc('allocate_batch_seat', {
            p_student_id: student_id,
            p_batch_id: batch_id,
            p_payment_id: payment_id
        });

        if (error) {
            console.error('Batch allocation error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data.success) {
            const status = data.error === 'Batch capacity reached' ? 409 : 400;
            return NextResponse.json({ error: data.error }, { status });
        }

        return NextResponse.json({
            success: true,
            enrollment_id: data.enrollment_id,
            student_id,
            batch_id,
            payment_id,
            message: 'Student successfully allocated to batch.'
        });

    } catch (error: any) {
        console.error('Allocation engine error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const POST = withAuditLogging(batchAllocationHandler, {
    actionType: 'BATCH_ALLOCATED',
    entityType: 'enrollment',
    entityIdResolver: (req, result) => result.enrollment_id,
    detailsResolver: (req, result) => ({
        student_id: result.student_id,
        batch_id: result.batch_id,
        payment_id: result.payment_id
    })
});
