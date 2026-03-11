import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch active courses
    const { data: courses } = await supabase
        .from('courses')
        .select('course_id, course_name, course_level')
        .eq('course_status', 'Active')
        .order('course_name');

    // Fetch active teachers
    const { data: teachers } = await supabase
        .from('teachers')
        .select('teacher_id, teacher_name')
        .eq('status', 'Active')
        .order('teacher_name');

    return NextResponse.json({
        courses: courses || [],
        teachers: teachers || []
    });
}
