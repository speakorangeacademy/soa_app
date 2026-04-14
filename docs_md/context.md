# Speak Orange — Change Log & Context

## Session: 2026-03-30

### Problems Fixed

#### 1. Infinite Recursion in RLS Policies (`batches` / `batch_enrollments` / `students`)

**Root cause:** Multiple circular RLS policy references across three tables:

**Cycle A (fixed first):**
- `batches` → "Student select active batches" / "Students can view enrolled batches" → queries `batch_enrollments`
- `batch_enrollments` → "Teacher select linked enrollments" → queries `batches`
- → infinite recursion on `batches`

**Cycle B (fixed second):**
- `batch_enrollments` → "Students can view own enrollments" → queries `students`
- `students` → "Teacher select linked students" → queries `batch_enrollments JOIN batches`
- → infinite recursion on `batch_enrollments`

**Fix applied in Supabase SQL editor:**

Created two `SECURITY DEFINER` helper functions that bypass RLS when checking teacher-batch/student relationships, then rewrote the offending policies to use them:

```sql
-- Function 1: breaks batches ↔ batch_enrollments cycle
CREATE OR REPLACE FUNCTION teacher_owns_batch(p_batch_id uuid, p_teacher_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM batches WHERE batch_id = p_batch_id AND teacher_id = p_teacher_id);
$$;

-- Policy replaced on batch_enrollments:
-- "Teacher select linked enrollments"
-- OLD: is_teacher() AND EXISTS (SELECT 1 FROM batches b WHERE b.batch_id = batch_enrollments.batch_id AND b.teacher_id = auth.uid())
-- NEW: is_teacher() AND teacher_owns_batch(batch_id, auth.uid())

-- Function 2: breaks batch_enrollments ↔ students cycle
CREATE OR REPLACE FUNCTION teacher_has_student(p_student_id uuid, p_teacher_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM batch_enrollments be
    JOIN batches b ON be.batch_id = b.batch_id
    WHERE be.student_id = p_student_id AND b.teacher_id = p_teacher_id
  );
$$;

-- Policy replaced on students:
-- "Teacher select linked students"
-- OLD: is_teacher() AND EXISTS (SELECT 1 FROM batch_enrollments be JOIN batches b ON ... WHERE be.student_id = students.student_id AND b.teacher_id = auth.uid())
-- NEW: is_teacher() AND teacher_has_student(student_id, auth.uid())
```

---

#### 2. Missing FK: `batches` → `teachers` ("Could not find a relationship between 'batches' and 'teachers' in the schema cache")

**Root cause:** The API route `app/api/batches/route.ts` uses PostgREST implicit join syntax `teacher:teachers(teacher_name)`, which requires a foreign key constraint from `batches.teacher_id → teachers.teacher_id`. This FK was never defined in the database.

**Confirmed:** `batches.teacher_id` is UUID type, `teachers` table exists with `teacher_id` column.

**Fix applied (2026-03-30):**
```sql
ALTER TABLE batches
ADD CONSTRAINT fk_batches_teacher
FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE SET NULL;

NOTIFY pgrst, 'reload schema';
```

---

### Key Facts About This Project

- Supabase client uses **ANON KEY** (not service role) — RLS is fully enforced on all API routes
- Table schemas (`batches`, `teachers`, etc.) were created directly in Supabase dashboard — not in local SQL files
- Local SQL files in `database_queries/` are migration scripts only, not the source of truth for current DB state
- Helper role functions: `is_admin()`, `is_student()`, `is_super_admin()`, `is_teacher()` all call `current_app_role()` which reads `auth.jwt() ->> 'app_role'` — no table queries, safe in policies
- `batches.teacher_id` stores the teacher's `auth.users` UUID directly
- `batch_enrollments.student_id` stores the student's UUID directly (matches `auth.uid()`)
