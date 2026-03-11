import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data: rows } = await supabase.from('courses').select('*').limit(0); 
    // This won't give column info if empty. 
    // Let's try to fetch from information_schema via a new SQL script if I can't find it here.
    
    // Actually, let's just try to insert with what we THINK are the columns.
    console.log("Checking columns via rpc or select...");
    const { error: err } = await supabase.from('courses').select('course_duration').limit(1);
    if (err) console.log("course_duration selection failed:", err.message);
    else console.log("course_duration exists.");
}

checkSchema();
