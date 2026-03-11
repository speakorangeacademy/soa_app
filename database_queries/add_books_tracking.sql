-- Migration to support Books Distribution Tracking
BEGIN;

-- 1. Add distribution timestamp column if it doesn't exist
ALTER TABLE batch_enrollments 
ADD COLUMN IF NOT EXISTS books_distributed_at TIMESTAMPTZ;

-- 2. Convert books_distributed to boolean if it's currently an enum
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'batch_enrollments' 
        AND column_name = 'books_distributed' 
        AND data_type != 'boolean') THEN
        
        -- Drop the RLS policy that depends on this column so we can alter its type
        DROP POLICY IF EXISTS "Teacher update distribution fields" ON batch_enrollments;

        -- Drop the old enum default first to prevent casting errors
        ALTER TABLE batch_enrollments ALTER COLUMN books_distributed DROP DEFAULT;

        -- Convert the column type using a value map
        ALTER TABLE batch_enrollments 
        ALTER COLUMN books_distributed TYPE BOOLEAN 
        USING (CASE WHEN books_distributed::text IN ('YES', 'true', '1') THEN true ELSE false END);
        
        -- Set the new correct boolean default
        ALTER TABLE batch_enrollments 
        ALTER COLUMN books_distributed SET DEFAULT false;

        -- Recreate the policy now that the column is BOOLEAN
        CREATE POLICY "Teacher update distribution fields" ON batch_enrollments
        FOR UPDATE TO authenticated
        USING (
            auth.jwt() -> 'app_metadata' ->> 'app_role' = 'Teacher'
        )
        WITH CHECK (
            auth.jwt() -> 'app_metadata' ->> 'app_role' = 'Teacher'
        );
    END IF;
END $$;

COMMIT;
