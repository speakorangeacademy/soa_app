import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';
import { crypto } from 'crypto';

/**
 * Secure Admin Creation API
 * Accessible only to Super Admins.
 * Creates an Auth user and a linked public.users record.
 */

// Helper to generate a secure random password
function generatePassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

export async function POST(request: Request) {
    const supabase = createClient();
    const adminClient = createAdminClient();

    try {
        // 1. Validate Super Admin Session
        const { data: { user: requester }, error: authError } = await supabase.auth.getUser();
        if (authError || !requester) {
            return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
        }

        const role = requester.app_metadata?.app_role;
        if (role !== 'Super Admin') {
            return NextResponse.json({ error: 'Access denied. Super Admin role required.' }, { status: 403 });
        }

        // 2. Parse and Validate Request Body
        const { name, email, mobile, role: newRole } = await request.json();

        if (!name || name.trim().length < 3) {
            return NextResponse.json({ error: 'Name must be at least 3 characters.' }, { status: 400 });
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
        }
        if (!mobile || !/^[0-9]{10,15}$/.test(mobile)) {
            return NextResponse.json({ error: 'Mobile must be 10-15 digits.' }, { status: 400 });
        }
        if (!['admin', 'super_admin'].includes(newRole)) {
            return NextResponse.json({ error: 'Invalid role selected.' }, { status: 400 });
        }

        // 3. Generate Temporary Password
        const temporaryPassword = generatePassword();

        // 4. Create User in Supabase Auth (Admin API)
        const { data: authUser, error: createUserError } = await adminClient.auth.admin.createUser({
            email,
            password: temporaryPassword,
            email_confirm: true,
            user_metadata: { name, mobile },
            app_metadata: {
                app_role: newRole === 'super_admin' ? 'Super Admin' : 'Admin'
            }
        });

        if (createUserError) {
            console.error('Auth User Creation Error:', createUserError);
            return NextResponse.json({ error: createUserError.message }, { status: 500 });
        }

        const authUserId = authUser.user.id;

        // 5. Insert into public.users table (Transactional fallback)
        const { error: dbError } = await adminClient
            .from('users')
            .insert({
                id: authUserId,
                name,
                email,
                mobile,
                role: newRole,
                status: 'Active'
            });

        if (dbError) {
            console.error('DB Insert Error:', dbError);
            // ROLLBACK: Delete the Auth user if DB insert fails
            await adminClient.auth.admin.deleteUser(authUserId);
            return NextResponse.json({ error: 'User creation failed. Database state rolled back.' }, { status: 500 });
        }

        // 6. Insert Audit Log
        await adminClient
            .from('audit_logs')
            .insert({
                action: 'admin_created',
                entity_type: 'user',
                entity_id: authUserId,
                performed_by: requester.id
            });

        // 7. Success Response
        return NextResponse.json({
            success: true,
            email,
            temporary_password: temporaryPassword
        });

    } catch (error: any) {
        console.error('Admin Create API Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
