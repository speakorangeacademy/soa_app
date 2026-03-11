import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Fetch Assigned Batches API for Teachers
 * Only returns batches where the authenticated teacher is assigned.
 */
export async function GET() {
    const supabase = createClient();

    try {
        // 1. Validate Session & Role
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Session expired. Please login again.' }, { status: 401 });
        }

        const role = user.app_metadata?.app_role;
        if (role !== 'Teacher') {
            return NextResponse.json({ error: 'Access denied. Teacher role required.' }, { status: 403 });
        }

        // 2. Fetch assigned batches with course info
        const { data: batches, error: dbError } = await supabase
            .from('batches')
            .select(`
                batch_id,
                batch_name,
                batch_timing,
                start_date,
                max_capacity,
                current_enrollment_count,
                batch_status,
                courses (
                    course_name
                )
            `)
            .eq('teacher_id', user.id)
            .order('start_date', { ascending: true });

        if (dbError) {
            console.error('Fetch Teacher Batches Error:', dbError);
            return NextResponse.json({ error: 'Unable to load batches. Please try again.' }, { status: 500 });
        }

        // Flatten the course name for easier frontend consumption
        const formattedBatches = batches.map(batch => ({
            id: batch.batch_id,
            name: batch.batch_name,
            timing: batch.batch_timing,
            start_date: batch.start_date,
            capacity: batch.max_capacity,
            enrollment_count: batch.current_enrollment_count,
            status: batch.batch_status,
            course_name: batch.courses?.course_name || 'Unknown Course'
        }));

        return NextResponse.json(formattedBatches);

    } catch (error: any) {
        console.error('Teacher Batches API Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
