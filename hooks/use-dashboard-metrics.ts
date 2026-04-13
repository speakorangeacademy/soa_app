import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { useEffect } from 'react';

export function useDashboardMetrics() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    // Fetch initial data
    const query = useQuery({
        queryKey: ['dashboard-metrics'],
        queryFn: async () => {
            const res = await fetch('/api/dashboard-metrics');
            if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
            return res.json();
        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5 // 5 minutes, relying on realtime for updates
    });

    // Setup Realtime Subscription
    useEffect(() => {
        const invalidate = () => queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
        const channel = supabase
            .channel('dashboard-metrics-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, invalidate)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'batch_enrollments' }, invalidate)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'batches' }, invalidate)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient, supabase]);

    return query;
}
