import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Fetch Admin List API
 * Only Super Admins can fetch the list of admins.
 */
export async function GET() {
    const supabase = createClient();

    try {
        // 1. Validate Super Admin role
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
        }

        const role = user.app_metadata?.app_role;
        if (role !== 'Super Admin') {
            return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
        }

        // 2. Fetch admins from users table
        const { data: users, error: dbError } = await supabase
            .from('users')
            .select('id, name, email, mobile, role, status, created_at')
            .in('role', ['admin', 'super_admin'])
            .order('created_at', { ascending: false });

        if (dbError) {
            console.error('Fetch Admins Error:', dbError);
            return NextResponse.json({ error: 'Failed to fetch admin list.' }, { status: 500 });
        }

        return NextResponse.json(users);

    } catch (error: any) {
        console.error('Admin Fetch API Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
