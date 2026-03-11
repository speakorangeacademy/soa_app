import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const reportParamsSchema = z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const validation = reportParamsSchema.safeParse({ from, to })
    if (!validation.success) {
        return NextResponse.json({ error: 'Invalid or missing date range' }, { status: 400 })
    }

    const { from: fromDate, to: toDate } = validation.data

    // Validate range is <= 1 year
    const start = new Date(fromDate)
    const end = new Date(toDate)
    if (start > end) {
        return NextResponse.json({ error: 'From date cannot be after To date' }, { status: 400 })
    }
    const diffMs = end.getTime() - start.getTime()
    const oneYearMs = 365 * 24 * 60 * 60 * 1000
    if (diffMs > oneYearMs) {
        return NextResponse.json({ error: 'Date range cannot exceed 1 year' }, { status: 400 })
    }

    const supabase = createClient()

    try {
        // 1. Fetch Students/Enrollments in date range
        // We use created_at from students table as the proxy for registration date
        const { data: students, error: sError } = await supabase
            .from('students')
            .select(`
                course_id,
                payment_status:payments(verification_status)
            `)
            .gte('created_at', `${fromDate}T00:00:00Z`)
            .lte('created_at', `${toDate}T23:59:59Z`)

        if (sError) throw sError

        // 2. Fetch Courses to map names
        const { data: courses, error: cError } = await supabase
            .from('courses')
            .select('course_id, course_name')
            .eq('is_active', true)

        if (cError) throw cError

        // 3. Aggregate Data
        const courseMap = new Map()
        courses?.forEach(c => {
            courseMap.set(c.course_id, {
                course_id: c.course_id,
                course_name: c.course_name,
                total_enrollments: 0,
                approved_count: 0,
                pending_count: 0
            })
        })

        students?.forEach((s: any) => {
            const courseData = courseMap.get(s.course_id)
            if (courseData) {
                courseData.total_enrollments++
                // Handle payment status aggregation
                // payments is an array due to join, but usually 1-1 per student registration
                const status = s.payment_status?.[0]?.verification_status
                if (status === 'Approved') courseData.approved_count++
                else if (status === 'Pending') courseData.pending_count++
            }
        })

        const reportData = Array.from(courseMap.values())
            .filter(d => d.total_enrollments > 0)
            .sort((a, b) => b.total_enrollments - a.total_enrollments)

        // 4. Compute Summary
        const totalEnrollments = reportData.reduce((sum, d) => sum + d.total_enrollments, 0)
        const topCourse = reportData[0]?.course_name || 'N/A'

        return NextResponse.json({
            summary: {
                total_enrollments: totalEnrollments,
                top_course: topCourse,
                range: { from: fromDate, to: toDate }
            },
            data: reportData
        })

    } catch (error: any) {
        console.error('Enrollment Report API Error:', error)
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
    }
}
