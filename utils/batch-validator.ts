import { createAdminClient } from '@/utils/supabase/admin';

/**
 * Validates if a batch has available capacity and is open for enrollment.
 * @param batchId Unique identifier for the batch (UUID)
 * @returns Object indicating if the operation is allowed and a reason if blocked.
 */
export async function validateBatchCapacity(batchId: string): Promise<{
    allowed: boolean;
    reason?: string
}> {
    // 1. Basic Validation
    if (!batchId) {
        return { allowed: false, reason: 'Batch ID is required.' };
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(batchId)) {
        return { allowed: false, reason: 'Invalid batch ID.' };
    }

    const supabase = createAdminClient();

    try {
        // 2. Fetch Batch Metadata
        const { data: batch, error } = await supabase
            .from('batches')
            .select('batch_id, current_enrollment_count, max_capacity, batch_status')
            .eq('batch_id', batchId)
            .maybeSingle();

        if (error) {
            console.error('Batch capacity validation error:', error);
            return { allowed: false, reason: 'Unable to validate batch capacity. Please try again.' };
        }

        if (!batch) {
            return { allowed: false, reason: 'Selected batch does not exist.' };
        }

        // 3. Status Rule
        if (batch.batch_status === 'Full') {
            return { allowed: false, reason: 'This batch is full. Please select another batch.' };
        }

        // 4. Capacity rules
        if (batch.max_capacity <= 0) {
            return { allowed: false, reason: 'Batch capacity configuration error.' };
        }

        if (batch.current_enrollment_count < 0) {
            return { allowed: false, reason: 'Batch capacity configuration error.' };
        }

        if (batch.current_enrollment_count >= batch.max_capacity) {
            return { allowed: false, reason: 'This batch is full. Please select another batch.' };
        }

        // 5. Success
        return { allowed: true };

    } catch (error) {
        console.error('Unexpected error during batch validation:', error);
        return { allowed: false, reason: 'Internal server error during batch validation.' };
    }
}
