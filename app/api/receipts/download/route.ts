import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * Secure Receipt Download Service
 * Streams approved PDF receipts from storage with role-based access control.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id') || searchParams.get('receipt_id');

    if (!paymentId) {
        return NextResponse.json({ error: 'Receipt ID or Payment ID required.' }, { status: 400 });
    }

    const supabase = createClient();
    const adminSupabase = createAdminClient();

    try {
        // 1. Authenticate User
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
        }

        const userRole = user.app_metadata?.app_role;

        // 2. Fetch Receipt and Payment Data
        // Using admin client to bypass RLS for initial verification to handle cross-role logic in code
        const { data: receipt, error: receiptError } = await adminSupabase
            .from('receipts')
            .select(`
                receipt_number,
                receipt_pdf_path,
                student_id,
                payment_id,
                payments!inner(verification_status)
            `)
            .or(`payment_id.eq.${paymentId},receipt_id.eq.${paymentId}`)
            .single();

        if (receiptError || !receipt) {
            return NextResponse.json({ error: 'Receipt not found.' }, { status: 404 });
        }

        // 3. Authorization Check
        if (userRole === 'Super Admin') {
            // Full access allowed
        } else if (userRole === 'Student') {
            // Verify ownership
            const { data: student } = await adminSupabase
                .from('students')
                .select('student_id')
                .eq('user_id', user.id)
                .single();

            if (!student || student.student_id !== receipt.student_id) {
                return NextResponse.json({ error: 'Access denied. You do not own this receipt.' }, { status: 403 });
            }
        } else {
            return NextResponse.json({ error: 'Access restricted to Students and Admins.' }, { status: 403 });
        }

        // 4. Verify Payment Status (Must be Approved)
        if ((receipt as any).payments.verification_status !== 'Approved') {
            return NextResponse.json({ error: 'Receipt not available for unapproved payments.' }, { status: 400 });
        }

        // 5. Download File from Storage
        const { data: fileBuffer, error: downloadError } = await adminSupabase.storage
            .from('receipts')
            .download(receipt.receipt_pdf_path);

        if (downloadError || !fileBuffer) {
            console.error('Storage download failed:', downloadError);
            return NextResponse.json({ error: 'Receipt file found in database but missing in storage.' }, { status: 404 });
        }

        // 6. Log Download Event
        await adminSupabase.from('system_logs').insert({
            action_type: 'RECEIPT_DOWNLOADED',
            entity_type: 'payment',
            entity_id: receipt.payment_id,
            user_id: user.id,
            action_details: { receipt_number: receipt.receipt_number, role: userRole }
        });

        // 7. Stream Response
        const response = new NextResponse(fileBuffer);

        response.headers.set('Content-Type', 'application/pdf');
        response.headers.set('Content-Disposition', `attachment; filename="receipt_${receipt.receipt_number.replace(/\//g, '_')}.pdf"`);
        response.headers.set('Cache-Control', 'private, no-store');

        return response;

    } catch (error: any) {
        console.error('Receipt Download API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
