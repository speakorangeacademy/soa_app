import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    const id = 'f47a59f9-d63c-47a2-b468-ddfb860d3f84';
    
    console.log("--- Users table ---");
    const { data: user } = await supabase.from('users').select('*').eq('id', id).single();
    console.log(user);
    
    console.log("--- Admin_users table ---");
    const { data: admin } = await supabase.from('admin_users').select('*').eq('admin_id', id).single();
    console.log(admin);
}

checkUser();
