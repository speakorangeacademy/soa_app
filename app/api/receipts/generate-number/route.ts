import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * Sequential Receipt Number Generator API
 * Returns a unique, sequential receipt number in format SO/YYYY-YY/XXXX
 * Protected: Only callable internally or by Admin/Super Admin.
 */
export async function POST(request: Request) {
    const supabase = createAdminClient();

    try {
        // 1. Verify Authentication & Admin Role
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized request.' }, { status: 401 });
        }

        const role = user.app_metadata?.app_role;
        if (role !== 'Admin' && role !== 'Super Admin') {
            return NextResponse.json({ error: 'Unauthorized request.' }, { status: 401 });
        }

        // 2. Call Sequential Database RPC
        const { data: receiptNumber, error: rpcError } = await supabase.rpc('generate_receipt_number');

        if (rpcError) {
            console.error('Receipt sequence RPC error:', rpcError);
            return NextResponse.json({ error: 'Receipt sequence error. Contact system administrator.' }, { status: 500 });
        }

        if (!receiptNumber) {
            return NextResponse.json({ error: 'Unable to generate receipt number. Please try again.' }, { status: 500 });
        }

        // 3. Regex Validation
        const receiptRegex = /^SO\/\d{4}-\d{2}\/\d{4}$/;
        if (!receiptRegex.test(receiptNumber)) {
            console.error('Invalid receipt number format generated:', receiptNumber);
            return NextResponse.json({ error: 'Invalid receipt number generated.' }, { status: 500 });
        }

        return NextResponse.json({ receiptNumber });

    } catch (error: any) {
        console.error('Receipt number generation API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
