import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * Force Password Change API
 * Accessible to authenticated Teachers.
 * 1. Re-authenticates with current password (security).
 * 2. Updates Supabase Auth password.
 * 3. Updates users table setting is_first_login = false.
 * 4. Logs the action.
 */
export async function POST(request: Request) {
    const supabase = createClient();
    const adminClient = createAdminClient();

    try {
        // 1. Validate Session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Session expired. Please login again.' }, { status: 401 });
        }

        // 2. Parse and Validate Body
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Both current and new passwords are required.' }, { status: 400 });
        }

        // 3. Re-authenticate to ensure security
        const { error: reauthError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: currentPassword
        });

        if (reauthError) {
            return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
        }

        // 4. Update password in Supabase Auth
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 400 });
        }

        // 5. Update users table (Transactional atomic-like update)
        const { error: dbError } = await adminClient
            .from('users')
            .update({ is_first_login: false })
            .eq('id', user.id);

        if (dbError) {
            console.error('DB Update error:', dbError);
            // We can't easily rollback Auth password change, but we can try to flag it?
            // Usually, this is rare.
            return NextResponse.json({ error: 'Failed to update system status. Please contact support.' }, { status: 500 });
        }

        // 6. Audit Log
        await adminClient
            .from('audit_logs')
            .insert({
                action: 'teacher_first_login_password_changed',
                entity_type: 'user',
                entity_id: user.id,
                performed_by: user.id
            });

        return NextResponse.json({ success: true, message: 'Password updated successfully.' });

    } catch (error: any) {
        console.error('Force Password Change API Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
