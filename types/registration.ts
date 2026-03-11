import { z } from 'zod';

export const studentRegistrationSchema = z.object({
    student_full_name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    parent_name: z.string().trim().min(2, 'Parent name is required'),
    mobile_number: z.string().regex(/^[6-9][0-9]{9}$/, 'Invalid mobile number. Must be 10 digits starting with 6-9'),
    email_address: z.string().trim().email('Invalid email address'),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date of birth'),
    gender: z.enum(['Male', 'Female', 'Other']),
    address: z.string().trim().min(5, 'Address is required (at least 5 characters)'),
    course_id: z.string().uuid('Please select a course'),
    batch_id: z.string().uuid('Please select an available batch'),
});

export type StudentRegistrationFormData = z.infer<typeof studentRegistrationSchema>;
