import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUser() {
    const id = 'f47a59f9-d63c-47a2-b468-ddfb860d3f84';
    
    console.log("Fixing roles to match database ENUMS...");
    
    // 1. Fix public.users
    const { error: err1 } = await supabase.from('users').update({ 
        role: 'Super Admin',
        status: 'Active'
    }).eq('id', id);
    if (err1) console.error("Error updating users:", err1.message);
    else console.log("Updated users table to 'Super Admin'");

    // 2. Fix public.admin_users
    const { error: err2 } = await supabase.from('admin_users').update({ 
        role: 'Super Admin',
        is_active: true
    }).eq('admin_id', id);
    if (err2) console.error("Error updating admin_users:", err2.message);
    else console.log("Updated admin_users table to 'Super Admin'");
}

fixUser();
