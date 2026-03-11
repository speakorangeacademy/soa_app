BEGIN;

-- Add upload_failed flag to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS upload_failed BOOLEAN DEFAULT FALSE;

-- Ensure payment_screenshot_path is nullable to allow completion without upload
ALTER TABLE payments 
ALTER COLUMN payment_screenshot_path DROP NOT NULL;

COMMIT;
