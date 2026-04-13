import CoursePage from '@/components/super-admin/course-page';

// Auth & role check handled by middleware — no server-side auth call needed
export default function CoursesPage() {
    return <CoursePage role="Super Admin" />;
}
