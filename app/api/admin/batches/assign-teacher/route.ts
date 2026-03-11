import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';
import { withAuditLogging } from '@/utils/audit-logger';

/**
 * Teacher Batch Assignment API
 * Allows Admins/Super Admins to assign a teacher to a specific batch.
 */
async function assignTeacherHandler(request: Request) {
    const supabase = createClient();
    const adminClient = createAdminClient();

    try {
        const { batchId, teacherId } = await request.json();

        if (!batchId || !teacherId) {
            return NextResponse.json({ error: 'Batch and Teacher selection are required.' }, { status: 400 });
        }

        // 1. Verify teacher exists and has the correct role
        const { data: teacher, error: teacherError } = await adminClient
            .from('users')
            .select('name, email, role')
            .eq('id', teacherId)
            .single();

        if (teacherError || !teacher || teacher.role !== 'teacher') {
            return NextResponse.json({ error: 'Selected teacher not found or invalid role.' }, { status: 400 });
        }

        // 2. Update Batch Assignment
        const { data: batch, error: batchUpdateError } = await adminClient
            .from('batches')
            .update({
                teacher_id: teacherId,
                updated_at: new Date().toISOString()
            })
            .eq('batch_id', batchId)
            .select(`
                batch_name,
                batch_timing,
                start_date,
                courses (
                    course_name
                )
            `)
            .single();

        if (batchUpdateError) {
            console.error('Batch Update Error:', batchUpdateError);
            return NextResponse.json({ error: 'Failed to assign teacher. Please try again.' }, { status: 500 });
        }

        // 3. Send Notification Email to Teacher
        try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            await fetch(`${baseUrl}/api/email/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email_type: 'TEACHER_BATCH_ASSIGNED',
                    recipient_email: teacher.email,
                    recipient_name: teacher.name,
                    metadata: {
                        teacher_name: teacher.name,
                        batch_name: batch.batch_name,
                        course_name: batch.courses?.course_name || 'N/A',
                        batch_timing: batch.batch_timing,
                        start_date: batch.start_date
                    }
                })
            });
        } catch (emailErr) {
            console.error('Email notification failed:', emailErr);
        }

        return NextResponse.json({
            success: true,
            batch_id: batchId,
            teacher_id: teacherId,
            teacher_name: teacher.name,
            batch_name: batch.batch_name,
            message: 'Teacher assigned successfully.'
        });

    } catch (error: any) {
        console.error('Batch Assignment API Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

export const POST = withAuditLogging(assignTeacherHandler, {
    actionType: 'TEACHER_ASSIGNED',
    entityType: 'batch',
    entityIdResolver: (req, result) => result.batch_id,
    detailsResolver: (req, result) => ({
        teacher_id: result.teacher_id,
        teacher_name: result.teacher_name,
        batch_name: result.batch_name
    })
});
