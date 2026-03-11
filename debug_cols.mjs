import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCols() {
    const cols = ['course_id', 'course_name', 'course_level', 'language', 'total_fee'];
    for (const col of cols) {
        const { error } = await supabase.from('courses').select(col).limit(1);
        if (error) {
            console.log(`Column ${col} is MISSING: ${error.message}`);
        } else {
            console.log(`Column ${col} exists.`);
        }
    }
}

checkCols();
