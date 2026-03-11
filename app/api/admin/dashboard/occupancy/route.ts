import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createClient();

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = user.app_metadata?.app_role;
        if (role !== 'Admin' && role !== 'Super Admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch batches with course and teacher names
        // Note: We don't fetch any financial data here
        const { data: batches, error } = await supabase
            .from('batches')
            .select(`
                batch_id,
                batch_name,
                max_capacity,
                current_enrollment_count,
                batch_status,
                start_date,
                courses (
                    course_name
                ),
                users (
                    name
                )
            `)
            .in('batch_status', ['Open', 'Full', 'Completed'])
            .order('start_date', { ascending: false });

        if (error) {
            console.error('Batch occupancy fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch batch occupancy' }, { status: 500 });
        }

        const formattedBatches = batches.map((b: any) => ({
            id: b.batch_id,
            name: b.batch_name,
            courseName: b.courses?.course_name || 'N/A',
            teacherName: b.users?.name || 'Not Assigned',
            capacity: b.max_capacity,
            currentEnrollment: b.current_enrollment_count,
            status: b.batch_status,
            occupancy: b.max_capacity > 0
                ? Math.round((b.current_enrollment_count / b.max_capacity) * 100)
                : 0
        }));

        return NextResponse.json(formattedBatches);

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
