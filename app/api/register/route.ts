import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { studentRegistrationSchema } from '@/types/registration';

async function sendEmail(payload: any) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await fetch(`${baseUrl}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error('Email trigger failed:', err);
    }
}

export async function POST(request: Request) {
    const supabase = createClient();

    try {
        const body = await request.json();
        const validatedData = studentRegistrationSchema.parse(body);

        const {
            student_full_name, parent_name, mobile_number, email_address,
            date_of_birth, gender, address, course_id, batch_id
        } = validatedData;

        // 1. Check if student already exists by mobile or email
        const { data: existingStudent, error: searchError } = await supabase
            .from('students')
            .select('student_id')
            .or(`mobile_number.eq.${mobile_number},email_address.eq.${email_address}`)
            .maybeSingle();

        if (searchError) {
            return NextResponse.json({ error: 'Database searching error' }, { status: 500 });
        }

        let studentId = existingStudent?.student_id;

        // 2. If student does not exist, create a new one
        if (!studentId) {
            const tempPassword = Math.random().toString(36).slice(-8);
            // login_identifier is mobile_number

            const { data: newStudent, error: createError } = await supabase
                .from('students')
                .insert({
                    student_full_name,
                    parent_name,
                    mobile_number,
                    email_address,
                    date_of_birth,
                    gender,
                    address,
                    login_identifier: mobile_number,
                    password_hash: 'TMP_HASH_' + tempPassword, // Placeholder since Supabase Auth handles actual pass
                    is_active: true,
                    admission_date: new Date().toISOString()
                })
                .select('student_id')
                .single();

            if (createError) {
                return NextResponse.json({ error: 'Failed to create student record. ' + createError.message }, { status: 500 });
            }
            studentId = newStudent.student_id;
        }

        // 3. Final validation for the batch (check if still open and has space)
        const { validateBatchCapacity } = await import('@/utils/batch-validator');
        const capacityVal = await validateBatchCapacity(batch_id);

        if (!capacityVal.allowed) {
            return NextResponse.json({ error: capacityVal.reason }, { status: 400 });
        }

        // Fetch batch info for email metadata (was previously done in the select)
        const { data: batch } = await supabase
            .from('batches')
            .select('courses(course_name)')
            .eq('batch_id', batch_id)
            .single();

        // 4. Check for duplicate ACTIVE enrollment (per requirement)
        const { data: existingEnrollment } = await supabase
            .from('batch_enrollments')
            .select('enrollment_id')
            .eq('student_id', studentId)
            .eq('allocation_status', 'Active')
            .maybeSingle();

        if (existingEnrollment) {
            return NextResponse.json({ error: 'Student already enrolled in an active batch.' }, { status: 400 });
        }

        // 5. Success - trigger email and return IDs for payment initiation
        sendEmail({
            email_type: 'REGISTRATION_CONFIRMATION',
            recipient_email: email_address,
            recipient_name: student_full_name,
            metadata: {
                student_name: student_full_name,
                course_name: (batch as any).courses.course_name
            }
        });

        return NextResponse.json({
            student_id: studentId,
            course_id,
            batch_id
        });

    } catch (error: any) {
        if (error.errors) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
