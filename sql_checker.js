const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log("Checking students table columns...");
  const { data, error } = await supabase.rpc('get_table_columns_by_name', { table_name_input: 'students' });
  
  if (error) {
     console.log("Cannot use RPC. Falling back to simple query.");
     const res2 = await supabase.from('students').select('*').limit(1);
     if (res2.error) {
         console.error("Query failed:", res2.error);
     } else {
         if (res2.data && res2.data.length > 0) {
            console.log("Columns found via data row:");
            console.log(Object.keys(res2.data[0]));
         } else {
            console.log("Table exists but is empty. Cannot determine columns via simple query.");
         }
     }
  } else {
      console.log(data);
  }
}

checkSchema();
