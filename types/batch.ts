import { z } from 'zod';

export const batchSchema = z.object({
    batch_name: z.string().trim().min(2, 'Batch name must be at least 2 characters'),
    course_id: z.string().uuid('Please select a valid course'),
    teacher_id: z.string().uuid('Please select a valid teacher').nullable().optional(),
    batch_timing: z.string().trim().min(1, 'Batch timing is required'),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format'),
    max_capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1').max(100, 'Capacity cannot exceed 100'),
}).refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: "End date must be after start date",
    path: ["end_date"],
});

export type BatchFormData = z.infer<typeof batchSchema>;

export interface Batch extends BatchFormData {
    batch_id: string;
    course_name?: string;
    teacher_name?: string;
    current_enrollment_count: number;
    batch_status: 'Open' | 'Full' | 'Closed';
    created_at: string;
    updated_at: string;
}
