import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
    const adminClient = createAdminClient();

    // Publicly available courses that are active — admin client bypasses RLS
    const { data, error } = await adminClient
        .from('courses')
        .select('course_id, course_name, course_level, language, total_fee, mode, course_duration')
        .eq('course_status', 'Active')
        .order('course_name');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
