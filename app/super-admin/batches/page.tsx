import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import BatchPage from '@/components/super-admin/batch-page';

export default async function BatchesPage() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    const role = session.user.app_metadata?.app_role;

    // Only Super Admin can manage batches
    if (role !== 'Super Admin') {
        redirect('/super-admin/dashboard'); // Or 403 page
    }

    return (
        <BatchPage />
    );
}
