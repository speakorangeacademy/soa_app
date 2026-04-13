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

        // Run all 3 counts in parallel
        const [admissionsRes, pendingRes, batchesRes] = await Promise.all([
            supabase.from('payments').select('*', { count: 'exact', head: true }).eq('verification_status', 'Approved'),
            supabase.from('payments').select('*', { count: 'exact', head: true }).eq('verification_status', 'Pending'),
            supabase.from('batches').select('*', { count: 'exact', head: true }).in('batch_status', ['Open', 'Full'])
        ]);

        if (admissionsRes.error || pendingRes.error || batchesRes.error) {
            return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
        }

        return NextResponse.json({
            admissions: admissionsRes.count || 0,
            pending: pendingRes.count || 0,
            activeBatches: batchesRes.count || 0
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
