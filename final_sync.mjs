import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalSync() {
    const id = 'f47a59f9-d63c-47a2-b468-ddfb860d3f84';
    
    console.log("🚀 Running Final Authentication Sync...");
    
    // 1. users table - Matches its lowercase check constraint
    const { error: err1 } = await supabase.from('users').update({ 
        role: 'super_admin',
        status: 'Active'
    }).eq('id', id);
    if (err1) console.error("❌ Users table update failed:", err1.message);
    else console.log("✅ Users table: 'super_admin' (lowercase)");

    // 2. admin_users table - Matches its PascalCase ENUM
    const { error: err2 } = await supabase.from('admin_users').update({ 
        role: 'Super Admin',
        is_active: true
    }).eq('admin_id', id);
    if (err2) console.error("❌ Admin_users table update failed:", err2.message);
    else console.log("✅ Admin_users table: 'Super Admin' (PascalCase)");
    
    console.log("\n✨ Database is now in sync with middleware normalization logic.");
}

finalSync();
