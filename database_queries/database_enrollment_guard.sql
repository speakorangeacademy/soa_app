-- Function to validate batch capacity before enrollment
CREATE OR REPLACE FUNCTION check_batch_capacity_before_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_status TEXT;
    v_current_count INTEGER;
    v_max_capacity INTEGER;
BEGIN
    -- 1. Fetch batch row with FOR UPDATE row lock to prevent race conditions
    SELECT batch_status, current_enrollment_count, max_capacity
    INTO v_status, v_current_count, v_max_capacity
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

    -- 4. Validate capacity rules
    IF v_current_count >= v_max_capacity THEN
        RAISE EXCEPTION 'Maximum capacity reached for this batch.';
    END IF;

    -- 5. Safety validation (max_capacity must be > 0)
    IF v_max_capacity <= 0 THEN
        RAISE EXCEPTION 'Batch capacity configuration error.';
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
