-- RPC to handle student re-allocation between batches atomically
CREATE OR REPLACE FUNCTION reallocate_student_batch(
    p_student_id UUID,
    p_old_batch_id UUID,
    p_new_batch_id UUID,
    p_reason TEXT
) RETURNS JSONB AS $$
DECLARE
    v_enrollment_id UUID;
BEGIN
    -- 1. Check if student is enrolled in the old batch
    SELECT enrollment_id INTO v_enrollment_id
    FROM batch_enrollments
    WHERE student_id = p_student_id AND batch_id = p_old_batch_id AND allocation_status = 'Active';

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Student is not actively enrolled in the source batch.');
    END IF;

    -- 2. Check if new batch has capacity
    IF EXISTS (
        SELECT 1 FROM batches 
        WHERE batch_id = p_new_batch_id AND current_enrollment_count >= max_capacity
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Target batch is at full capacity.');
    END IF;

    -- 3. Update Batch Enrollments
    UPDATE batch_enrollments
    SET 
        batch_id = p_new_batch_id,
        updated_at = NOW(),
        allocation_status = 'Active' -- Ensure it's active
    WHERE enrollment_id = v_enrollment_id;

    -- 4. Decrement old batch count
    UPDATE batches
    SET current_enrollment_count = current_enrollment_count - 1
    WHERE batch_id = p_old_batch_id;

    -- 5. Increment new batch count
    UPDATE batches
    SET current_enrollment_count = current_enrollment_count + 1
    WHERE batch_id = p_new_batch_id;

    RETURN jsonb_build_object(
        'success', true, 
        'enrollment_id', v_enrollment_id,
        'message', 'Student successfully re-allocated.'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
