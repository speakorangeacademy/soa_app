import { z } from 'zod';

export interface PaymentWithDetails {
    payment_id: string;
    student_id: string;
    course_id: string;
    batch_id: string;
    fee_amount: number;
    payment_method: string;
    transaction_id: string;
    payment_screenshot_path: string;
    payment_date: string;
    submission_timestamp: string;
    verification_status: 'Pending' | 'Approved' | 'Rejected';
    upload_failed?: boolean;
    rejection_remarks?: string;
    reupload_allowed?: boolean;
    student_full_name: string;
    email_address: string;
    course_name: string;
    batch_name: string;
    screenshot_url?: string;
}

export const rejectionSchema = z.object({
    rejection_reason: z.string().trim().min(10, 'Please provide a reason (min 10 characters)'),
    allow_reupload: z.boolean().default(true),
});

export type RejectionFormData = z.infer<typeof rejectionSchema>;
