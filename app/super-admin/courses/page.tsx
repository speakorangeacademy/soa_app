import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CoursePage from '@/components/super-admin/course-page';

export default async function CoursesPage() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    const role = session.user.app_metadata?.app_role;

    // Only Super Admin and Admin can access this page
    if (role !== 'Super Admin' && role !== 'Admin') {
        redirect('/login'); // Or a specific 403 page if preferred, but dashboard layout handles it too
    }

    return (
        <CoursePage role={role} />
    );
}
