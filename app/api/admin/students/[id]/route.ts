import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';
import { withAuditLogging } from '@/utils/audit-logger';
import { studentProfileSchema } from '@/types/student';

/**
 * GET - Fetch student profile with enrollment and batch details
 * PATCH - Update granular student personal details
 */

async function getStudentHandler(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createAdminClient();
    const studentId = params.id;

    if (!studentId) {
        return NextResponse.json({ error: 'Student ID is required.' }, { status: 400 });
    }

    try {
        // Fetch student with related batch and course info
        const { data: student, error } = await supabase
            .from('students')
            .select(`
                *,
                enrollments:batch_enrollments (
                    allocation_status,
                    enrollment_date,
                    batches (
                        batch_name,
                        courses (
                            course_name
                        )
                    )
                )
            `)
            .eq('student_id', studentId)
            .maybeSingle();

        if (error) {
            console.error('Error fetching student:', error);
            return NextResponse.json({ error: 'Database error while fetching student.' }, { status: 500 });
        }

        if (!student) {
            return NextResponse.json({ error: 'No student found with this ID.' }, { status: 404 });
        }

        // Flatten enrollment info for easier frontend consumption
        const latestEnrollment = student.enrollments?.[0];
        const formattedStudent = {
            ...student,
            enrollment_status: latestEnrollment?.allocation_status || 'Not Enrolled',
            admission_date: student.admission_date,
            course_name: (latestEnrollment?.batches as any)?.courses?.course_name || 'N/A',
            batch_name: (latestEnrollment?.batches as any)?.batch_name || 'N/A'
        };

        return NextResponse.json(formattedStudent);

    } catch (error) {
        console.error('Unexpected error in student GET:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function updateStudentHandler(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createAdminClient();
    const studentId = params.id;

    try {
        const body = await request.json();
        const validatedData = studentProfileSchema.parse(body);

        // 1. Check if student exists and isn't deleted
        const { data: existingStudent, error: fetchError } = await supabase
            .from('students')
            .select('*')
            .eq('student_id', studentId)
            .single();

        if (fetchError || !existingStudent) {
            return NextResponse.json({ error: 'No student found with this ID.' }, { status: 404 });
        }

        if (existingStudent.is_active === false) {
            return NextResponse.json({ error: 'Prevent update if student status = Deleted.' }, { status: 400 });
        }

        // 2. Identify changes for audit details (diff)
        const changes: Record<string, { from: any; to: any }> = {};
        let hasChanges = false;

        Object.keys(validatedData).forEach((key) => {
            const val = (validatedData as any)[key];
            const oldVal = existingStudent[key];
            if (val !== oldVal) {
                changes[key] = { from: oldVal, to: val };
                hasChanges = true;
            }
        });

        if (!hasChanges) {
            return NextResponse.json({ message: 'No changes to save.' }, { status: 200 }); // Or maybe 400 depending on preference
        }

        // 3. Perform update
        const { data: updatedStudent, error: updateError } = await supabase
            .from('students')
            .update({
                ...validatedData,
                updated_at: new Date().toISOString()
            })
            .eq('student_id', studentId)
            .select()
            .single();

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({
            success: true,
            student_id: studentId,
            updated_student: updatedStudent,
            changes
        });

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error('Error updating student profile:', error);
        return NextResponse.json({ error: 'Unable to update student profile. Please try again.' }, { status: 500 });
    }
}

export const GET = getStudentHandler;

export const PATCH = withAuditLogging(updateStudentHandler, {
    actionType: 'STUDENT_PROFILE_UPDATED',
    entityType: 'student',
    entityIdResolver: (req, result) => result.student_id,
    detailsResolver: (req, result) => result.changes
});
