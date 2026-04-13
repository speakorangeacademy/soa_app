import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createClient();

    try {
        // 1. Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch Student Record
        let { data: student, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        // 2b. Auto-link logic: Link by Email or Phone if not linked yet
        if (!student && !studentError) {
            const email = user.email;
            const phone = user.user_metadata?.phone || user.phone;

            const { data: linkableStudent } = await supabase
                .from('students')
                .select('*')
                .is('user_id', null)
                .or(`email_address.eq.${email},mobile_number.eq.${phone}`)
                .maybeSingle();

            if (linkableStudent && linkableStudent.is_active !== false) {
                const { data: updatedStudent, error: linkError } = await supabase
                    .from('students')
                    .update({ user_id: user.id })
                    .eq('student_id', linkableStudent.student_id)
                    .select()
                    .single();

                if (!linkError) student = updatedStudent;
            }
        }

        if (studentError || !student) {
            return NextResponse.json({ error: 'Student profile not found. Please ensure you registered with the same email/phone.' }, { status: 404 });
        }

        // 3 & 4. Fetch Payment and Enrollment in parallel
        const [paymentResult, enrollmentResult] = await Promise.all([
            supabase
                .from('payments')
                .select(`
                    *,
                    course:courses(course_name, total_fee),
                    receipt:receipts(receipt_number, receipt_pdf_path)
                `)
                .eq('student_id', student.student_id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle(),
            supabase
                .from('batch_enrollments')
                .select(`
                    *,
                    batch:batches(
                        *,
                        teacher:teachers(teacher_name)
                    )
                `)
                .eq('student_id', student.student_id)
                .eq('allocation_status', 'Active')
                .maybeSingle()
        ]);

        return NextResponse.json({
            student,
            payment: paymentResult.data,
            enrollment: enrollmentResult.data,
        });

    } catch (error: any) {
        console.error('Student Dashboard API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
