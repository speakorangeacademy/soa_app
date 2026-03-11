'use server'

import { createClient } from '@/utils/supabase/server'
import { loginSchema, LoginInput } from '@/lib/validations'
import { redirect } from 'next/navigation'

export async function adminLogin(data: LoginInput) {
    const validatedFields = loginSchema.safeParse(data)

    if (!validatedFields.success) {
        return { error: 'Invalid login data.' }
    }

    const { email, password } = validatedFields.data
    const supabase = createClient()

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (authError) {
        if (authError.message === 'Invalid login credentials') {
            return { error: 'Incorrect email or password.' }
        }
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: 'Authentication failed. Please try again.' }
    }

    // 2. Verify admin role in admin_users table
    const { data: adminRecord, error: dbError } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('email', email)
        .single()

    if (dbError || !adminRecord) {
        // Not an admin account - logout immediately
        await supabase.auth.signOut()
        return { error: 'You do not have admin access.' }
    }

    if (!adminRecord.is_active) {
        await supabase.auth.signOut()
        return { error: 'Your admin account is inactive. Please contact Super Admin.' }
    }

    // 3. Role-based redirection
    if (adminRecord.role === 'super_admin') {
        redirect('/super-admin/dashboard')
    } else if (adminRecord.role === 'admin') {
        redirect('/admin/dashboard')
    } else {
        await supabase.auth.signOut()
        return { error: 'Access denied.' }
    }
}
