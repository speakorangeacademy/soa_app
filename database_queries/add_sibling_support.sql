-- Migration to add sibling registration support
BEGIN;

-- 1. Add columns for parent relationship if they don't exist
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS parent_email TEXT;

-- 2. Create index on parent identifiers for faster conflict resolution during registration
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON students(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_parent_email ON students(parent_email);
CREATE INDEX IF NOT EXISTS idx_students_parent_phone ON students(parent_phone);

-- 3. Update RLS policies to allow parents to view all their children
DROP POLICY IF EXISTS "Parents can view their children's profiles" ON students;
CREATE POLICY "Parents can view their children's profiles" ON students
FOR SELECT USING (auth.uid() = parent_id OR auth.uid() = user_id);

-- 4. Update payments and enrollments policies to account for sibling access
DROP POLICY IF EXISTS "Parents can view sibling payments" ON payments;
CREATE POLICY "Parents can view sibling payments" ON payments
FOR SELECT USING (
  auth.uid() IN (SELECT parent_id FROM students WHERE students.student_id = payments.student_id)
);

DROP POLICY IF EXISTS "Parents can view sibling enrollments" ON batch_enrollments;
CREATE POLICY "Parents can view sibling enrollments" ON batch_enrollments
FOR SELECT USING (
  auth.uid() IN (SELECT parent_id FROM students WHERE students.student_id = batch_enrollments.student_id)
);

COMMIT;
