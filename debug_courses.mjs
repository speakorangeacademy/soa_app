import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCourses() {
    console.log("Checking courses table...");
    const { data, error } = await supabase.from('courses').select('*').limit(1);
    
    if (error) {
        console.error("Query failed:", error.message);
    } else {
        console.log("Success! Row count:", data.length);
        if (data.length > 0) {
            console.log("Columns:", Object.keys(data[0]));
        }
    }
}

checkCourses();
