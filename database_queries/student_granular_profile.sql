-- Migration to add granular profile fields to the students table

BEGIN;

-- 1. Add new columns if they don't exist
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS parent_phone TEXT,
ADD COLUMN IF NOT EXISTS alternate_phone TEXT,
ADD COLUMN IF NOT EXISTS address_line_1 TEXT,
ADD COLUMN IF NOT EXISTS address_line_2 TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS pincode TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Populate first_name and last_name from student_full_name if possible
-- Simple split by space: first part as first_name, rest as last_name
UPDATE students 
SET 
  first_name = split_part(student_full_name, ' ', 1),
  last_name = COALESCE(nullif(substring(student_full_name from ' (.*)$'), ''), '')
WHERE first_name IS NULL AND student_full_name IS NOT NULL;

-- 3. Populate address_line_1 from address if possible
UPDATE students 
SET address_line_1 = address
WHERE address_line_1 IS NULL AND address IS NOT NULL;

-- 4. Set defaults for NOT NULL constraints if we were to add them later, 
-- but for now keeping them nullable to avoid breaking existing registration flow
-- unless we update the registration flow simultaneously.

COMMIT;
