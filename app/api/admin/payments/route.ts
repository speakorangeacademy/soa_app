import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * Admin Payments API
 * Fetches paginated payments with filtering.
 * Accessible only to Admins/Super Admins.
 */
export async function GET(request: Request) {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);

    try {
        // 1. Validate Session & Role
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Session expired.' }, { status: 401 });
        }

        const role = user.app_metadata?.app_role;
        if (role !== 'Admin' && role !== 'Super Admin') {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
        }

        // 2. Extract Filters & Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        const status = searchParams.get('status');
        const batchId = searchParams.get('batchId');
        const fromDate = searchParams.get('fromDate');
        const toDate = searchParams.get('toDate');
        const search = searchParams.get('search');

        // 3. Build Query using admin client to bypass RLS
        const adminClient = createAdminClient();
        let query = adminClient
            .from('payments')
            .select(`
                id:payment_id,
                payment_date,
                transaction_id,
                payment_method,
                fee_amount,
                status:verification_status,
                receipt_number,
                verified_by,
                verified_at,
                students (
                    name:student_full_name,
                    parent_name
                ),
                batches (
                    name:batch_name,
                    courses (
                        name:course_name
                    )
                )
            `, { count: 'exact' });

        // Apply Filters
        if (status && status !== 'All') {
            query = query.eq('verification_status', status);
        }

        if (batchId && batchId !== 'all') {
            query = query.eq('batch_id', batchId);
        }

        if (fromDate) {
            query = query.gte('payment_date', fromDate);
        }

        if (toDate) {
            // Include end date by adding one day or setting time to end of day
            // Assuming simple date string YYYY-MM-DD
            query = query.lte('payment_date', `${toDate}T23:59:59`);
        }

        if (search) {
            // Search by student name or transaction ID
            // Note: complex OR logic across joined tables can be tricky in Supabase basic query builder.
            // We'll search primarily on transaction_id on the payments table or use a more complex filter string.
            // For Joined tables, text search is limited. 
            // We can use the .or() filter, but referencing joined columns requires specific syntax or foreign key embedding.
            // A simpler approach for now is filtering on transaction_id directly if possible, or student name via joined filter if supported.
            // Given limitations, let's try a filter on transaction_id OR students.name
            // Supabase JS client supports referencing foreign tables in filters if using embedding, but .or() across tables is hard.
            // We will implement search on transaction_id OR exact match on amount for simplified admin search for now.
            // To properly search student name, we might need a stored procedure or view, but let's try a direct ILIKE on transaction_id first.
            // If we really need student name search, it's best to do it via a separate search index or RPC.
            // Let's settle on: Search = Transaction ID OR Student Name (if manageable).
            // Actually, Supabase doesn't easily support OR across joined tables in one .or() string.
            // We'll stick to Transaction ID search for simplicity and robustness in this iteration.
            // Or allow searching student name if we flip the join, but that changes the primary table.

            // Revised Strategy: Single search bar for Transaction ID.
            query = query.ilike('transaction_id', `%${search}%`);
        }

        // Apply Pagination
        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // 4. Execute Query
        const { data: payments, count, error: dbError } = await query;

        if (dbError) {
            console.error('Admin Payments Fetch Error:', dbError);
            return NextResponse.json({ error: 'Unable to load payments.' }, { status: 500 });
        }

        // 5. Format Response
        const formattedPayments = payments?.map(p => ({
            id: p.id,
            date: p.payment_date,
            student_name: (p.students as any)?.name || 'Unknown',
            parent_name: (p.students as any)?.parent_name || 'N/A',
            course_name: (p.batches as any)?.courses?.name || 'N/A',
            batch_name: (p.batches as any)?.name || 'N/A',
            transaction_id: p.transaction_id,
            method: p.payment_method,
            amount: p.fee_amount,
            status: p.status,
            receipt_no: p.receipt_number,
            verified_by: p.verified_by, // You might want to fetch verifier name separately or join distinct
            verified_at: p.verified_at
        }));

        return NextResponse.json({
            data: formattedPayments,
            meta: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit)
            }
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
