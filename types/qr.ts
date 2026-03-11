import { z } from 'zod';

export const qrSchema = z.object({
    qr_label: z.string().trim().min(3, 'Label must be at least 3 characters'),
});

export type QrFormData = z.infer<typeof qrSchema>;

export interface QrCode {
    qr_id: string;
    qr_image_path: string;
    qr_label: string;
    is_active: boolean;
    uploaded_by: string;
    uploaded_at: string;
    updated_at: string;
    public_url?: string;
}
