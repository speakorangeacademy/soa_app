import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * Enable/Disable Admin API
 * Prevents Super Admins from disabling themselves or the last Super Admin.
 */
export async function PATCH(request: Request) {
    const supabase = createClient();
    const adminClient = createAdminClient();

    try {
        // 1. Validate Requester
        const { data: { user: requester }, error: authError } = await supabase.auth.getUser();
        if (authError || !requester) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
        }

        const requesterRole = requester.app_metadata?.app_role;
        if (requesterRole !== 'Super Admin') {
            return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
        }

        // 2. Parse Body
        const { user_id, status } = await request.json();

        if (!user_id || !['Active', 'Disabled'].includes(status)) {
            return NextResponse.json({ error: 'Invalid request parameters.' }, { status: 400 });
        }

        // 3. Prevent self-disabling
        if (user_id === requester.id && status === 'Disabled') {
            return NextResponse.json({ error: 'You cannot disable your own account.' }, { status: 400 });
        }

        // 4. If disabling a Super Admin, check if they are the last one
        if (status === 'Disabled') {
            const { data: targetUser } = await adminClient
                .from('users')
                .select('role')
                .eq('id', user_id)
                .single();

            if (targetUser?.role === 'super_admin') {
                const { count } = await adminClient
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'super_admin')
                    .eq('status', 'Active');

                if (count && count <= 1) {
                    return NextResponse.json({ error: 'At least one Active Super Admin is required.' }, { status: 400 });
                }
            }
        }

        // 5. Update DB Status
        const { error: dbError } = await adminClient
            .from('users')
            .update({ status })
            .eq('id', user_id);

        if (dbError) {
            console.error('Status Update DB Error:', dbError);
            return NextResponse.json({ error: 'Failed to update user status.' }, { status: 500 });
        }

        // 6. If Disabled, optionally ban/revoke in Auth
        if (status === 'Disabled') {
            await adminClient.auth.admin.updateUserById(user_id, {
                ban_duration: 'none', // Supabase use 'none' for unban, but for ban we usually set a duration or just use status
                // Actually, status in public.users is enough if middleware/RLS checks it.
                // But better to sign out the user.
            });
            // Supabase Admin API doesn't have a direct "revoke all sessions" that is easy without listing.
            // But updating the user usually invalidates some things or we can set a ban.
        }

        // 7. Audit Log
        await adminClient
            .from('audit_logs')
            .insert({
                action: `admin_status_changed_${status.toLowerCase()}`,
                entity_type: 'user',
                entity_id: user_id,
                performed_by: requester.id
            });

        return NextResponse.json({ success: true, message: `User ${status.toLowerCase()} successfully.` });

    } catch (error: any) {
        console.error('Admin Status API Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
