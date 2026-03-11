import { createClient } from '@supabase/supabase-js'

/**
 * Administrative Supabase client using the Service Role Key.
 * Use this ONLY for server-side operations that require bypassing RLS
 * or performed administrative actions like creating users.
 */
export const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase admin environment variables')
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
