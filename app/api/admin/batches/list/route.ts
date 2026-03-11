import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Admin Batches List API
 * Returns all batches with their enrollment stats and course info.
 * Accessible only to Admins/Super Admins.
 */
export async function GET() {
    const supabase = createClient();

    try {
        // 1. Validate Session & Role
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Session expired.' }, { status: 401 });
        }

        const role = user.app_metadata?.app_role;
        if (role !== 'Admin' && role !== 'Super Admin') {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
        }

        // 2. Fetch All Batches
        const { data: batches, error: dbError } = await supabase
            .from('batches')
            .select(`
                batch_id,
                batch_name,
                batch_timing,
                start_date,
                max_capacity,
                current_enrollment_count,
                teacher_id,
                courses (
                    course_name
                )
            `)
            .order('start_date', { ascending: false });

        if (dbError) {
            console.error('Admin Batches Fetch Error:', dbError);
            return NextResponse.json({ error: 'Unable to load batches.' }, { status: 500 });
        }

        const formattedBatches = batches.map(batch => ({
            id: batch.batch_id,
            name: batch.batch_name,
            timing: batch.batch_timing,
            start_date: batch.start_date,
            capacity: batch.max_capacity,
            enrollment_count: batch.current_enrollment_count,
            teacher_id: batch.teacher_id,
            course_name: batch.courses?.course_name || 'N/A'
        }));

        return NextResponse.json(formattedBatches);

    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
