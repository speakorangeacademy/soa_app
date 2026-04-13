# Speak Orange Academy — Database Reference

> **Source of truth:** This document is compiled from all SQL migration files in `database_queries/`,
> TypeScript type definitions in `types/`, API route logic, and the application's data-access patterns.
> Columns marked **(inferred)** are derived from application code where no explicit `CREATE TABLE`
> migration exists in this repository (the base tables were created directly in the Supabase dashboard).
> Run the [Introspection Queries](#introspection-queries) section below to verify the live schema.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tables](#tables)
   - [auth.users](#authusers-supabase-managed)
   - [users](#users)
   - [admin_users](#admin_users)
   - [teachers](#teachers)
   - [students](#students)
   - [courses](#courses)
   - [batches](#batches)
   - [batch_enrollments](#batch_enrollments)
   - [payments](#payments)
   - [receipts](#receipts)
   - [receipt_sequences](#receipt_sequences)
   - [payment_qr_codes](#payment_qr_codes)
   - [audit_logs](#audit_logs)
   - [system_logs](#system_logs)
   - [notification_preferences](#notification_preferences)
   - [backup_verification_logs](#backup_verification_logs)
3. [Relationships & Entity Diagram](#relationships--entity-diagram)
4. [Views](#views)
5. [Functions & Triggers](#functions--triggers)
6. [Row-Level Security (RLS) Policies](#row-level-security-rls-policies)
7. [Indexes](#indexes)
8. [Storage Buckets](#storage-buckets)
9. [Introspection Queries](#introspection-queries)

---

## Architecture Overview

```
Supabase PostgreSQL (hosted)
├── auth schema         — Supabase-managed authentication
│   └── auth.users      — Source of identity for all roles
├── public schema       — Application tables
│   ├── users           — Unified role registry (links auth.users → app role)
│   ├── admin_users     — Admin profile records
│   ├── teachers        — Teacher profile records
│   ├── students        — Student profile records (extended by migrations)
│   ├── courses         — Course catalogue
│   ├── batches         — Batch schedule under a course
│   ├── batch_enrollments — Student ↔ Batch allocation
│   ├── payments        — Payment proof submissions & verification
│   ├── receipts        — Generated receipt documents
│   ├── receipt_sequences — Auto-incrementing receipt number per financial year
│   ├── payment_qr_codes — Active UPI/bank QR codes for payment
│   ├── audit_logs      — Admin/super-admin action trail
│   ├── system_logs     — System-level event log (API-generated)
│   ├── notification_preferences — Per-user email/SMS opt-in
│   └── backup_verification_logs — Manual backup health records
└── storage             — Supabase Storage buckets
    └── payment-screenshots — Uploaded payment proof images
```

**Authentication flow:**
1. User signs in via Supabase Auth (`auth.users`).
2. Middleware reads the `users` table to resolve `role` and `status`.
3. Role determines dashboard destination and protected route access.
4. All RLS-protected queries use `auth.uid()` to scope data.

**Role values** (stored in `users.role`, case-insensitive in middleware):
| Raw value in DB | Normalised | Dashboard |
|---|---|---|
| `Super Admin` | `super_admin` | `/super-admin/dashboard` |
| `Admin` | `admin` | `/admin/dashboard` |
| `Teacher` | `teacher` | `/teacher/dashboard` |
| `Student` | `student` | `/student/dashboard` |

---

## Tables

---

### `auth.users` (Supabase-managed)

Managed entirely by Supabase Auth. The application never writes to this table directly.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key — used as FK throughout the app |
| `email` | TEXT | Login email |
| `phone` | TEXT | Optional phone number |
| `user_metadata` | JSONB | Stores `phone` at registration |
| `app_metadata` | JSONB | **Not used** for role resolution in this project (see `users` table) |
| `created_at` | TIMESTAMPTZ | — |

---

### `users`

Unified role registry. Every authenticated user (admin, teacher, student) must have a row here.
This is the **single source of truth for role resolution** — middleware and API routes query this table.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, FK → `auth.users(id)` | Same UUID as Supabase Auth |
| `role` | TEXT | NOT NULL | `'Super Admin'` \| `'Admin'` \| `'Teacher'` \| `'Student'` |
| `status` | TEXT | NOT NULL | `'Active'` \| `'Inactive'` — inactive blocks all access |
| `is_first_login` | BOOLEAN | — | Used for teacher forced password change flow |

**Queried by:** middleware, `app/auth/actions.ts`, reupload route, all admin/teacher API routes.

---

### `admin_users`

Stores admin profile information. Admins can also be looked up by mobile for login.

| Column | Type | Notes |
|---|---|---|
| `admin_id` | UUID | PK (inferred) |
| `email` | TEXT | Login email, matched to `auth.users.email` |
| `mobile_number` | TEXT | Used for mobile-number login lookup |
| `admin_name` | TEXT | Display name (inferred) |
| `created_at` | TIMESTAMPTZ | — |

**Queried by:** `app/auth/actions.ts` login flow — mobile → email resolution.

---

### `teachers`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `teacher_id` | UUID | PK | Matches `auth.users.id` |
| `teacher_name` | TEXT | NOT NULL | — |
| `email` | TEXT | NOT NULL | — |
| `mobile_number` | TEXT | — | Used for mobile login |
| `is_first_login` | BOOLEAN | DEFAULT true | Forces password change on first login |
| `is_active` | BOOLEAN | DEFAULT true | — |
| `created_at` | TIMESTAMPTZ | — | — |
| `updated_at` | TIMESTAMPTZ | — | Updated on password change |

**Relationships:**
- `batches.teacher_id → teachers.teacher_id`

---

### `students`

Core student profile. Extended by multiple migrations.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `student_id` | UUID | PK | — |
| `student_full_name` | TEXT | NOT NULL | Legacy full-name field |
| `first_name` | TEXT | — | Added by `student_granular_profile.sql` |
| `last_name` | TEXT | — | Added by `student_granular_profile.sql` |
| `email_address` | TEXT | NOT NULL | — |
| `mobile_number` | TEXT | — | Used for mobile login |
| `date_of_birth` | DATE | — | — |
| `gender` | TEXT | — | — |
| `address` | TEXT | — | Legacy single-field address |
| `address_line_1` | TEXT | — | Populated from `address` by migration |
| `address_line_2` | TEXT | — | — |
| `city` | TEXT | — | — |
| `state` | TEXT | — | — |
| `pincode` | TEXT | — | — |
| `is_active` | BOOLEAN | DEFAULT true | — |
| `user_id` | UUID | FK → `auth.users(id)` ON DELETE CASCADE | Added by `student_dashboard_rls.sql`. NULL until student first logs in. |
| `parent_id` | UUID | FK → `auth.users(id)` ON DELETE SET NULL | Added by `add_sibling_support.sql` — parent's Auth UID |
| `parent_email` | TEXT | — | Added by `add_sibling_support.sql` |
| `parent_phone` | TEXT | — | Added by `student_granular_profile.sql` |
| `alternate_phone` | TEXT | — | Added by `student_granular_profile.sql` |
| `notes` | TEXT | — | Internal admin notes |
| `created_at` | TIMESTAMPTZ | — | — |
| `updated_at` | TIMESTAMPTZ | — | — |

**Auto-link:** On first login, if `user_id` is NULL, the student dashboard API matches by `email_address` or `mobile_number` and writes `user_id`.

---

### `courses`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `course_id` | UUID | PK | — |
| `course_name` | TEXT | NOT NULL | — |
| `level` | TEXT | — | e.g. Beginner, Intermediate |
| `language` | TEXT | — | — |
| `description` | TEXT | — | — |
| `duration` | TEXT | — | e.g. "3 months" |
| `total_fee` | NUMERIC | NOT NULL | Fee in INR |
| `mode` | TEXT | — | `'Online'` \| `'Offline'` \| `'Hybrid'` |
| `created_at` | TIMESTAMPTZ | — | — |

---

### `batches`

One batch belongs to one course and optionally one teacher.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `batch_id` | UUID | PK | — |
| `course_id` | UUID | FK → `courses(course_id)` | — |
| `teacher_id` | UUID | FK → `teachers(teacher_id)` | Nullable until teacher is assigned |
| `batch_name` | TEXT | NOT NULL | — |
| `batch_timing` | TEXT | — | e.g. "Mon/Wed/Fri 5–6 PM" |
| `start_date` | DATE | — | — |
| `end_date` | DATE | — | — |
| `max_capacity` | INTEGER | NOT NULL | Enrollment hard cap |
| `current_enrollment_count` | INTEGER | DEFAULT 0 | Denormalised cache — used for display only; **not** used for the authoritative capacity check (see trigger) |
| `batch_status` | TEXT | — | `'Open'` \| `'Full'` \| `'Closed'` |
| `created_at` | TIMESTAMPTZ | — | — |
| `updated_at` | TIMESTAMPTZ | — | — |

> **Important:** `current_enrollment_count` is a display cache. The enrollment trigger performs a live `COUNT(*)` on `batch_enrollments` under a `FOR UPDATE` lock for atomicity. See [Functions & Triggers](#functions--triggers).

---

### `batch_enrollments`

Junction table between students and batches. Each active row represents a confirmed seat.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `enrollment_id` | UUID | PK | — |
| `student_id` | UUID | FK → `students(student_id)` | — |
| `batch_id` | UUID | FK → `batches(batch_id)` | — |
| `enrollment_date` | TIMESTAMPTZ | — | — |
| `allocation_status` | TEXT | — | `'Active'` \| `'Inactive'` |
| `allocated_by` | UUID | FK → `auth.users(id)` | Admin/system that approved |
| `books_distributed` | BOOLEAN | DEFAULT false | Toggled by teacher |
| `books_distributed_at` | TIMESTAMPTZ | — | Set when books are distributed |
| `id_card_distributed` | BOOLEAN | DEFAULT false | Toggled by teacher |
| `id_card_distributed_at` | TIMESTAMPTZ | — | Set when ID card is distributed |
| `created_at` | TIMESTAMPTZ | — | — |
| `updated_at` | TIMESTAMPTZ | — | — |

---

### `payments`

Central payment lifecycle table. A single payment record moves through `Pending → Approved / Rejected`.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `payment_id` | UUID | PK | — |
| `student_id` | UUID | FK → `students(student_id)` | — |
| `course_id` | UUID | FK → `courses(course_id)` | — |
| `batch_id` | UUID | FK → `batches(batch_id)` | — |
| `fee_amount` | NUMERIC | NOT NULL | Copied from `courses.total_fee` at submission time |
| `payment_method` | TEXT | NOT NULL | `'UPI'` \| `'Bank Transfer'` |
| `transaction_id` | TEXT | NOT NULL | UTR / UPI reference |
| `payment_screenshot_path` | TEXT | **NULLABLE** (after migration) | Storage path in `payment-screenshots` bucket |
| `payment_date` | DATE | NOT NULL | Date student claims payment was made |
| `submission_timestamp` | TIMESTAMPTZ | — | When the form was submitted |
| `verification_status` | TEXT | DEFAULT `'Pending'` | `'Pending'` \| `'Approved'` \| `'Rejected'` |
| `verified_by` | UUID | FK → `auth.users(id)` | Admin who acted on it |
| `verification_timestamp` | TIMESTAMPTZ | — | When admin approved/rejected |
| `rejection_remarks` | TEXT | — | Rejection reason shown to student |
| `reupload_allowed` | BOOLEAN | — | If true, student sees re-upload form |
| `resubmitted_at` | TIMESTAMPTZ | — | Set when student re-submits; status reset to Pending |
| `upload_failed` | BOOLEAN | DEFAULT false | Student flagged upload failure at submission |
| `screenshot_deleted` | BOOLEAN | DEFAULT false | Set by cleanup cron after approval |
| `screenshot_deleted_at` | TIMESTAMPTZ | — | Cleanup timestamp |
| `created_at` | TIMESTAMPTZ | — | — |
| `updated_at` | TIMESTAMPTZ | — | — |

**Lifecycle:**
```
Student submits → status = 'Pending'
Admin rejects  → status = 'Rejected', rejection_remarks set, reupload_allowed set
Student re-uploads → status = 'Pending', resubmitted_at set, reupload_allowed = false
Admin approves → status = 'Approved', receipt generated, batch_enrollment created
Cron cleanup   → screenshot_deleted = true (after approval)
```

---

### `receipts`

Generated PDF receipt for an approved payment.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `receipt_id` | UUID | PK | — |
| `payment_id` | UUID | FK → `payments(payment_id)` | One receipt per payment |
| `receipt_number` | TEXT | UNIQUE | Format: `SO/YYYY-YY/XXXX` — generated by `generate_receipt_number()` |
| `receipt_pdf_path` | TEXT | — | Storage path to the generated PDF |
| `status` | TEXT | DEFAULT `'Active'` | `'Active'` \| `'Cancelled'` |
| `cancellation_reason` | TEXT | — | Added by `receipt_cancellation_schema.sql` |
| `cancelled_by` | UUID | FK → `auth.users(id)` | — |
| `cancelled_at` | TIMESTAMPTZ | — | — |
| `created_at` | TIMESTAMPTZ | — | — |

---

### `receipt_sequences`

Tracks the incrementing receipt counter per Indian financial year.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | — |
| `financial_year` | TEXT | UNIQUE NOT NULL | Format: `2025-26` |
| `last_number` | INTEGER | NOT NULL DEFAULT 1 | Atomically incremented on each receipt |
| `created_at` | TIMESTAMPTZ | NOT NULL | — |

**Used by:** `generate_receipt_number()` function — atomic `INSERT ... ON CONFLICT DO UPDATE`.

---

### `payment_qr_codes`

Stores UPI / bank transfer QR code images. Only one should be active at a time.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `qr_id` | UUID | PK (inferred) | — |
| `image_path` | TEXT | NOT NULL | Storage path in Supabase bucket |
| `label` | TEXT | NOT NULL (min 3 chars) | Display label |
| `is_active` | BOOLEAN | — | Only one active QR served to students |
| `uploaded_by` | UUID | FK → `auth.users(id)` | — |
| `created_at` | TIMESTAMPTZ | — | — |

---

### `audit_logs`

Admin and super-admin action trail. Used by the `withAuditLogging` HOF that wraps all admin API routes.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK (inferred) | — |
| `action_type` | TEXT | — | e.g. `PAYMENT_APPROVED`, `PAYMENT_REJECTED`, `BATCH_ALLOCATED` |
| `user_id` | UUID | FK → `auth.users(id)` | Admin who performed the action |
| `entity_type` | TEXT | — | e.g. `payment`, `batch`, `teacher` |
| `entity_id` | TEXT | — | UUID of the affected record |
| `details` | JSONB | — | Action-specific metadata |
| `client_info` | JSONB | — | User agent, IP (inferred from audit-logger.ts) |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |

**Indexes:** `user_id`, `entity_type`, `entity_id`, `action_type`, `created_at DESC`

---

### `system_logs`

Lower-level event log written directly by API routes (not via the `withAuditLogging` HOF).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK (inferred) |
| `user_id` | UUID | Auth UID of actor |
| `user_role` | TEXT | Role string at time of action |
| `action_type` | TEXT | e.g. `NEW_PAYMENT_SUBMITTED`, `PAYMENT_RESUBMITTED`, `EMAIL_SENT` |
| `entity_type` | TEXT | e.g. `payment`, `email` |
| `entity_id` | TEXT | UUID of affected record |
| `action_details` | JSONB | Event-specific data |
| `created_at` | TIMESTAMPTZ | — |

---

### `notification_preferences`

Per-user opt-in configuration for communication channels.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | — |
| `user_id` | UUID | UNIQUE, FK → `auth.users(id)` ON DELETE CASCADE | One row per user |
| `email_opt_in` | BOOLEAN | DEFAULT true | — |
| `sms_opt_in` | BOOLEAN | DEFAULT false | — |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Auto-updated by trigger |

---

### `backup_verification_logs`

Internal operational log for manual database backup health checks.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | — |
| `checked_at` | TIMESTAMPTZ | DEFAULT now() | — |
| `status` | TEXT | NOT NULL | `'Success'` \| `'Failure'` \| `'Maintenance'` |
| `notes` | TEXT | — | Free-form notes |
| `created_by` | UUID | FK → `auth.users(id)` | Admin who logged the check |

---

## Relationships & Entity Diagram

```
auth.users (Supabase)
    │
    ├──< users              (id = auth.users.id) — role + status
    ├──< admin_users        (email matches auth.users.email)
    ├──< teachers           (teacher_id = auth.users.id)
    ├──< students           (user_id → auth.users.id, nullable until first login)
    │       │
    │       ├──< payments          (student_id → students.student_id)
    │       │       │
    │       │       ├──< receipts  (payment_id → payments.payment_id)
    │       │       └── courses    (course_id → courses.course_id)
    │       │
    │       └──< batch_enrollments (student_id → students.student_id)
    │               └── batches    (batch_id → batches.batch_id)
    │
    └── notification_preferences  (user_id → auth.users.id)

courses
    └──< batches           (course_id → courses.course_id)
            │
            ├── teachers   (teacher_id → teachers.teacher_id)
            └──< batch_enrollments (batch_id → batches.batch_id)

receipt_sequences  (standalone — used by generate_receipt_number())
audit_logs         (user_id → auth.users.id)
system_logs        (user_id → auth.users.id)
backup_verification_logs (created_by → auth.users.id)
payment_qr_codes   (uploaded_by → auth.users.id)
```

**Cardinality summary:**
| Relationship | Type |
|---|---|
| course → batches | One-to-Many |
| batch → teacher | Many-to-One (optional) |
| student → payments | One-to-Many |
| payment → receipt | One-to-One |
| student → batch_enrollments | One-to-Many |
| batch → batch_enrollments | One-to-Many |
| student ↔ batch (via batch_enrollments) | Many-to-Many |

---

## Views

All views live in `public` schema. Created by `database_queries/metrics_views.sql`.

| View | Returns | Used by |
|---|---|---|
| `view_total_admissions` | `total_admissions` COUNT of active enrollments | Admin/Super-Admin dashboard metrics |
| `view_total_revenue` | `total_revenue` SUM of approved payment `fee_amount` | Dashboard metrics |
| `view_pending_payments` | `pending_count` COUNT of pending payments | Dashboard metrics |
| `view_batch_strength` | Per-batch: `id`, `name`, `capacity`, `current_strength` | Batch occupancy table |
| `view_course_wise_enrollment` | Per-course: `id`, `name`, `total_students` | Course enrollment chart |

---

## Functions & Triggers

### `generate_receipt_number()` → TEXT
**File:** `database_queries/receipt_number_sequence.sql`
**Security:** `SECURITY DEFINER`

Generates a sequential receipt number in the format `SO/YYYY-YY/XXXX`.
Uses Indian financial year logic (FY starts April 1). Uses atomic `INSERT ... ON CONFLICT DO UPDATE` on `receipt_sequences` to guarantee uniqueness under concurrent calls.

```
Example output: SO/2025-26/0042
```

---

### `check_batch_capacity_before_insert()` + `trg_check_batch_capacity`
**File:** `database_queries/database_enrollment_guard.sql`
**Trigger:** `BEFORE INSERT ON batch_enrollments FOR EACH ROW`

Race-safe capacity guard. Acquires a `SELECT ... FOR UPDATE` row lock on the parent `batches` row, then performs a **live `COUNT(*)`** on `batch_enrollments` — not the denormalised `current_enrollment_count` — to check available capacity. This prevents double-enrollment under concurrent approvals.

Raises exceptions for:
- Batch not found
- `batch_status = 'Full'`
- `max_capacity <= 0`
- Live count `>= max_capacity`

---

### `reallocate_student_batch(p_student_id, p_old_batch_id, p_new_batch_id, p_reason)` → JSONB
**File:** `database_queries/batch_reallocation_rpc.sql`
**Security:** `SECURITY DEFINER`

Atomically moves a student from one batch to another:
1. Validates active enrollment in source batch
2. Checks target batch capacity
3. Updates `batch_enrollments.batch_id`
4. Decrements `current_enrollment_count` on old batch
5. Increments `current_enrollment_count` on new batch

Returns `{ success: true, enrollment_id }` or `{ success: false, error }`.

---

### `handle_updated_at()` + `tr_notification_preferences_updated_at`
**File:** `database_queries/create_notification_preferences.sql`
**Trigger:** `BEFORE UPDATE ON notification_preferences FOR EACH ROW`

Sets `NEW.updated_at = now()` automatically.

---

## Row-Level Security (RLS) Policies

### `students`
| Policy | Operation | Condition |
|---|---|---|
| Students can view own profile | SELECT | `auth.uid() = user_id` |
| Parents can view their children's profiles | SELECT | `auth.uid() = parent_id OR auth.uid() = user_id` |

### `payments`
| Policy | Operation | Condition |
|---|---|---|
| Students can view own payments | SELECT | `auth.uid()` IN students where `student_id` matches |
| Parents can view sibling payments | SELECT | `auth.uid()` IN students.parent_id where `student_id` matches |

### `batch_enrollments`
| Policy | Operation | Condition |
|---|---|---|
| Students can view own enrollments | SELECT | `auth.uid()` IN students where `student_id` matches |
| Parents can view sibling enrollments | SELECT | `auth.uid()` IN students.parent_id where `student_id` matches |
| Teacher update distribution fields | UPDATE | `app_metadata.app_role = 'Teacher'` (JWT claim) |

### `batches`
| Policy | Operation | Condition |
|---|---|---|
| Students can view enrolled batches | SELECT | Active enrollment exists for `auth.uid()` in this batch |

### `courses`
| Policy | Operation | Condition |
|---|---|---|
| Students can view registered courses | SELECT | Payment exists for `auth.uid()` against this course |

### `audit_logs`
| Policy | Operation | Condition |
|---|---|---|
| Service role insert | INSERT | Always (service_role only) |
| Super Admin select | SELECT | `app_metadata.app_role = 'Super Admin'` |

### `notification_preferences`
| Policy | Operation | Condition |
|---|---|---|
| Users can view own preferences | SELECT | `auth.uid() = user_id` |
| Users can insert own preferences | INSERT | `auth.uid() = user_id` |
| Users can update own preferences | UPDATE | `auth.uid() = user_id` |

### `backup_verification_logs`
| Policy | Operation | Condition |
|---|---|---|
| Admins can manage backup logs | ALL | `app_metadata.app_role IN ('Admin', 'Super Admin')` |

> **Note:** Most admin/super-admin data access bypasses RLS by using the **service role client** (`createAdminClient()` in `utils/supabase/admin.ts`). RLS is primarily enforced for student-facing routes that use the standard server client.

---

## Indexes

| Table | Column(s) | Index Name | Notes |
|---|---|---|---|
| `audit_logs` | `user_id` | `idx_audit_logs_user_id` | — |
| `audit_logs` | `entity_type` | `idx_audit_logs_entity_type` | — |
| `audit_logs` | `entity_id` | `idx_audit_logs_entity_id` | — |
| `audit_logs` | `action_type` | `idx_audit_logs_action_type` | — |
| `audit_logs` | `created_at DESC` | `idx_audit_logs_created_at` | — |
| `payments` | `verification_status` | `idx_payments_verification_status` | Dashboard metrics |
| `payments` | `verification_status, screenshot_deleted` | `idx_payments_cleanup_eligible` | Partial — WHERE Approved AND not deleted |
| `batch_enrollments` | `allocation_status` | `idx_batch_enrollments_allocation_status` | — |
| `batch_enrollments` | `batch_id` | `idx_batch_enrollments_batch_id` | — |
| `batches` | `course_id` | `idx_batches_course_id` | — |
| `receipts` | `status` | `idx_receipts_status` | — |
| `receipt_sequences` | `financial_year` | `idx_receipt_sequences_fy` | — |
| `students` | `parent_id` | `idx_students_parent_id` | Sibling support |
| `students` | `parent_email` | `idx_students_parent_email` | — |
| `students` | `parent_phone` | `idx_students_parent_phone` | — |

---

## Storage Buckets

| Bucket | Contents | Path pattern |
|---|---|---|
| `payment-screenshots` | Student payment proof images (JPG/PNG/WEBP, max 5 MB) | `{student_id}/{payment_id}.{ext}` (initial) or `payment_{paymentId}_{timestamp}.{ext}` (re-upload) |

Uploaded via the Supabase Storage API using the **service role client** (bypasses bucket RLS).
Cleanup cron (`/api/cron/cleanup-payment-screenshots`) removes approved-payment screenshots and sets `screenshot_deleted = true`.

---

## Introspection Queries

Run these in the **Supabase SQL Editor** to verify the live schema against this document.

---

### 1. List all tables and their row counts

```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

### 2. Full column listing for every application table

```sql
SELECT
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'users', 'admin_users', 'teachers', 'students',
    'courses', 'batches', 'batch_enrollments',
    'payments', 'receipts', 'receipt_sequences',
    'payment_qr_codes', 'audit_logs', 'system_logs',
    'notification_preferences', 'backup_verification_logs'
  )
ORDER BY table_name, ordinal_position;
```

---

### 3. All foreign key relationships

```sql
SELECT
    tc.table_name         AS source_table,
    kcu.column_name       AS source_column,
    ccu.table_name        AS target_table,
    ccu.column_name       AS target_column,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage  AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema   = kcu.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = rc.unique_constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema    = 'public'
ORDER BY source_table, source_column;
```

---

### 4. All indexes on application tables

```sql
SELECT
    t.relname  AS table_name,
    i.relname  AS index_name,
    ix.indisunique AS is_unique,
    ix.indisprimary AS is_primary,
    array_agg(a.attname ORDER BY array_position(ix.indkey, a.attnum)) AS columns
FROM pg_class t
JOIN pg_index  ix ON t.oid = ix.indrelid
JOIN pg_class  i  ON i.oid = ix.indexrelid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
WHERE t.relkind = 'r'
  AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
GROUP BY t.relname, i.relname, ix.indisunique, ix.indisprimary
ORDER BY t.relname, i.relname;
```

---

### 5. All RLS policies

```sql
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd         AS operation,
    qual        AS using_expression,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

### 6. All functions (stored procedures)

```sql
SELECT
    routine_name,
    routine_type,
    data_type AS return_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

---

### 7. All triggers

```sql
SELECT
    trigger_name,
    event_object_table AS table_name,
    event_manipulation AS event,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

---

### 8. All views

```sql
SELECT
    table_name  AS view_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;
```

---

### 9. Tables with RLS enabled

```sql
SELECT
    schemaname,
    tablename,
    rowsecurity AS rls_enabled,
    forcerowsecurity AS rls_forced
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

### 10. Storage bucket contents (payment screenshots)

```sql
SELECT
    name,
    bucket_id,
    created_at,
    metadata->>'size' AS file_size_bytes,
    metadata->>'mimetype' AS mime_type
FROM storage.objects
WHERE bucket_id = 'payment-screenshots'
ORDER BY created_at DESC
LIMIT 50;
```

---

### 11. Current receipt sequence numbers

```sql
SELECT
    financial_year,
    last_number,
    'SO/' || financial_year || '/' || LPAD(last_number::TEXT, 4, '0') AS last_receipt_issued
FROM receipt_sequences
ORDER BY financial_year DESC;
```

---

### 12. Payment status breakdown

```sql
SELECT
    verification_status,
    COUNT(*)            AS count,
    SUM(fee_amount)     AS total_amount
FROM payments
GROUP BY verification_status
ORDER BY verification_status;
```

---

### 13. Batch occupancy overview

```sql
SELECT
    b.batch_name,
    c.course_name,
    b.batch_status,
    b.max_capacity,
    b.current_enrollment_count                      AS cached_count,
    COUNT(be.enrollment_id) FILTER (WHERE be.allocation_status = 'Active') AS live_count,
    b.max_capacity - b.current_enrollment_count     AS seats_remaining_cached
FROM batches b
LEFT JOIN courses c            ON c.course_id = b.course_id
LEFT JOIN batch_enrollments be ON be.batch_id = b.batch_id
GROUP BY b.batch_id, c.course_name
ORDER BY b.batch_name;
```

> **Compare `cached_count` vs `live_count`** — if they differ, the denormalised counter has drifted and needs reconciliation.

---

### 14. Students without auth link (user_id IS NULL)

```sql
SELECT
    student_id,
    student_full_name,
    email_address,
    mobile_number,
    created_at
FROM students
WHERE user_id IS NULL
ORDER BY created_at DESC;
```

These students can still log in — the student dashboard API auto-links on first access.

---

### 15. Rejected payments still awaiting re-upload decision

```sql
SELECT
    p.payment_id,
    s.student_full_name,
    s.email_address,
    p.rejection_remarks,
    p.reupload_allowed,
    p.verification_timestamp AS rejected_at
FROM payments p
JOIN students s ON s.student_id = p.student_id
WHERE p.verification_status = 'Rejected'
ORDER BY p.verification_timestamp DESC;
```

---

*Last updated: 2026-04-01 | Generated from database_queries/, types/, and application source code.*
