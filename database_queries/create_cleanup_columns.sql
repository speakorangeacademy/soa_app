BEGIN;

-- Add tracking columns for screenshot cleanup
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS screenshot_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS screenshot_deleted_at TIMESTAMPTZ;

-- Indices for performance on cleanup queries
CREATE INDEX IF NOT EXISTS idx_payments_cleanup_eligible 
ON payments (verification_status, screenshot_deleted) 
WHERE verification_status = 'Approved' AND screenshot_deleted = FALSE;

COMMIT;
