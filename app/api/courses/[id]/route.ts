import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';
import { courseSchema } from '@/types/course';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.app_metadata?.app_role;
    if (role !== 'Super Admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const validatedData = courseSchema.parse(body);

        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('courses')
            .update({
                ...validatedData,
                updated_at: new Date().toISOString()
            })
            .eq('course_id', params.id)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'A course with this name, level, and language already exists.' }, { status: 400 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.errors || 'Invalid request body' }, { status: 400 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.app_metadata?.app_role;
    if (role !== 'Super Admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { course_status } = body;

        if (course_status !== 'Inactive') {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('courses')
            .update({
                course_status: 'Inactive',
                updated_at: new Date().toISOString()
            })
            .eq('course_id', params.id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
