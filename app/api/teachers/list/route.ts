import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Fetch Teacher List API
 * Only Admins and Super Admins can fetch the list of teachers.
 */
export async function GET() {
    const supabase = createClient();

    try {
        // 1. Validate Session & Role
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
        }

        const role = user.app_metadata?.app_role;
        if (role !== 'Super Admin' && role !== 'Admin') {
            return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
        }

        // 2. Fetch teachers from users table
        const { data: teachers, error: dbError } = await supabase
            .from('users')
            .select('id, name, email, mobile, status, is_first_login, created_at')
            .eq('role', 'teacher')
            .order('created_at', { ascending: false });

        if (dbError) {
            console.error('Fetch Teachers Error:', dbError);
            return NextResponse.json({ error: 'Failed to fetch teacher list.' }, { status: 500 });
        }

        return NextResponse.json(teachers);

    } catch (error: any) {
        console.error('Teacher Fetch API Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
