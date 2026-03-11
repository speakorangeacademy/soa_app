-- Migration to support ID Card Distribution Tracking
BEGIN;

-- 1. Add distribution timestamp column if it doesn't exist
ALTER TABLE batch_enrollments 
ADD COLUMN IF NOT EXISTS id_card_distributed_at TIMESTAMPTZ;

-- 2. Convert id_card_distributed to boolean if it's currently an enum
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'batch_enrollments' 
        AND column_name = 'id_card_distributed' 
        AND data_type != 'boolean') THEN
        
        -- Drop the old enum default first to prevent casting errors
        ALTER TABLE batch_enrollments ALTER COLUMN id_card_distributed DROP DEFAULT;

        -- Convert the column type using a value map
        ALTER TABLE batch_enrollments 
        ALTER COLUMN id_card_distributed TYPE BOOLEAN 
        USING (CASE WHEN id_card_distributed::text IN ('YES', 'true', '1') THEN true ELSE false END);
        
        -- Set the new correct boolean default
        ALTER TABLE batch_enrollments 
        ALTER COLUMN id_card_distributed SET DEFAULT false;
    END IF;
END $$;

COMMIT;
