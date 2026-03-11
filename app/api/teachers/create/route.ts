import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * Secure Teacher Creation API
 * Accessible to Admins and Super Admins.
 * Creates an Auth user and a linked public.users record with role='teacher'.
 */

// Helper to generate a secure random password
function generateTeacherPassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
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
        // 1. Validate Session & Role
        const { data: { user: requester }, error: authError } = await supabase.auth.getUser();
        if (authError || !requester) {
            return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
        }

        const requesterRole = requester.app_metadata?.app_role;
        if (requesterRole !== 'Super Admin' && requesterRole !== 'Admin') {
            return NextResponse.json({ error: 'Access denied. Administrator role required.' }, { status: 403 });
        }

        // 2. Parse and Validate Request Body
        const { name, email, mobile, password } = await request.json();

        if (!name || name.trim().length < 3) {
            return NextResponse.json({ error: 'Name must be at least 3 characters.' }, { status: 400 });
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
        }
        if (!mobile || !/^[0-9]{10,15}$/.test(mobile)) {
            return NextResponse.json({ error: 'Mobile must be 10-15 digits.' }, { status: 400 });
        }

        // Password validation (min 10 chars, upper, lower, number)
        if (!password || password.length < 10 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            return NextResponse.json({ error: 'Generated password failed security rules.' }, { status: 400 });
        }

        // 3. Create User in Supabase Auth (Admin API)
        const { data: authUser, error: createUserError } = await adminClient.auth.admin.createUser({
            email,
            password: password,
            email_confirm: true,
            user_metadata: { name, mobile },
            app_metadata: {
                app_role: 'Teacher'
            }
        });

        if (createUserError) {
            console.error('Auth Teacher Creation Error:', createUserError);
            if (createUserError.message.includes('already registered')) {
                return NextResponse.json({ error: 'Email already registered.' }, { status: 400 });
            }
            return NextResponse.json({ error: 'Failed to create authentication account.' }, { status: 500 });
        }

        const authUserId = authUser.user.id;

        // 4. Insert into public.users table
        const { error: dbError } = await adminClient
            .from('users')
            .insert({
                id: authUserId,
                name,
                email,
                mobile,
                role: 'teacher',
                is_first_login: true,
                status: 'Active'
            });

        if (dbError) {
            console.error('DB Insert Teacher Error:', dbError);
            // ROLLBACK: Delete the Auth user if DB insert fails
            await adminClient.auth.admin.deleteUser(authUserId);
            return NextResponse.json({ error: 'Teacher creation failed. Database state rolled back.' }, { status: 500 });
        }

        // 5. Insert Audit Log
        await adminClient
            .from('audit_logs')
            .insert({
                action: 'teacher_created',
                entity_type: 'user',
                entity_id: authUserId,
                performed_by: requester.id
            });

        return NextResponse.json({
            success: true,
            email,
            temporary_password: password
        });

    } catch (error: any) {
        console.error('Teacher Create API Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
