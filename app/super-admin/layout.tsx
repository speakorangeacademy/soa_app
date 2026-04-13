import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AccessDenied from '@/components/common/access-denied'
import SuperAdminShell from '@/components/super-admin/shell'
import { Providers } from '@/components/providers/query-provider'
import { cache } from 'react'
import { createAdminClient } from '@/utils/supabase/admin'

// Cached per-request so repeated calls within one navigation share the result
const getAdminName = cache(async (userId: string): Promise<string> => {
    const adminClient = createAdminClient()
    const { data } = await adminClient
        .from('admin_users')
        .select('admin_name')
        .eq('admin_id', userId)
        .single()
    return data?.admin_name || 'Super Admin'
})

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        return redirect('/login')
    }

    const role = session.user.app_metadata?.app_role
    if (role !== 'Super Admin') {
        return <AccessDenied />
    }

    const adminName = await getAdminName(session.user.id)

    return (
        <Providers>
            <SuperAdminShell adminName={adminName}>
                {children}
            </SuperAdminShell>
        </Providers>
    )
}
