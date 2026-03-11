import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'courses' });
    if (error) {
        // Fallback: try a query that will fail if regular columns don't exist
        console.log("RPC failed, trying raw query...");
        const { error: err2 } = await supabase.from('courses').select('course_status').limit(1);
        if (err2) console.log("Error selecting course_status:", err2.message);
        else console.log("course_status exists.");
    } else {
        console.log("Columns:", data);
    }
}

checkSchema();
