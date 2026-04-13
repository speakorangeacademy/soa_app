import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { ReceiptDocument } from '@/components/pdf/receipt-document';
import React from 'react';
import { withAuditLogging } from '@/utils/audit-logger';

async function generateReceiptHandler(request: Request) {
    const supabase = createClient();

    try {
        const { payment_id } = await request.json();

        if (!payment_id) {
            return NextResponse.json({ error: 'payment_id is required' }, { status: 400 });
        }

        // 1. Fetch Payment with all relations
        const { data: payment, error: pError } = await supabase
            .from('payments')
            .select(`
        *,
        student:students(*),
        course:courses(*),
        batch:batches(*)
      `)
            .eq('payment_id', payment_id)
            .single();

        if (pError || !payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        if (payment.verification_status !== 'Approved') {
            return NextResponse.json({ error: 'Receipt can only be generated for approved payments' }, { status: 400 });
        }

        // 2. Check if receipt already exists
        const { data: existingReceipt } = await supabase
            .from('receipts')
            .select('receipt_number, receipt_pdf_path, receipt_id')
            .eq('payment_id', payment_id)
            .maybeSingle();

        let receiptNumber = existingReceipt?.receipt_number;
        let receiptId = existingReceipt?.receipt_id;

        // 3. Generate Receipt Number if not exists
        if (!receiptNumber) {
            // Use the new atomic sequential generator
            const { data: generatedNumber, error: rpcError } = await supabase.rpc('generate_receipt_number');

            if (rpcError || !generatedNumber) {
                console.error('Failed to generate atomic receipt number:', rpcError);
                // Fallback or error
                return NextResponse.json({ error: 'Unable to generate receipt number. Please try again.' }, { status: 500 });
            }
            receiptNumber = generatedNumber;
        }

        // 4. Generate PDF Buffer
        const pdfBuffer = await renderToBuffer(
            <ReceiptDocument
                receiptNumber={receiptNumber}
                date={new Date().toLocaleDateString('en-IN')}
                student={{
                    name: (payment as any).student.student_full_name,
                    parentName: (payment as any).student.parent_name,
                    email: (payment as any).student.email_address,
                    mobile: (payment as any).student.mobile_number,
                }}
                course={{
                    name: (payment as any).course.course_name,
                    level: (payment as any).course.course_level,
                    language: (payment as any).course.language,
                }}
                batch={{
                    name: (payment as any).batch.batch_name,
                    timing: (payment as any).batch.batch_timing,
                    startDate: (payment as any).batch.start_date,
                    endDate: (payment as any).batch.end_date,
                }}
                payment={{
                    amount: payment.fee_amount,
                    transactionId: payment.transaction_id,
                    method: payment.payment_method,
                    paymentDate: payment.payment_date,
                }}
            />
        );

        // 5. Upload to Supabase Storage
        const fileName = `receipt_${receiptNumber.replace(/\//g, '_')}.pdf`;
        const storagePath = `receipts/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('receipts')
            .upload(storagePath, pdfBuffer, {
                contentType: 'application/pdf',
                upsert: true
            });

        if (uploadError) {
            throw new Error(`Failed to upload receipt PDF: ${uploadError.message}`);
        }

        const publicUrl = supabase.storage.from('receipts').getPublicUrl(storagePath).data.publicUrl;

        // 6. Update/Create Receipt Record
        if (existingReceipt) {
            await supabase
                .from('receipts')
                .update({
                    receipt_pdf_path: storagePath,
                    updated_at: new Date().toISOString()
                })
                .eq('payment_id', payment_id);
        } else {
            const { data: newReceipt, error: insertError } = await supabase
                .from('receipts')
                .insert({
                    receipt_number: receiptNumber,
                    student_id: payment.student_id,
                    payment_id: payment.payment_id,
                    course_name: (payment as any).course.course_name,
                    batch_name: (payment as any).batch.batch_name,
                    amount_paid: payment.fee_amount,
                    payment_date: payment.payment_date,
                    receipt_generation_date: new Date().toISOString(),
                    receipt_pdf_path: storagePath
                })
                .select()
                .single();

            if (insertError || !newReceipt) {
                console.error('Receipt insert failed:', insertError);
                return NextResponse.json({ error: 'Failed to save receipt record.' }, { status: 500 });
            }
            receiptId = newReceipt.receipt_id;
        }

        return NextResponse.json({
            success: true,
            receipt_id: receiptId,
            receipt_number: receiptNumber,
            payment_id: payment_id,
            receipt_url: publicUrl
        });

    } catch (error: any) {
        console.error('Receipt Generation Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

export const POST = withAuditLogging(generateReceiptHandler, {
    actionType: 'RECEIPT_GENERATED',
    entityType: 'receipt',
    entityIdResolver: (req, result) => result.receipt_id,
    detailsResolver: (req, result) => ({
        receipt_number: result.receipt_number,
        payment_id: result.payment_id
    })
});
