import { z } from 'zod';

export const studentProfileSchema = z.object({
    first_name: z.string().trim().min(2, 'First name is required'),
    last_name: z.string().trim().min(2, 'Last name is required'),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date of birth'),
    gender: z.enum(['Male', 'Female', 'Other']),
    parent_name: z.string().trim().min(2, 'Parent/Guardian name is required'),
    parent_phone: z.string().regex(/^[0-9]{10,15}$/, 'Parent phone must be 10-15 digits'),
    alternate_phone: z.string().regex(/^[0-9]{10,15}$/, 'Alternate phone must be 10-15 digits').optional().or(z.literal('')),
    email: z.string().trim().email('Invalid email address').max(255),
    address_line_1: z.string().trim().min(5, 'Address Line 1 is required'),
    address_line_2: z.string().trim().optional().or(z.literal('')),
    city: z.string().trim().min(2, 'City is required'),
    state: z.string().trim().min(2, 'State is required'),
    pincode: z.string().regex(/^\d{5,6}$/, 'Pincode must be 5-6 digits'),
    notes: z.string().trim().optional().or(z.literal('')),
});

export type StudentProfileData = z.infer<typeof studentProfileSchema>;

export interface StudentProfileFull extends StudentProfileData {
    student_id: string;
    enrollment_status?: string;
    admission_date?: string;
    course_name?: string;
    batch_name?: string;
}
