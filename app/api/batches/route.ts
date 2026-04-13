import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';
import { batchSchema } from '@/types/batch';

export async function GET() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Join batches with courses and teachers
    const { data, error } = await adminClient
        .from('batches')
        .select(`
      *,
      course:courses(course_name),
      teacher:teachers(teacher_name)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten the response for the frontend
    const formattedData = data.map((b: any) => ({
        ...b,
        course_name: b.course?.course_name,
        teacher_name: b.teacher?.teacher_name
    }));

    return NextResponse.json(formattedData);
}

export async function POST(request: Request) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.app_metadata?.app_role;
    if (role !== 'Super Admin') {
        return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const adminClient = createAdminClient();

    try {
        const body = await request.json();
        const validatedData = batchSchema.parse(body);

        const { data, error } = await adminClient
            .from('batches')
            .insert({
                ...validatedData,
                current_enrollment_count: 0,
                batch_status: 'Open' // Triggers will adjust this if logic dictates otherwise
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Batch with this name already exists for selected course.' }, { status: 400 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.errors || 'Invalid request body' }, { status: 400 });
    }
}
