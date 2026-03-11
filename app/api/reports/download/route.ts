import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);

    const reportType = searchParams.get('report_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const fileFormat = searchParams.get('file_format');

    try {
        // 1. Validate Session & Super Admin Role
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Access denied. Super Admin privileges required.' }, { status: 401 });
        }

        const role = user.app_metadata?.app_role;
        if (role !== 'Super Admin') {
            return NextResponse.json({ error: 'Access denied. Super Admin privileges required.' }, { status: 403 });
        }

        // 2. Validate Inputs
        if (!reportType || !startDate || !endDate || !fileFormat) {
            return NextResponse.json({ error: 'Please select report type and date range.' }, { status: 400 });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            return NextResponse.json({ error: 'End date must be after start date.' }, { status: 400 });
        }

        // Validate max span = 1 financial year (approx 366 days)
        const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 366) {
            return NextResponse.json({ error: 'Date range cannot exceed one financial year (12 months).' }, { status: 400 });
        }

        let data: any[] = [];
        let fileName = `${reportType}_${startDate}_to_${endDate}`;

        // 3. Fetch Data based on reportType
        if (reportType === 'Admissions') {
            const { data: admissions, error: dbError } = await supabase
                .from('students')
                .select(`
                    student_full_name,
                    email_address,
                    created_at,
                    batch_enrollments (
                        enrollment_date,
                        batches (
                            batch_name,
                            courses (
                                course_name
                            )
                        )
                    )
                `)
                .gte('created_at', `${startDate}T00:00:00`)
                .lte('created_at', `${endDate}T23:59:59`)
                .is('deleted_at', null);

            if (dbError) throw dbError;

            data = admissions?.map(s => ({
                'Student Name': s.student_full_name,
                'Email': s.email_address,
                'Course Name': s.batch_enrollments?.[0]?.batches?.courses?.course_name || 'N/A',
                'Batch Name': s.batch_enrollments?.[0]?.batches?.batch_name || 'N/A',
                'Admission Date': new Date(s.created_at).toLocaleDateString()
            })) || [];

        } else if (reportType === 'Revenue') {
            const { data: revenue, error: dbError } = await supabase
                .from('payments')
                .select(`
                    receipt_number,
                    amount,
                    verified_at,
                    payment_date,
                    students (
                        student_full_name
                    ),
                    batches (
                        courses (
                            course_name
                        )
                    )
                `)
                .eq('verification_status', 'Verified')
                .gte('verified_at', `${startDate}T00:00:00`)
                .lte('verified_at', `${endDate}T23:59:59`);

            if (dbError) throw dbError;

            data = revenue?.map(r => ({
                'Student Name': r.students?.student_full_name || 'Unknown',
                'Receipt Number': r.receipt_number || 'N/A',
                'Amount': r.amount,
                'Payment Date': r.payment_date,
                'Course Name': r.batches?.courses?.course_name || 'N/A'
            })) || [];

        } else if (reportType === 'Batch-wise') {
            const { data: batches, error: dbError } = await supabase
                .from('batches')
                .select(`
                    batch_name,
                    max_capacity,
                    status,
                    courses (
                        course_name
                    ),
                    batch_enrollments (
                        count
                    )
                `);

            if (dbError) throw dbError;

            data = batches?.map(b => ({
                'Batch Name': b.batch_name,
                'Course Name': b.courses?.course_name || 'N/A',
                'Current Enrollment': b.batch_enrollments?.[0]?.count || 0,
                'Max Capacity': b.max_capacity,
                'Status': b.status
            })) || [];

        } else if (reportType === 'Course-wise') {
            // Course-wise enrollment needs grouping. 
            // We'll fetch all enrollments and group in memory for accuracy.
            const { data: enrollments, error: dbError } = await supabase
                .from('batch_enrollments')
                .select(`
                    batches (
                        courses (
                            course_name
                        )
                    )
                `);

            if (dbError) throw dbError;

            const counts: Record<string, number> = {};
            enrollments?.forEach(e => {
                const name = e.batches?.courses?.course_name || 'Unknown';
                counts[name] = (counts[name] || 0) + 1;
            });

            data = Object.entries(counts).map(([name, count]) => ({
                'Course Name': name,
                'Total Students': count
            }));
        }

        if (data.length === 0) {
            return NextResponse.json({ error: 'No records found for selected filters.' }, { status: 404 });
        }

        // 4. Transform and Generate File
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

        let buffer;
        let contentType;
        let ext;

        if (fileFormat === 'CSV') {
            buffer = XLSX.utils.sheet_to_csv(worksheet);
            contentType = 'text/csv';
            ext = 'csv';
        } else {
            buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            ext = 'xlsx';
        }

        return new Response(buffer, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="${fileName}.${ext}"`,
                'Content-Type': contentType,
            },
        });

    } catch (error: any) {
        console.error('Report Generation Error:', error);
        return NextResponse.json({ error: 'Something went wrong while generating the report.' }, { status: 500 });
    }
}
