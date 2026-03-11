import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Fetch Teacher Profile API
 * Returns details for the authenticated teacher.
 */
export async function GET() {
    const supabase = createClient();

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Session expired.' }, { status: 401 });
        }

        const { data: profile, error: dbError } = await supabase
            .from('users')
            .select('id, name, email, mobile, role')
            .eq('id', user.id)
            .single();

        if (dbError || !profile) {
            return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
        }

        return NextResponse.json(profile);

    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
