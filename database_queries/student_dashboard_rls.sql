-- Link students to Supabase Auth and enable RLS
ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS on students if not already enabled
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Students can view their own profile
DROP POLICY IF EXISTS "Students can view own profile" ON students;
CREATE POLICY "Students can view own profile" ON students
FOR SELECT USING (auth.uid() = user_id);

-- Students can view their own payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students can view own payments" ON payments;
CREATE POLICY "Students can view own payments" ON payments
FOR SELECT USING (auth.uid() IN (SELECT user_id FROM students WHERE students.student_id = payments.student_id));

-- Students can view their own enrollments
ALTER TABLE batch_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students can view own enrollments" ON batch_enrollments;
CREATE POLICY "Students can view own enrollments" ON batch_enrollments
FOR SELECT USING (auth.uid() IN (SELECT user_id FROM students WHERE students.student_id = batch_enrollments.student_id));

-- Students can view batches they are enrolled in
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students can view enrolled batches" ON batches;
CREATE POLICY "Students can view enrolled batches" ON batches
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM batch_enrollments 
    JOIN students ON students.student_id = batch_enrollments.student_id
    WHERE batch_enrollments.batch_id = batches.batch_id 
    AND students.user_id = auth.uid()
    AND batch_enrollments.allocation_status = 'Active'
  )
);

-- Similarly for courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students can view registered courses" ON courses;
CREATE POLICY "Students can view registered courses" ON courses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM payments 
    JOIN students ON students.student_id = payments.student_id
    WHERE payments.course_id = courses.course_id 
    AND students.user_id = auth.uid()
  )
);
