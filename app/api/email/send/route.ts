import { Resend } from 'resend';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { getEmailTemplate } from '@/utils/email-templates';
import { EmailRequest } from '@/types/email';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    const supabase = createClient();

    try {
        const body: EmailRequest = await request.json();
        const { email_type, recipient_email, recipient_name, metadata, attachment_url } = body;

        // 1. Validations
        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json({ error: 'Email service configuration error' }, { status: 500 });
        }

        if (!recipient_email || !recipient_name) {
            return NextResponse.json({ error: 'Recipient details incomplete' }, { status: 400 });
        }

        // 2. Generate Template
        const { subject, html } = getEmailTemplate(email_type, metadata);

        // 3. Handle Attachment
        let attachments: any[] = [];
        if (attachment_url) {
            try {
                const response = await fetch(attachment_url);
                if (response.ok) {
                    const buffer = await response.arrayBuffer();
                    attachments = [{
                        filename: `Receipt-${metadata.receipt_number || 'Admission'}.pdf`,
                        content: Buffer.from(buffer)
                    }];
                }
            } catch (err) {
                console.error('Failed to fetch attachment:', err);
                // Continue without attachment if it fails, or handle as error
            }
        }

        // 4. Send Email via Resend
        const { data, error } = await resend.emails.send({
            from: 'Speak Orange Academy <noreply@speakorange.com>',
            to: recipient_email,
            subject: subject,
            html: html,
            attachments: attachments.length > 0 ? attachments : undefined
        });

        // 5. Audit Logging
        await supabase.from('system_logs').insert({
            action_type: error ? 'EMAIL_FAILED' : 'EMAIL_SENT',
            entity_type: 'email',
            entity_id: email_type,
            action_details: {
                to: recipient_email,
                type: email_type,
                resend_id: data?.id,
                error: error?.message
            }
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: data?.id });

    } catch (error: any) {
        console.error('Email API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
