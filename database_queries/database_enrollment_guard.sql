-- Function to validate batch capacity before enrollment
-- Uses a live COUNT(*) on batch_enrollments (not the denormalized current_enrollment_count column)
-- while holding a FOR UPDATE lock on the parent batch row, so the read and the
-- upcoming write are atomic. No concurrent transaction can pass this point for
-- the same batch_id until the current one commits, eliminating the stale-read
-- race condition where two simultaneous approvals could both see count < max_capacity.
CREATE OR REPLACE FUNCTION check_batch_capacity_before_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_status TEXT;
    v_max_capacity INTEGER;
    v_live_count INTEGER;
BEGIN
    -- 1. Lock the batch row for the duration of this transaction.
    --    Any concurrent insert for the same batch_id will block here until
    --    the current transaction commits, ensuring the live count below is
    --    always read after the previous enrollment has been fully persisted.
    SELECT batch_status, max_capacity
    INTO v_status, v_max_capacity
    FROM batches
    WHERE batch_id = NEW.batch_id
    FOR UPDATE;

    -- 2. Validate batch existence
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Selected batch does not exist.';
    END IF;

    -- 3. Validate batch status
    IF v_status = 'Full' THEN
        RAISE EXCEPTION 'This batch is already full. Please select another batch.';
    END IF;

    -- 4. Safety validation (max_capacity must be > 0)
    IF v_max_capacity <= 0 THEN
        RAISE EXCEPTION 'Batch capacity configuration error.';
    END IF;

    -- 5. Count actual confirmed enrollments directly from batch_enrollments.
    --    This is intentionally NOT using batches.current_enrollment_count because
    --    that column is a denormalized cache — it may not yet reflect an enrollment
    --    that a concurrent transaction just committed milliseconds ago. The live
    --    COUNT(*) is the source of truth while the lock is held.
    SELECT COUNT(*)
    INTO v_live_count
    FROM batch_enrollments
    WHERE batch_id = NEW.batch_id;

    IF v_live_count >= v_max_capacity THEN
        RAISE EXCEPTION 'Maximum capacity reached for this batch.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute the validation function before insert
DROP TRIGGER IF EXISTS trg_check_batch_capacity ON batch_enrollments;
CREATE TRIGGER trg_check_batch_capacity
BEFORE INSERT ON batch_enrollments
FOR EACH ROW
EXECUTE FUNCTION check_batch_capacity_before_insert();
