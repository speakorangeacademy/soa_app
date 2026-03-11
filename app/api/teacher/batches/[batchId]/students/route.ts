import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Fetch Student Roster for a Batch
 * Validates that the batch belongs to the authenticated teacher.
 */
export async function GET(
    request: Request,
    { params }: { params: { batchId: string } }
) {
    const { batchId } = params;
    const supabase = createClient();

    try {
        // 1. Validate Session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Session expired.' }, { status: 401 });
        }

        // 2. Security Check: Does the batch belong to this teacher?
        const { data: batch, error: batchError } = await supabase
            .from('batches')
            .select('batch_id')
            .eq('batch_id', batchId)
            .eq('teacher_id', user.id)
            .single();

        if (batchError || !batch) {
            return NextResponse.json({ error: 'You do not have access to this batch.' }, { status: 403 });
        }

        // 3. Fetch Student Roster
        // Join batch_enrollments with students, filtering by Approved payments for this batch
        const { data: enrollments, error: dbError } = await supabase
            .from('batch_enrollments')
            .select(`
                enrollment_date,
                id_card_distributed,
                id_card_distributed_at,
                books_distributed,
                books_distributed_at,
                students (
                    student_id,
                    student_full_name,
                    parent_name,
                    email_address,
                    mobile_number
                )
            `)
            .eq('batch_id', batchId)
            .order('students(student_full_name)', { ascending: true });

        if (dbError) {
            console.error('Fetch Roster Error:', dbError);
            return NextResponse.json({ error: 'Unable to load students.' }, { status: 500 });
        }

        const formattedStudents = enrollments
            .filter(e => e.students)
            .map(e => ({
                id: e.students.student_id,
                name: e.students.student_full_name,
                parent_name: e.students.parent_name || 'N/A',
                email: e.students.email_address || 'N/A',
                mobile: e.students.mobile_number,
                enrollment_date: e.enrollment_date,
                id_card_distributed: e.id_card_distributed || false,
                id_card_distributed_at: e.id_card_distributed_at,
                books_distributed: e.books_distributed || false,
                books_distributed_at: e.books_distributed_at,
                batch_id: batchId
            }));

        return NextResponse.json(formattedStudents);

    } catch (error: any) {
        console.error('Teacher Roster API Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
