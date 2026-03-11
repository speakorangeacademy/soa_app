import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createClient();

    // Publicly available courses that are active
    const { data, error } = await supabase
        .from('courses')
        .select('course_id, course_name, course_level, language, total_fee')
        .eq('course_status', 'Active')
        .order('course_name');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
