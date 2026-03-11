import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * PATCH /api/batch-enrollment/books-distribution
 * Tracks course books distribution for a student in a specific batch.
 * Only accessible to the teacher assigned to the batch.
 */
export async function PATCH(request: Request) {
    const supabase = createClient();

    try {
        // 1. Authentication & Role Check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Session expired. Please login again.' }, { status: 401 });
        }

        // 2. Parse Request Body
        const { studentId, batchId, distributed } = await request.json();

        if (!studentId || !batchId || typeof distributed !== 'boolean') {
            return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
        }

        // 3. Authorization Check: Is this teacher assigned to the batch?
        const { data: batch, error: batchError } = await supabase
            .from('batches')
            .select('teacher_id')
            .eq('batch_id', batchId)
            .single();

        if (batchError || !batch) {
            return NextResponse.json({ error: 'Batch not found.' }, { status: 404 });
        }

        if (batch.teacher_id !== user.id) {
            return NextResponse.json({ error: 'You are not assigned to this batch.' }, { status: 403 });
        }

        // 4. Update Distribution Status
        const { data: updated, error: updateError } = await supabase
            .from('batch_enrollments')
            .update({
                books_distributed: distributed,
                books_distributed_at: distributed ? new Date().toISOString() : null,
                updated_at: new Date().toISOString()
            })
            .match({ student_id: studentId, batch_id: batchId })
            .select('books_distributed, books_distributed_at')
            .single();

        if (updateError) {
            console.error('Books Update Error:', updateError);
            return NextResponse.json({ error: 'Unable to update books distribution status.' }, { status: 500 });
        }

        // 5. Success
        return NextResponse.json({
            success: true,
            data: {
                books_distributed: updated.books_distributed,
                books_distributed_at: updated.books_distributed_at
            }
        });

    } catch (error: any) {
        console.error('Books API Fatal Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
