import { z } from 'zod';

export const courseSchema = z.object({
    course_name: z.string().trim().min(2, 'Course name must be at least 2 characters'),
    course_level: z.string().trim().min(1, 'Course level is required'),
    language: z.string().trim().min(1, 'Language is required'),
    course_description: z.string().trim().optional(),
    course_duration: z.string().trim().min(1, 'Duration is required'),
    total_fee: z.coerce.number().positive('Total fee must be greater than zero').multipleOf(0.01, 'Maximum 2 decimal places allowed'),
    mode: z.enum(['Online', 'Offline', 'Hybrid']),
    course_status: z.enum(['Active', 'Inactive']),
});

export type CourseFormData = z.infer<typeof courseSchema>;

export type Course = CourseFormData & {
    course_id: string;
    created_at: string;
    updated_at: string;
    created_by: string;
};
