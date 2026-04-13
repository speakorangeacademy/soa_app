'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const identifier = formData.get('identifier') as string
    const password = formData.get('password') as string
    console.log(`[AUTH] Login attempt for: ${identifier}`)
    const supabase = createClient()

    let email = identifier

    // Check if identifier is a mobile number (any 10-digit number)
    const isMobile = /^\d{10}$/.test(identifier)

    if (isMobile) {
        // Search for the email associated with this mobile number across all 3 user tables
        const { data: admin } = await supabase
            .from('admin_users')
            .select('email')
            .eq('mobile_number', identifier)
            .single()

        if (admin) {
            email = admin.email
        } else {
            const { data: teacher } = await supabase
                .from('teachers')
                .select('email')
                .eq('mobile_number', identifier)
                .single()

            if (teacher) {
                email = teacher.email
            } else {
                const { data: student } = await supabase
                    .from('students')
                    .select('email_address')
                    .eq('mobile_number', identifier)
                    .single()

                if (student?.email_address) {
                    email = student.email_address
                } else {
                    return { error: 'Mobile number not registered.' }
                }
            }
        }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.log(`[AUTH] Auth error for ${email}: ${error.message}`)
        return { error: 'Invalid email/mobile or password.' }
    }

    const userId = data.user.id
    console.log(`[AUTH] Authenticated as User ID: ${userId}`)

    // Fetch unified user record
    const { data: appUser, error: dbError } = await supabase
        .from('users')
        .select('role, status, is_first_login')
        .eq('id', userId)
        .single()
    
    if (dbError) console.log(`[AUTH] Database role check error: ${dbError.message}`)
    if (appUser) console.log(`[AUTH] Found app user with role: ${appUser.role}`)

    if (dbError || !appUser) {
        // Fallback for students or existing records not in 'users' table yet
        // Try students table if it exists
        const { data: studentUser } = await supabase
            .from('students')
            .select('is_active')
            .eq('student_id', userId)
            .single()

        if (studentUser) {
            if (!studentUser.is_active) return { error: 'Your account is currently inactive.' }
            return redirect('/student/dashboard')
        }

        return { error: 'Account not found in system records. Please contact support.' }
    }

    if (appUser.status !== 'Active') {
        return { error: 'Your account is currently inactive. Please contact administration.' }
    }

    // Role-based redirection - Handle database Enum values case-insensitively
    const rawRole = appUser.role || ''
    const role = rawRole.toLowerCase().replace(/\s+/g, '_')
    console.log(`[AUTH] Resolving destination for raw role: "${rawRole}" -> normalized: "${role}"`)

    if (role === 'teacher') {
        if (appUser.is_first_login) {
            return redirect('/teacher/change-password')
        }
        return redirect('/teacher/dashboard')
    }

    if (role === 'admin' || role === 'super_admin') {
        const dest = role === 'super_admin' ? '/super-admin/dashboard' : '/admin/dashboard'
        console.log(`[AUTH] Redirecting Admin to: ${dest}`)
        return redirect(dest)
    }

    if (role === 'student') {
        return redirect('/student/dashboard')
    }

    return { error: 'Unauthorized access role.' }
}

export async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    return redirect('/login')
}

export async function resetPassword(formData: FormData): Promise<{ success: string; error?: string }> {
    const email = formData.get('email') as string
    const supabase = createClient()

    // redirectTo must be configured in Supabase Auth to allow this URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    })

    if (error) {
        console.error('Reset password error:', error.message)
        // Return same success message to prevent user enumeration
        return { success: 'If an account exists for this email, a reset link has been sent.' }
    }

    return { success: 'If an account exists for this email, a reset link has been sent.' }
}

export async function updatePassword(formData: FormData): Promise<{ success?: boolean; error?: string }> {
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const supabase = createClient()

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match.' }
    }

    // Password strength validation: min 8 chars, 1 upper, 1 lower, 1 number, 1 special
    const strengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!strengthRegex.test(password)) {
        return { error: 'Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters.' }
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        return { error: error.message }
    }

    // After success, we can redirect to login
    return { success: true }
}

export async function updateTeacherPassword(formData: FormData) {
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const supabase = createClient()

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match.' }
    }

    if (password.length < 8) {
        return { error: 'Password must be at least 8 characters.' }
    }

    const { error: authError } = await supabase.auth.updateUser({ password })

    if (authError) {
        return { error: authError.message }
    }

    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Session expired. Please login again.' }

    // Update both tables atomically:
    // 1. users.is_first_login — this is what the login action checks on every sign-in
    // 2. teachers.is_first_login — kept in sync for the teacher profile record
    const [{ error: usersError }, { error: teachersError }] = await Promise.all([
        supabase
            .from('users')
            .update({ is_first_login: false })
            .eq('id', user.id),
        supabase
            .from('teachers')
            .update({ is_first_login: false, updated_at: new Date() })
            .eq('teacher_id', user.id),
    ])

    if (usersError || teachersError) {
        console.error('[AUTH] Failed to clear is_first_login:', usersError?.message, teachersError?.message)
        return { error: 'Failed to update account status.' }
    }

    return redirect('/teacher/dashboard')
}

function redirectBasedOnRole(role: string) {
    switch (role) {
        case 'Super Admin':
            return redirect('/super-admin/dashboard')
        case 'Admin':
            return redirect('/admin/dashboard')
        case 'Teacher':
            return redirect('/teacher/dashboard')
        case 'Student':
            return redirect('/student/dashboard')
        default:
            return redirect('/login')
    }
}
