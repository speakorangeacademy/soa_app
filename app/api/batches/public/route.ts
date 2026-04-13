import { createAdminClient } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const adminClient = createAdminClient();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id');

    if (!courseId) {
        return NextResponse.json({ error: 'course_id is required' }, { status: 400 });
    }

    // Return Open and Full batches — admin client bypasses RLS
    const { data, error } = await adminClient
        .from('batches')
        .select('batch_id, batch_name, batch_timing, batch_status, max_capacity, current_enrollment_count, start_date, end_date')
        .eq('course_id', courseId)
        .in('batch_status', ['Open', 'Full'])
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('start_date');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
