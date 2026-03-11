export type EmailType =
    | 'REGISTRATION_CONFIRMATION'
    | 'PAYMENT_SUBMITTED'
    | 'PAYMENT_APPROVED'
    | 'PAYMENT_REJECTED'
    | 'BATCH_ALLOCATED'
    | 'TEACHER_BATCH_ASSIGNED';

export interface EmailMetadata {
    student_name?: string;
    course_name?: string;
    batch_name?: string;
    batch_timing?: string;
    start_date?: string;
    teacher_name?: string;
    amount?: number;
    transaction_id?: string;
    receipt_number?: string;
    rejection_reason?: string;
}

export interface EmailRequest {
    email_type: EmailType;
    recipient_email: string;
    recipient_name: string;
    metadata: EmailMetadata;
    attachment_url?: string;
}
