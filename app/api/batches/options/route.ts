import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = user.app_metadata?.app_role;
    if (role !== 'Admin' && role !== 'Super Admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use admin client to bypass RLS for data queries
    const adminClient = createAdminClient();

    // Fetch active courses
    const { data: courses } = await adminClient
        .from('courses')
        .select('course_id, course_name, course_level')
        .eq('course_status', 'Active')
        .order('course_name');

    // Fetch active teachers
    const { data: teachers } = await adminClient
        .from('teachers')
        .select('teacher_id, teacher_name')
        .eq('status', 'Active')
        .order('teacher_name');

    return NextResponse.json({
        courses: courses || [],
        teachers: teachers || []
    });
}
