import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { withAuditLogging } from '@/utils/audit-logger';

/**
 * Super Admin: Cancel Receipt API
 * Marks a receipt as cancelled, records metadata, and logs to audit_logs.
 */
async function cancelReceiptHandler(
    request: Request,
    { params }: { params: { receiptId: string } }
) {
    const { receiptId } = params;
    const supabase = createClient();

    try {
        const { reason } = await request.json();
        if (!reason || reason.trim().length < 5) {
            return NextResponse.json({ error: 'Valid cancellation reason required (min 5 chars).' }, { status: 400 });
        }

        // 1. Fetch Receipt to verify existence and get metadata
        const { data: receipt, error: fetchError } = await supabase
            .from('receipts')
            .select('receipt_id, receipt_number, payment_id, status')
            .eq('receipt_id', receiptId)
            .single();

        if (fetchError || !receipt) {
            return NextResponse.json({ error: 'Receipt not found.' }, { status: 404 });
        }

        if (receipt.status === 'Cancelled') {
            return NextResponse.json({ error: 'Receipt is already cancelled.' }, { status: 400 });
        }

        // 2. Atomic Update
        const { data: { user } } = await supabase.auth.getUser();
        const { error: updateError } = await supabase
            .from('receipts')
            .update({
                status: 'Cancelled',
                cancellation_reason: reason.trim(),
                cancelled_by: user?.id,
                cancelled_at: new Date().toISOString()
            })
            .eq('receipt_id', receiptId);

        if (updateError) {
            console.error('Update Receipt Error:', updateError);
            throw new Error('Failed to update receipt status.');
        }

        return NextResponse.json({
            success: true,
            receipt_id: receiptId,
            receipt_number: receipt.receipt_number,
            reason: reason.trim()
        });

    } catch (error: any) {
        console.error('Receipt Cancellation API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
    }
}

export const POST = withAuditLogging(cancelReceiptHandler, {
    actionType: 'RECEIPT_CANCELLED',
    entityType: 'receipt',
    entityIdResolver: (req, result) => result.receipt_id,
    detailsResolver: (req, result) => ({
        receipt_number: result.receipt_number,
        reason: result.reason
    })
});
