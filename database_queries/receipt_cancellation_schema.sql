-- Migration to add cancellation fields to receipts table
BEGIN;

-- 1. Add status column
ALTER TABLE receipts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

-- 2. Add cancellation metadata
ALTER TABLE receipts 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- 3. Index for performance
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);

COMMIT;
