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

        // 1. Total Admissions (Approved Payments Count)
        const { count: admissionsCount, error: admissionsError } = await supabase
            .from('payments')
            .select('*', { count: 'exact', head: true })
            .eq('verification_status', 'Approved');

        // 2. Pending Verifications Count
        const { count: pendingCount, error: pendingError } = await supabase
            .from('payments')
            .select('*', { count: 'exact', head: true })
            .eq('verification_status', 'Pending');

        // 3. Active Batches Count
        const { count: activeBatchesCount, error: batchesError } = await supabase
            .from('batches')
            .select('*', { count: 'exact', head: true })
            .in('batch_status', ['Open', 'Full']);

        if (admissionsError || pendingError || batchesError) {
            console.error('Stats fetch error:', { admissionsError, pendingError, batchesError });
            return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
        }

        return NextResponse.json({
            admissions: admissionsCount || 0,
            pending: pendingCount || 0,
            activeBatches: activeBatchesCount || 0
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
