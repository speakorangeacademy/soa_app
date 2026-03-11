-- Real-time Dashboard Metrics Views
-- Fixed: payments.amount → payments.fee_amount (actual column name)
-- Fixed: be.status → be.allocation_status (actual column name)

BEGIN;

-- 1. Total Admissions View
CREATE OR REPLACE VIEW view_total_admissions AS
SELECT COUNT(DISTINCT student_id) AS total_admissions
FROM batch_enrollments
WHERE allocation_status = 'Active';

-- 2. Total Revenue View
CREATE OR REPLACE VIEW view_total_revenue AS
SELECT COALESCE(SUM(fee_amount), 0) AS total_revenue
FROM payments
WHERE verification_status = 'Approved';

-- 3. Pending Payments View
CREATE OR REPLACE VIEW view_pending_payments AS
SELECT COUNT(*) AS pending_count
FROM payments
WHERE verification_status = 'Pending';

-- 4. Batch Strength View
CREATE OR REPLACE VIEW view_batch_strength AS
SELECT
    b.batch_id AS id,
    b.batch_name AS name,
    b.max_capacity AS capacity,
    COUNT(be.student_id) FILTER (WHERE be.allocation_status = 'Active') AS current_strength
FROM batches b
LEFT JOIN batch_enrollments be ON be.batch_id = b.batch_id
GROUP BY b.batch_id;

-- 5. Course Enrollment View
CREATE OR REPLACE VIEW view_course_wise_enrollment AS
SELECT
    c.course_id AS id,
    c.course_name AS name,
    COUNT(be.student_id) FILTER (WHERE be.allocation_status = 'Active') AS total_students
FROM courses c
LEFT JOIN batches b ON b.course_id = c.course_id
LEFT JOIN batch_enrollments be ON be.batch_id = b.batch_id
GROUP BY c.course_id;

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_payments_verification_status ON payments(verification_status);
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_allocation_status ON batch_enrollments(allocation_status);
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_batch_id ON batch_enrollments(batch_id);
CREATE INDEX IF NOT EXISTS idx_batches_course_id ON batches(course_id);

COMMIT;
