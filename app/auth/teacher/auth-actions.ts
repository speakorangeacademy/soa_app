'use server'

import { createClient } from '@/utils/supabase/server'
import { loginSchema, LoginInput } from '@/lib/validations'
import { redirect } from 'next/navigation'

export async function teacherLogin(data: LoginInput) {
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

    // 2. Verify teacher status in teachers table
    const { data: teacherRecord, error: dbError } = await supabase
        .from('teachers')
        .select('is_active, is_first_login')
        .eq('teacher_id', authData.user.id)
        .single()

    if (dbError || !teacherRecord) {
        // Not a teacher account - logout immediately
        await supabase.auth.signOut()
        return { error: 'You do not have teacher access.' }
    }

    if (!teacherRecord.is_active) {
        await supabase.auth.signOut()
        return { error: 'Your account is inactive. Please contact Admin.' }
    }

    // 3. Redirection logic based on first login
    if (teacherRecord.is_first_login) {
        redirect('/teacher/force-password-change')
    } else {
        redirect('/teacher/dashboard')
    }
}
