import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AccessDenied from '@/components/common/access-denied'
import SuperAdminShell from '@/components/super-admin/shell'

import { Providers } from '@/components/providers/query-provider'

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()

    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
        return redirect('/login')
    }

    const role = session.user.app_metadata?.app_role

    if (role !== 'Super Admin') {
        return <AccessDenied />
    }

    // Fetch admin name from DB
    const { data: admin } = await supabase
        .from('admin_users')
        .select('admin_name')
        .eq('admin_id', session.user.id)
        .single()

    return (
        <Providers>
            <SuperAdminShell adminName={admin?.admin_name || 'Super Admin'}>
                {children}
            </SuperAdminShell>
        </Providers>
    )
}
