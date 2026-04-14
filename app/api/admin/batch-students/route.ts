import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Fetch Student List for a Batch (Admin only)
 * Returns batch metadata and a list of students with their payment status and receipt URL.
 */
export async function GET(
    request: Request,
    { params }: { params: { batchId: string } }
) {
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batchId')

    if (!batchId) {
        return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 })
    }

    const supabase = createClient()

    try {
        // 1. Verify Admin Session (Middleware should handle this usually, but double checking here)
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Fetch Batch Metadata
        const { data: batch, error: batchError } = await supabase
            .from('batches')
            .select(`
                batch_id,
                batch_name,
                batch_timing,
                start_date,
                courses (course_name),
                teachers (teacher_name)
            `)
            .eq('batch_id', batchId)
            .single()

        if (batchError || !batch) {
            return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
        }

        // 3. Fetch Enrolled Students with Payment Info
        // We join batch_enrollments -> students -> payments (joined on student_id AND batch_id)
        const { data: enrollments, error: dbError } = await supabase
            .from('batch_enrollments')
            .select(`
                enrolled_date,
                status,
                students (
                    student_id,
                    student_full_name,
                    parent_name,
                    parent_email,
                    parent_phone,
                    payments!left (
                        verification_status,
                        receipt_url,
                        created_at
                    )
                )
            `)
            .eq('batch_id', batchId)
            .order('students(student_full_name)', { ascending: true })

        if (dbError) {
            console.error('Fetch Batch Students Error:', dbError)
            return NextResponse.json({ error: 'Unable to load student roster' }, { status: 500 })
        }

        // 4. Format Data
        // Since a student might have multiple payment attempts, we pick the most recent one for this batch
        const formattedStudents = enrollments.map((en: any) => {
            const student = en.students
            // Filter payments for this specific batch if not already filtered by query
            // Although RLS or specific join might be better, we handle it here for clarity
            const studentPayments = student.payments || []
            const latestPayment = studentPayments
                .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

            return {
                id: student.student_id,
                name: student.student_full_name,
                parent_name: student.parent_name,
                parent_email: student.parent_email,
                parent_phone: student.parent_phone,
                payment_status: latestPayment?.verification_status || 'Pending',
                receipt_url: latestPayment?.receipt_url || null,
                enrollment_date: en.enrolled_date,
                enrollment_status: en.status
            }
        })

        return NextResponse.json({
            batch: {
                id: batch.batch_id,
                name: batch.batch_name,
                timing: batch.batch_timing,
                startDate: batch.start_date,
                course: (batch.courses as any)?.course_name,
                teacher: (batch.teachers as any)?.teacher_name
            },
            students: formattedStudents
        })

    } catch (error: any) {
        console.error('Batch Students API Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
