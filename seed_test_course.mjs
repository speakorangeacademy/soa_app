import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedCourse() {
    console.log("Seeding a test course...");
    const { data, error } = await supabase.from('courses').insert({
        course_name: 'Public Speaking 101',
        course_level: 'Beginner',
        language: 'English',
        total_fee: 5000,
        course_status: 'Active'
    }).select();

    if (error) console.error("Error seeding:", error.message);
    else console.log("Seeded successfully:", data);
}

seedCourse();
