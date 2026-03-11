import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log("Checking students table columns...");
  const { data, error } = await supabase.from('students').select('*').limit(1);
  if (error) {
     console.error("Query failed:", error);
  } else {
     if (data && data.length > 0) {
        console.log("Columns found via data row:");
        console.log(Object.keys(data[0]));
     } else {
        console.log("Table exists but is empty. Cannot determine columns via simple query. Assuming we need to run student_granular_profile.sql");
     }
  }
}

checkSchema();
