import { createAdminClient } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const courseId = searchParams.get('course_id');
    const batchId = searchParams.get('batch_id');

    if (!studentId || !courseId || !batchId) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    try {
        // 1. Fetch Course details
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('course_name, total_fee')
            .eq('course_id', courseId)
            .single();

        // 2. Fetch Batch details
        const { data: batch, error: batchError } = await supabase
            .from('batches')
            .select('batch_name, batch_status')
            .eq('batch_id', batchId)
            .single();

        // 3. Fetch Active QR
        const { data: qr, error: qrError } = await supabase
            .from('payment_qr')
            .select('qr_image_path, qr_label')
            .eq('is_active', true)
            .maybeSingle();

        if (courseError || batchError) {
            return NextResponse.json({ error: 'Failed to fetch payment summary' }, { status: 500 });
        }

        let activeQr = null;
        if (qr) {
            activeQr = {
                qr_label: qr.qr_label,
                public_url: supabase.storage.from('payment-qr').getPublicUrl(qr.qr_image_path).data.publicUrl
            };
        }

        return NextResponse.json({
            course_name: course.course_name,
            total_fee: course.total_fee,
            batch_name: batch.batch_name,
            batch_status: batch.batch_status,
            active_qr: activeQr
        });
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
