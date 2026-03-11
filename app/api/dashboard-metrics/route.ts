import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = createClient();

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

        // 2. Parallel Fetch from Views
        const [
            { data: admissions, error: admError },
            { data: revenue, error: revError },
            { data: pending, error: pendError },
            { data: batchStrength, error: batchError },
            { data: courseEnrollment, error: courseError }
        ] = await Promise.all([
            supabase.from('view_total_admissions').select('*').single(),
            supabase.from('view_total_revenue').select('*').single(),
            supabase.from('view_pending_payments').select('*').single(),
            supabase.from('view_batch_strength').select('*'),
            supabase.from('view_course_wise_enrollment').select('*')
        ]);

        if (admError || revError || pendError || batchError || courseError) {
            console.error('Metrics Fetch Error:', { admError, revError, pendError, batchError, courseError });
            return NextResponse.json({ error: 'Unable to load dashboard metrics.' }, { status: 500 });
        }

        // 3. Format Response
        const metrics = {
            totalAdmissions: admissions?.total_admissions ?? 0,
            totalRevenue: revenue?.total_revenue ?? 0,
            pendingPayments: pending?.pending_count ?? 0,
            batchStrength: batchStrength || [],
            courseEnrollment: courseEnrollment || []
        };

        return NextResponse.json(metrics);

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
