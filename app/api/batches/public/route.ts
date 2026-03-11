import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id');

    if (!courseId) {
        return NextResponse.json({ error: 'course_id is required' }, { status: 400 });
    }

    // Publicly available batches for the selected course that are open
    // Also check end_date > current_date to ensure they haven't finished
    const { data, error } = await supabase
        .from('batches')
        .select('batch_id, batch_name, batch_timing, max_capacity, current_enrollment_count, start_date')
        .eq('course_id', courseId)
        .eq('batch_status', 'Open')
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('start_date');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
