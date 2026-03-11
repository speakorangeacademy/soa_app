'use server'

import { createClient } from '@/utils/supabase/server'
import { signupSchema, loginSchema, SignupInput, LoginInput } from '@/lib/validations'
import { redirect } from 'next/navigation'

export async function studentSignup(data: SignupInput) {
    const validatedFields = signupSchema.safeParse(data)

    if (!validatedFields.success) {
        return { error: 'Invalid form data.' }
    }

    const { email, password, full_name, phone } = validatedFields.data
    const supabase = createClient()

    // 1. Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name,
                phone,
                role: 'student'
            }
        }
    })

    if (authError) {
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: 'Signup failed. Please try again.' }
    }

    // 2. Create student profile in the students table
    // We split full_name into first_name and last_name for the granular profile table
    const nameParts = full_name.trim().split(/\s+/)
    const first_name = nameParts[0]
    const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

    const { error: profileError } = await supabase
        .from('students')
        .insert({
            student_id: authData.user.id,
            first_name,
            last_name,
            student_full_name: full_name,
            email_address: email,
            mobile_number: phone,
            is_active: true,
            created_at: new Date().toISOString()
        })

    if (profileError) {
        console.error('Profile creation error:', profileError)
        // Note: Auth user is created but profile failed. 
        // In a production app, you might want to handle this rollup or use a trigger.
        return { error: 'Account created but profile setup failed. Please contact support.' }
    }

    return { success: true }
}

export async function studentLogin(data: LoginInput) {
    const validatedFields = loginSchema.safeParse(data)

    if (!validatedFields.success) {
        return { error: 'Invalid login data.' }
    }

    const { email, password } = validatedFields.data
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        if (error.message === 'Invalid login credentials') {
            return { error: 'Incorrect email or password.' }
        }
        return { error: error.message }
    }

    redirect('/student/dashboard')
}
