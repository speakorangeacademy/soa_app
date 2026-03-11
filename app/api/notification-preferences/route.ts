import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createClient();

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Please log in to manage notification preferences.' }, { status: 401 });
        }

        const { data: preferences, error: dbError } = await supabase
            .from('notification_preferences')
            .select('email_opt_in, sms_opt_in')
            .eq('user_id', user.id)
            .single();

        if (dbError && dbError.code !== 'PGRST116') { // PGRST116 is "no rows found"
            console.error('Database Fetch Error:', dbError);
            return NextResponse.json({ error: 'Could not load your preferences.' }, { status: 500 });
        }

        // Return preferences or defaults if not found
        return NextResponse.json({
            email_opt_in: preferences?.email_opt_in ?? true,
            sms_opt_in: preferences?.sms_opt_in ?? false,
        });

    } catch (error: any) {
        console.error('Notification Preferences GET Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const supabase = createClient();

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Please log in to manage notification preferences.' }, { status: 401 });
        }

        const body = await request.json();
        const { email_opt_in, sms_opt_in } = body;

        if (typeof email_opt_in !== 'boolean' || typeof sms_opt_in !== 'boolean') {
            return NextResponse.json({ error: 'Invalid preference value provided.' }, { status: 400 });
        }

        const { error: upsertError } = await supabase
            .from('notification_preferences')
            .upsert({
                user_id: user.id,
                email_opt_in,
                sms_opt_in,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });

        if (upsertError) {
            console.error('Database Upsert Error:', upsertError);
            return NextResponse.json({ error: 'Unable to save preferences. Please try again.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Notification preferences updated successfully.' });

    } catch (error: any) {
        console.error('Notification Preferences POST Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
