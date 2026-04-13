import BatchPage from '@/components/super-admin/batch-page';

// Auth & role check handled by middleware — no server-side auth call needed
export default function BatchesPage() {
    return <BatchPage />;
}
