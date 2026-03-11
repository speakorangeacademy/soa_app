import { z } from 'zod';

export const paymentSubmissionSchema = z.object({
    student_id: z.string().uuid(),
    course_id: z.string().uuid(),
    batch_id: z.string().uuid(),
    transaction_id: z.string().trim().min(5, 'Transaction ID must be at least 5 characters'),
    payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    payment_method: z.enum(['UPI', 'Bank Transfer']),
    upload_failed: z.boolean().optional(),
}).refine((data) => {
    const selectedDate = new Date(data.payment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate <= today;
}, {
    message: "Payment date cannot be in the future",
    path: ["payment_date"]
});

export type PaymentSubmissionFormData = z.infer<typeof paymentSubmissionSchema>;

export interface PaymentSummary {
    course_name: string;
    total_fee: number;
    batch_name: string;
    active_qr: {
        public_url: string;
        qr_label: string;
    } | null;
}
