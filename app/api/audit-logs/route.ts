import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/audit-logs
 * Fetch paginated and filtered audit logs for Super Admins.
 */
export async function GET(request: Request) {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);

    try {
        // 1. Validate Session & Role
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
        }

        const role = user.app_metadata?.app_role;
        if (role !== 'Super Admin') {
            return NextResponse.json({ error: 'Access restricted to Super Admin only.' }, { status: 403 });
        }

        // 2. Parse Query Params
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
        const search = searchParams.get('search')?.trim();
        const actionType = searchParams.get('action_type');
        const entityType = searchParams.get('entity_type');
        const dateFrom = searchParams.get('date_from');
        const dateTo = searchParams.get('date_to');

        if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
            return NextResponse.json({ error: 'Invalid filter parameters.' }, { status: 400 });
        }

        if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
            return NextResponse.json({ error: 'Invalid date range. Start date must be before end date.' }, { status: 400 });
        }

        // 3. Build Dynamic Query
        let query = supabase
            .from('audit_logs')
            .select('*', { count: 'exact' });

        // Search (Partial match on entity_id or user_id)
        // Since entity_id and user_id are UUIDs, we cast them to text for ILIKE
        if (search) {
            query = query.or(`entity_id.text.ilike.%${search}%,user_id.text.ilike.%${search}%`);
        }

        // Filters
        if (actionType && actionType !== 'All') {
            query = query.eq('action_type', actionType);
        }
        if (entityType && entityType !== 'All') {
            query = query.eq('entity_type', entityType);
        }

        // Date Range
        if (dateFrom) {
            query = query.gte('created_at', new Date(dateFrom).toISOString());
        }
        if (dateTo) {
            // Include the entire end day
            const endOfDay = new Date(dateTo);
            endOfDay.setHours(23, 59, 59, 999);
            query = query.lte('created_at', endOfDay.toISOString());
        }

        // Pagination & Sorting
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        query = query
            .order('created_at', { ascending: false })
            .range(from, to);

        const { data: logs, count, error: queryError } = await query;

        if (queryError) {
            console.error('[AUDIT_LOG_QUERY_ERROR]:', queryError);
            return NextResponse.json({ error: 'Unable to fetch audit logs. Please try again.' }, { status: 500 });
        }

        return NextResponse.json({
            logs: logs || [],
            totalCount: count || 0,
            page,
            limit
        });

    } catch (err: any) {
        console.error('[AUDIT_LOG_API_CRITICAL]:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
