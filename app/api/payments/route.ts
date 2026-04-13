import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';
import { paymentSubmissionSchema } from '@/types/payment';

async function sendEmail(payload: any) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await fetch(`${baseUrl}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error('Email trigger failed:', err);
    }
}

export async function POST(request: Request) {
    const supabase = createAdminClient();

    try {
        const formData = await request.formData();

        // Extract fields
        const student_id = formData.get('student_id') as string;
        const course_id = formData.get('course_id') as string;
        const batch_id = formData.get('batch_id') as string;
        const transaction_id = formData.get('transaction_id') as string;
        const payment_date = formData.get('payment_date') as string;
        const payment_method = formData.get('payment_method') as string;
        const upload_failed = formData.get('upload_failed') === 'true';
        const pre_uploaded_path = formData.get('screenshot_path') as string | null;
        const file = formData.get('screenshot') as File | null;

        // 1. Zod Validation
        const validatedData = paymentSubmissionSchema.parse({
            student_id,
            course_id,
            batch_id,
            transaction_id,
            payment_date,
            payment_method,
            upload_failed
        });

        if (!file && !upload_failed && !pre_uploaded_path) {
            return NextResponse.json({ error: 'Payment screenshot is required' }, { status: 400 });
        }

        // File type and size validation
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json({ error: 'Only JPG, PNG, or WEBP files are allowed' }, { status: 400 });
            }
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json({ error: 'Screenshot must be under 5MB' }, { status: 400 });
            }
        }

        // 2. Business Validations
        // Check student
        const { data: student } = await supabase
            .from('students')
            .select('student_id, student_full_name, email_address')
            .eq('student_id', student_id)
            .single();

        if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

        // Check batch and get fee
        const { data: batchData } = await supabase
            .from('batches')
            .select('batch_status, courses(total_fee)')
            .eq('batch_id', batch_id)
            .single();

        if (!batchData) return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
        const fee_amount = (batchData as any).courses.total_fee;

        if (batchData.batch_status !== 'Open') {
            return NextResponse.json({ error: 'This batch is no longer accepting payments' }, { status: 400 });
        }

        // 3. Prevent duplicate pending payments for same student + batch
        const { data: existingPayment } = await supabase
            .from('payments')
            .select('payment_id')
            .eq('student_id', student_id)
            .eq('batch_id', batch_id)
            .eq('verification_status', 'Pending')
            .maybeSingle();

        if (existingPayment) {
            return NextResponse.json({ error: 'Payment already submitted and awaiting verification' }, { status: 400 });
        }

        // 4. Upload Screenshot (if not failed and not already uploaded)
        const paymentId = crypto.randomUUID();
        let path = pre_uploaded_path || null;

        if (!path && file && !upload_failed) {
            const extension = file.name.split('.').pop();
            path = `${student_id}/${paymentId}.${extension}`;

            const { error: uploadError } = await supabase.storage
                .from('payment-screenshots')
                .upload(path, file, { upsert: false });

            if (uploadError) {
                return NextResponse.json({ error: 'Unable to upload screenshot' }, { status: 500 });
            }
        }

        // 5. Insert Payment Record
        const { data: payment, error: dbError } = await supabase
            .from('payments')
            .insert({
                payment_id: paymentId,
                student_id,
                course_id,
                batch_id,
                fee_amount,
                payment_method,
                transaction_id,
                payment_screenshot_path: path,
                payment_date,
                verification_status: 'Pending',
                upload_failed
            })
            .select()
            .single();

        if (dbError) {
            // Cleanup storage if upload succeeded in THIS request but DB insert failed
            if (path && !pre_uploaded_path) {
                await supabase.storage.from('payment-screenshots').remove([path]);
            }
            return NextResponse.json({ error: 'Unable to submit payment record' }, { status: 500 });
        }

        // 6. Automation: Log to system_logs and trigger email
        await supabase.from('system_logs').insert({
            action_type: 'NEW_PAYMENT_SUBMITTED',
            entity_type: 'payment',
            entity_id: paymentId,
            action_details: {
                student_id,
                amount: fee_amount,
                transaction_id
            }
        });

        sendEmail({
            email_type: 'PAYMENT_SUBMITTED',
            recipient_email: student.email_address,
            recipient_name: student.student_full_name,
            metadata: {
                student_name: student.student_full_name,
                amount: fee_amount,
                transaction_id: transaction_id
            }
        });

        return NextResponse.json({ success: true, payment_id: paymentId });

    } catch (error: any) {
        if (error.errors) return NextResponse.json({ error: error.errors }, { status: 400 });
        return NextResponse.json({ error: error.message || 'Payment submission failed' }, { status: 500 });
    }
}
