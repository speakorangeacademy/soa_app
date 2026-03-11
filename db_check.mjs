import { createClient } from './utils/supabase/server.js'

async function checkAdmin() {
    const supabase = createClient()
    const email = 'speakorangeacademy@gmail.com'
    
    console.log(`Checking for admin: ${email}`)
    
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
    
    if (userError) console.error('Users table error:', userError.message)
    else console.log('Found in users table:', user)
    
    const { data: admin, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single()
    
    if (adminError) console.error('Admin_users table error:', adminError.message)
    else console.log('Found in admin_users table:', admin)
    
    const { data: auth, error: authError } = await supabase.auth.admin.getUserById('f47a59f9-d63c-47a2-b468-ddfb860d3f84')
    if (authError) console.error('Auth check error:', authError.message)
    else console.log('Found in Auth:', auth.user.email)
}

checkAdmin()
