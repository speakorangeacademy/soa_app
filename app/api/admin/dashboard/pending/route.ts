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

        // Fetch pending payments with limited fields
        // EXPLICITLY excluding fee_amount to avoid revenue exposure
        const { data: payments, error } = await supabase
            .from('payments')
            .select(`
                payment_id,
                transaction_id,
                payment_date,
                verification_status,
                created_at,
                students (
                    student_full_name
                ),
                courses (
                    course_name
                ),
                batches (
                    batch_name
                )
            `)
            .eq('verification_status', 'Pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Pending payments fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch pending verifications' }, { status: 500 });
        }

        const formattedPayments = payments.map((p: any) => ({
            id: p.payment_id,
            transactionId: p.transaction_id,
            paymentDate: p.payment_date,
            status: p.verification_status,
            studentName: p.students?.student_full_name || 'N/A',
            courseName: p.courses?.course_name || 'N/A',
            batchName: p.batches?.batch_name || 'N/A'
        }));

        return NextResponse.json(formattedPayments);

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
