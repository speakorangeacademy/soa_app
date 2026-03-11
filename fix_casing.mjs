import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserCasing() {
    const id = 'f47a59f9-d63c-47a2-b468-ddfb860d3f84';
    
    console.log("Synchronizing roles to lowercase 'super_admin'...");
    
    // 1. users table (lowercase is required by check constraint)
    const { error: err1 } = await supabase.from('users').update({ 
        role: 'super_admin',
        status: 'Active'
    }).eq('id', id);
    if (err1) console.error("Error updating users:", err1.message);
    else console.log("Success: users table set to 'super_admin'");

    // 2. admin_users table (must match users table for middleware to be fast)
    const { error: err2 } = await supabase.from('admin_users').update({ 
        role: 'super_admin',
        is_active: true
    }).eq('admin_id', id);
    if (err2) console.error("Error updating admin_users:", err2.message);
    else console.log("Success: admin_users table set to 'super_admin'");
}

fixUserCasing();
