# Speak Orange Academy — Codebase Reference

> Complete technical analysis of the SOA Next.js application.
> Covers architecture, every route, every component, data-flow patterns, and operational concerns.

---

## Table of Contents

1. [Project Identity](#project-identity)
2. [Tech Stack](#tech-stack)
3. [Repository Layout](#repository-layout)
4. [Environment Variables](#environment-variables)
5. [Authentication & Authorisation](#authentication--authorisation)
6. [Routing Architecture](#routing-architecture)
7. [API Routes — Full Reference](#api-routes--full-reference)
8. [Page Routes — Full Reference](#page-routes--full-reference)
9. [Components — Full Reference](#components--full-reference)
10. [Utility Modules](#utility-modules)
11. [Data Flow Walkthroughs](#data-flow-walkthroughs)
12. [Background Jobs (Cron)](#background-jobs-cron)
13. [Email System](#email-system)
14. [PDF & Receipt System](#pdf--receipt-system)
15. [PWA & Caching](#pwa--caching)
16. [Error Handling & Observability](#error-handling--observability)
17. [Styling System](#styling-system)
18. [Known Gaps & Technical Debt](#known-gaps--technical-debt)

---

## Project Identity

| Field | Value |
|---|---|
| **Product** | Speak Orange Academy (SOA) — student management platform |
| **Framework** | Next.js 14.1.0 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Hosting** | Vercel (assumed; PWA + Next.js) |
| **Email** | Resend |
| **Error tracking** | Sentry |
| **Package manager** | npm |

---

## Tech Stack

### Core
| Package | Version | Purpose |
|---|---|---|
| `next` | 14.1.0 | Framework — App Router, Server Actions, API Routes |
| `react` / `react-dom` | 18 | UI |
| `typescript` | ^5 | Type safety |
| `@supabase/supabase-js` | ^2.39.7 | Supabase client |
| `@supabase/ssr` | ^0.1.0 | SSR-safe Supabase session handling |

### Forms & Validation
| Package | Purpose |
|---|---|
| `zod` ^3.22.4 | Schema validation (shared client + server) |
| `react-hook-form` ^7.50.1 | Form state management |
| `@hookform/resolvers` ^3.3.4 | Bridges RHF ↔ Zod |

### UI
| Package | Purpose |
|---|---|
| `tailwindcss` ^3.4.1 | Utility-first CSS |
| `tailwindcss-animate` ^1.0.7 | Animation utilities |
| `lucide-react` ^0.330.0 | Icon set |
| `framer-motion` ^12.35.2 | Animation library |
| `sonner` ^1.5.0 | Toast notifications |
| `recharts` ^3.8.0 | Charts (enrollment, revenue) |

### Data & State
| Package | Purpose |
|---|---|
| `@tanstack/react-query` ^5.20.1 | Server-state cache, refetch, loading states |

### Services
| Package | Purpose |
|---|---|
| `resend` ^6.9.3 | Transactional email delivery |
| `@sentry/nextjs` ^7.100.0 | Error tracking + performance |
| `@react-pdf/renderer` ^4.3.2 | Server-side PDF generation for receipts |
| `xlsx` ^0.18.5 | Excel export for reports |

### Infrastructure
| Package | Purpose |
|---|---|
| `next-pwa` ^5.6.0 | PWA manifest + service worker |

---

## Repository Layout

```
soa_app/
├── app/                        # Next.js App Router
│   ├── api/                    # 58 API route handlers
│   ├── admin/                  # Admin portal pages (7 pages)
│   ├── super-admin/            # Super Admin portal pages (13 pages)
│   ├── teacher/                # Teacher portal pages (3 pages)
│   ├── student/                # Student portal pages (2 pages)
│   ├── auth/                   # Auth actions + role-specific login pages
│   ├── login/                  # Unified login page
│   ├── register/               # Student self-registration
│   ├── forgot-password/        # Password reset request
│   ├── reset-password/         # Password reset form (token-based)
│   ├── payment/[student_id]/   # Public payment submission page
│   ├── settings/               # Notification preferences
│   ├── unauthorized/           # 403 page
│   ├── globals.css             # Global CSS variables + base styles
│   ├── layout.tsx              # Root layout (Providers, Navbar, Toaster)
│   └── page.tsx                # Landing page
│
├── components/
│   ├── admin/                  # Admin-specific UI (13 components)
│   ├── auth/                   # Login/signup forms (4 components)
│   ├── audit-logs/             # Audit log table + filter bar
│   ├── common/                 # Shared UI library (ui.tsx + navbar + etc.)
│   ├── pdf/                    # Receipt PDF template
│   ├── providers/              # React Query provider
│   ├── registration/           # Batch status list for registration
│   ├── student/                # Student-facing components
│   ├── super-admin/            # Super Admin UI (15 components)
│   ├── teacher/                # Teacher-facing components (5)
│   └── ui/                     # modal.tsx, toaster.tsx
│
├── utils/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── server.ts           # Server Supabase client (cookie-aware)
│   │   └── admin.ts            # Service-role client (bypasses RLS)
│   ├── audit-logger.ts         # withAuditLogging HOF + logAudit()
│   ├── api-wrapper.ts          # withErrorHandler HOF
│   ├── batch-validator.ts      # validateBatchCapacity()
│   ├── email-templates.ts      # HTML email template generator
│   └── logger.ts               # Sentry/console error logger
│
├── types/                      # TypeScript interfaces + Zod schemas
│   ├── admin-payment.ts
│   ├── batch.ts
│   ├── course.ts
│   ├── email.ts
│   ├── payment.ts
│   ├── qr.ts
│   ├── registration.ts
│   └── student.ts
│
├── lib/
│   ├── env.ts                  # Environment variable validation
│   └── validations.ts          # Shared Zod schemas (login, signup, etc.)
│
├── database_queries/           # 15 SQL migration files
├── docs/                       # Project documentation (this folder)
├── public/                     # Static assets, PWA manifest, service worker
├── middleware.ts               # Route protection + role-based redirect
├── next.config.js              # Next.js + PWA config
├── tailwind.config.js          # Theme tokens
├── tsconfig.json
└── package.json
```

---

## Environment Variables

Validated at startup by `lib/env.ts`. Missing required vars throw at build time in development.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key — used only server-side, bypasses RLS |
| `RESEND_API_KEY` | Yes | Resend email delivery key |
| `NEXT_PUBLIC_APP_URL` | Yes | Full app URL (e.g. `https://soa.vercel.app`) — used in email links |
| `NEXT_PUBLIC_SITE_URL` | No | Password reset redirect base |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry DSN for error tracking |
| `CRON_SECRET` | No | Bearer token for cron job authentication |
| `NODE_ENV` | Auto | Set by Next.js |

---

## Authentication & Authorisation

### Login flow

```
User submits identifier + password
    ↓
app/auth/actions.ts → login()
    ↓
If identifier is mobile (regex /^[6-9][0-9]{9}$/) →
    look up email in admin_users / teachers / students tables
    ↓
supabase.auth.signInWithPassword({ email, password })
    ↓
Query users table → { role, status, is_first_login }
    ↓
Fallback: query students table directly (for legacy records not in users table)
    ↓
Role-based redirect:
  super_admin → /super-admin/dashboard
  admin       → /admin/dashboard
  teacher     → /teacher/dashboard (or /teacher/force-password-change if is_first_login)
  student     → /student/dashboard
```

### Middleware protection (`middleware.ts`)

Every non-static request passes through middleware:

1. **Public paths** (no auth required): `/`, `/login`, `/signup`, `/register`, `/forgot-password`, `/auth/callback`, `/api/courses/public`, `/api/register`
2. If already logged in and on a public path → redirect to own dashboard
3. If no session → redirect to `/login?error=session_expired`
4. Resolve role from `users` table → check `status === 'Active'`
5. Enforce route-to-role mapping:

| Route prefix | Allowed roles |
|---|---|
| `/admin/*` | `admin`, `super_admin` |
| `/super-admin/*` | `super_admin` |
| `/teacher/*` | `teacher` |
| `/student/*` | `student` |

### Supabase client variants

| File | Usage | RLS |
|---|---|---|
| `utils/supabase/client.ts` | Browser components | Enforced |
| `utils/supabase/server.ts` | Server Components, API routes (user context) | Enforced |
| `utils/supabase/admin.ts` | API routes needing full access | **Bypassed** |

> **Rule of thumb:** All writes that affect another user's data (admin approving a payment, assigning a teacher) use the admin client. Student reads use the server client so RLS scopes the query.

---

## Routing Architecture

### Route groups by portal

```
Public
  /                           Landing page
  /login                      Unified login (email or mobile)
  /register                   Student self-registration
  /forgot-password            Password reset request
  /reset-password             Password reset (token)
  /payment/[student_id]       Payment submission (after registration)
  /unauthorized               403 error page

Student  (/student/*)
  /student/dashboard          Main student dashboard
  /student/reupload/[id]      Payment re-upload (legacy page — inline form now preferred)

Teacher  (/teacher/*)
  /teacher/dashboard          Batch list + student management
  /teacher/change-password    Voluntary password change
  /teacher/force-password-change  Forced on first login

Admin  (/admin/*)
  /admin/dashboard            Stats + recent payments
  /admin/payments             Payment verification queue
  /admin/students/lookup      Student record search
  /admin/teachers             Teacher management
  /admin/batches/[batchId]    Batch detail + enrolled students
  /admin/batches/assign-teacher  Assign teacher to batch
  /admin/reports/course-enrollment  Enrollment report

Super Admin  (/super-admin/*)
  /super-admin/dashboard      Full metrics overview
  /super-admin/courses        Course CRUD
  /super-admin/batches        Batch CRUD
  /super-admin/teachers       Teacher CRUD
  /super-admin/students       Student records
  /super-admin/payments       All payment records
  /super-admin/admins         Admin user management
  /super-admin/qr             Payment QR code management
  /super-admin/receipts       All receipts + cancellation
  /super-admin/receipts/[id]  Receipt detail
  /super-admin/reports        Reports + Excel export
  /super-admin/audit-logs     Action audit trail
  /super-admin/management     System management tools
```

---

## API Routes — Full Reference

### Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/auth/session` | Any | Returns current Supabase session |
| `GET` | `/api/auth/callback` | Public | Supabase OAuth/magic-link callback handler |

### Registration & Student

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/register` | Public | Student self-registration: creates/finds student, validates batch capacity, triggers confirmation email |
| `POST` | `/api/register-student` | Admin | Admin-initiated student registration |
| `GET` | `/api/student/dashboard` | Student | Returns student profile, latest payment, active enrollment. Auto-links `user_id` on first access. |

### Courses

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/courses` | Authenticated | All courses with metadata |
| `POST` | `/api/courses` | Super Admin | Create course (Zod-validated) |
| `GET/PATCH/DELETE` | `/api/courses/[id]` | Admin+ | Read/update/delete a course |
| `GET` | `/api/courses/public` | **Public** | Courses available for registration |

### Batches

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/batches` | Authenticated | All batches with course + teacher joins |
| `POST` | `/api/batches` | Super Admin | Create batch |
| `GET/PATCH/DELETE` | `/api/batches/[id]` | Admin+ | Read/update/delete a batch |
| `GET` | `/api/batches/options` | Authenticated | Dropdown-friendly batch list |
| `GET` | `/api/batches/public` | **Public** | Open batches for registration page |
| `GET` | `/api/admin/batches/list` | Admin+ | Paginated admin batch list |
| `POST` | `/api/admin/batches/assign-teacher` | Admin+ | Assign teacher to batch |

### Payments

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/payments` | Student (public) | Submit initial payment proof |
| `POST` | `/api/payments/upload` | Student | Pre-upload screenshot before form submit |
| `POST` | `/api/payments/reupload` | Student | Re-submit rejected payment (resets to Pending) |
| `GET` | `/api/admin/payments` | Admin+ | Paginated payments with status/batch/date filters |
| `PATCH` | `/api/admin/payments/[id]/approve` | Admin+ | Approve payment → generate receipt → enroll student |
| `PATCH` | `/api/admin/payments/[id]/reject` | Admin+ | Reject payment with reason + reupload flag |
| `POST` | `/api/payments/approve` | Admin+ | Legacy approve endpoint |
| `POST` | `/api/payments/reject` | Admin+ | Legacy reject endpoint |
| `DELETE` | `/api/payments/delete-screenshot` | Admin+ | Delete screenshot from storage |
| `GET` | `/api/payment-qr/active` | **Public** | Active QR code for payment instructions |
| `GET/POST` | `/api/payment-qr` | Super Admin | Manage QR codes |
| `GET` | `/api/payment-summary` | Student | Course fee + active QR for payment page |

### Receipts

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/receipts/generate` | Admin+ | Generate PDF receipt, upload to storage, store metadata |
| `GET` | `/api/receipts/download` | Student/Admin | Download receipt PDF by payment_id |
| `GET` | `/api/receipts/generate-number` | Admin+ | Generate next receipt number (calls DB function) |
| `POST` | `/api/admin/receipts/[receiptId]/cancel` | Admin+ | Cancel a receipt with reason |

### Teachers

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/teachers/create` | Admin+ | Create teacher + auth user |
| `GET` | `/api/teachers/list` | Admin+ | All teachers |
| `GET` | `/api/teacher/profile` | Teacher | Own profile |
| `GET` | `/api/teacher/batches` | Teacher | Assigned batches |
| `GET` | `/api/teacher/batches/[batchId]/students` | Teacher | Student list for a batch |
| `PATCH` | `/api/teacher/batches/[batchId]/checklist` | Teacher | Update books/ID card distribution |
| `POST` | `/api/teacher/force-password-change` | Teacher | Force-change password on first login |

### Admin Dashboard & Reporting

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard/stats` | Admin+ | Total admissions, pending payments, active batches |
| `GET` | `/api/admin/dashboard/pending` | Admin+ | Pending payment list for quick review |
| `GET` | `/api/admin/dashboard/occupancy` | Admin+ | Batch occupancy data |
| `GET` | `/api/admin/status` | Admin+ | System health |
| `GET` | `/api/admin/students/[id]` | Admin+ | Student detail |
| `GET` | `/api/admin/batch-students` | Admin+ | Students in a specific batch |
| `POST` | `/api/admin/reallocation` | Admin+ | Reallocate student to different batch (calls RPC) |
| `POST` | `/api/admin/create` | Super Admin | Create admin user |
| `GET` | `/api/admin/users` | Super Admin | All admin users |
| `GET` | `/api/admin/reports/course-enrollment` | Admin+ | Course enrollment data |
| `GET` | `/api/reports/download` | Admin+ | Download Excel report |
| `GET` | `/api/dashboard-metrics` | Admin+ | Aggregated metrics (uses DB views) |

### System

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/email/send` | Internal | Send email via Resend (called by other routes) |
| `GET` | `/api/audit-logs` | Super Admin | Paginated audit log with filters |
| `GET/POST` | `/api/notification-preferences` | Authenticated | Read/write notification preferences |
| `GET` | `/api/cron/cleanup-payment-screenshots` | Cron secret | Delete old approved-payment screenshots |
| `GET` | `/api/cron/batch-status-audit` | Cron secret | Reconcile batch enrollment counts + statuses |

---

## Page Routes — Full Reference

### Student Portal

| Page | File | Key data sources |
|---|---|---|
| Dashboard | `app/student/dashboard/page.tsx` | `GET /api/student/dashboard` (React Query) |
| Re-upload (legacy) | `app/student/reupload/[payment_id]/page.tsx` | Direct form to `POST /api/payments/reupload` |

**Dashboard sections:**
1. Welcome header (student name, email, active/inactive badge)
2. Rejection alert banner (full-width, only when `verification_status = 'Rejected'`) — contains inline `ReuploadProofForm`
3. Latest Payment card (status badge, course, amount, transaction ID, date, method)
4. Batch Allocation card (batch name, timing, teacher, schedule, mode)
5. Support footer

### Teacher Portal

| Page | File | Key functionality |
|---|---|---|
| Dashboard | `app/teacher/dashboard/page.tsx` | Batch cards, student tables, distribution toggles |
| Force password change | `app/teacher/force-password-change/page.tsx` | Mandatory on `is_first_login = true` |
| Change password | `app/teacher/change-password/page.tsx` | Voluntary password change |

### Admin Portal

| Page | File | Key functionality |
|---|---|---|
| Dashboard | `app/admin/dashboard/page.tsx` | Stats cards, pending payments queue |
| Payments | `app/admin/payments/page.tsx` | Paginated table, filter bar, approve/reject modal |
| Students lookup | `app/admin/students/lookup/page.tsx` | Search + profile view |
| Teachers | `app/admin/teachers/page.tsx` | Teacher list, create form |
| Batch detail | `app/admin/batches/[batchId]/page.tsx` | Enrolled students, re-allocation |
| Assign teacher | `app/admin/batches/assign-teacher/page.tsx` | Teacher assignment UI |
| Enrollment report | `app/admin/reports/course-enrollment/page.tsx` | Chart + export |

### Super Admin Portal

| Page | File | Key functionality |
|---|---|---|
| Dashboard | `app/super-admin/dashboard/page.tsx` | Full metrics: admissions, revenue, batch strength, course enrollment chart |
| Courses | `app/super-admin/courses/page.tsx` | Full course CRUD |
| Batches | `app/super-admin/batches/page.tsx` | Full batch CRUD + teacher assignment |
| Teachers | `app/super-admin/teachers/page.tsx` | Create, list, manage teachers |
| Students | `app/super-admin/students/page.tsx` | All student records |
| Payments | `app/super-admin/payments/page.tsx` | Full payment history |
| Admins | `app/super-admin/admins/page.tsx` | Create and manage admin accounts |
| QR codes | `app/super-admin/qr/page.tsx` | Upload/activate payment QR |
| Receipts | `app/super-admin/receipts/page.tsx` | All receipts, cancel actions |
| Reports | `app/super-admin/reports/page.tsx` | Filtered reports, Excel download |
| Audit logs | `app/super-admin/audit-logs/page.tsx` | Admin action trail |
| Management | `app/super-admin/management/page.tsx` | Batch status reconciliation, backup logs |

---

## Components — Full Reference

### `components/common/ui.tsx`
The core UI component library. All components here are pure Tailwind + React — no external component library dependency.

| Export | Type | Purpose |
|---|---|---|
| `Modal` | Component | Basic modal (backdrop blur, overlay click to close) — use `components/ui/modal.tsx` for accessible version |
| `Sheet` / `SheetContent` / `SheetHeader` / `SheetTitle` / `SheetDescription` | Components | Slide-over panel (used in payment detail) |
| `Badge` | Component | Status pills — variants: `success`, `warning`, `danger`, `destructive`, `info`, `outline`, `default`, `secondary` |
| `Card` / `CardHeader` / `CardTitle` / `CardDescription` / `CardContent` | Components | Card layout primitives |
| `Table` / `TableHeader` / `TableBody` / `TableRow` / `TableHead` / `TableCell` | Components | Data table primitives |
| `Button` | Component | Variants: `primary`, `secondary`, `outline`, `danger`, `ghost`, `destructive`. Sizes: `sm`, `md`, `lg` |
| `Input` | Component | Styled `<input>` |
| `Textarea` | Component | Styled `<textarea>` |
| `Select` | Component | Native `<select>` with chevron |
| `Label` | Component | Styled `<label>` |
| `Switch` | Component | Toggle switch |
| `Skeleton` / `CardSkeleton` / `TableSkeleton` | Components | Loading placeholders |
| `InlineButtonLoader` | Component | Button with spinner overlay during loading |
| `OptimisticStatusBadge` | Component | Badge with optimistic update pulse animation |
| `ApiError` | Component | Inline field-level error message |
| `SelectRoot` / `SelectTrigger` / `SelectValue` / `SelectContent` / `SelectItem` | Components | Composable select dropdown (mimics Radix UI API) |

### `components/ui/modal.tsx`
Accessible modal replacing `ui.tsx`'s basic Modal. Features:
- **Focus trap** — Tab/Shift+Tab cycle confined to modal panel
- **Focus restoration** — returns focus to trigger element on close
- **Escape to close** — keydown listener
- **Scroll lock** — `body.overflow = 'hidden'` while open
- **`aria-modal`, `aria-labelledby`, `aria-describedby`** attributes
- `maxWidth` prop (Tailwind class, defaults to `max-w-md`)

### `components/ui/toaster.tsx`
Thin wrapper around Sonner's `<Toaster>` pre-configured with:
- Position: `top-right`
- Rich colours enabled
- Close button enabled
- `Work Sans` font, 0.9rem size

**Usage in any component:** `import { toast } from 'sonner'` then `toast.success(...)` / `toast.error(...)`.

### Auth Components

| Component | File | Purpose |
|---|---|---|
| `LoginForm` | `components/auth/LoginForm.tsx` | Unified email/mobile login. Calls `login()` server action. Password toggle, Loader2 spinner, Sonner toasts on error. |
| `SignupForm` | `components/auth/SignupForm.tsx` | Student account creation with name, email, phone, password. |
| `AdminLoginForm` | `components/auth/AdminLoginForm.tsx` | Admin-branded login form |
| `SignOutButton` | `components/auth/SignOutButton.tsx` | Confirmation modal before calling `logout()`. Variants: `ghost`, `danger`. |

### Admin Components

| Component | File | Purpose |
|---|---|---|
| `PaymentsTable` | `payments-table.tsx` | Paginated payment list. Props: `payments`, `pagination`, `onPageChange`, `onActionComplete`. |
| `PaymentDetailModal` | `payment-detail-modal.tsx` | Slide-over with payment details + "Reject Payment" button for Pending payments. |
| `PaymentRejectionModal` | `PaymentRejectionModal.tsx` | Rejection modal: preset reasons, custom textarea, allow-reupload toggle, destructive submit. |
| `PaymentFilterBar` | `payment-filter-bar.tsx` | Search, status filter, batch dropdown, date range picker. |
| `BatchStudentsTable` | `BatchStudentsTable.tsx` | Enrolled students in a batch with re-allocation action. |
| `EnrollmentReportChart` | `EnrollmentReportChart.tsx` | Recharts bar chart for course enrollment data. |
| `AssignTeacherCard` | `assign-teacher-card.tsx` | Batch-to-teacher assignment UI. |
| `CreateTeacherForm` | `create-teacher-form.tsx` | Teacher creation form. |
| `StudentProfileForm` | `student-profile-form.tsx` | Admin edit of student profile. |
| `StudentSearch` | `student-search.tsx` | Student lookup by name/email/phone. |
| `TeacherListTable` | `teacher-list-table.tsx` | Teacher list with actions. |
| `CancellationForm` | `receipts/cancellation-form.tsx` | Receipt cancellation form with reason. |
| `ReceiptSummaryCard` | `receipts/receipt-summary-card.tsx` | Receipt detail display card. |

### Super Admin Components

| Component | File | Purpose |
|---|---|---|
| `Shell` | `shell.tsx` | Layout shell: sidebar + navbar, responsive toggle |
| `Sidebar` | `sidebar.tsx` | Navigation sidebar with role-aware links |
| `Navbar` | `navbar.tsx` | Top navigation bar |
| `MetricCards` | `dashboard/metric-cards.tsx` | KPI cards: admissions, revenue, pending, active batches |
| `BatchOccupancyTable` | `dashboard/batch-occupancy-table.tsx` | Batch seat utilisation table |
| `CourseEnrollmentTable` | `dashboard/course-enrollment-table.tsx` | Per-course student count |
| `BatchForm` / `BatchPage` | `batch-form.tsx` / `batch-page.tsx` | Batch CRUD |
| `CourseForm` / `CoursePage` | `course-form.tsx` / `course-page.tsx` | Course CRUD |
| `CreateAdminForm` | `create-admin-form.tsx` | Admin user creation |
| `AdminListTable` | `admin-list-table.tsx` | Admin account list |
| `PaymentVerification` | `payment-verification.tsx` | Payment verification UI |
| `QrUploadForm` | `qr-upload-form.tsx` | QR code image upload |
| `ReportsFilterCard` | `reports-filter-card.tsx` | Report filtering controls |

### Teacher Components

| Component | File | Purpose |
|---|---|---|
| `BatchCard` | `batch-card.tsx` | Teacher's assigned batch summary |
| `StudentTable` | `student-table.tsx` | Students in teacher's batch |
| `ChecklistCard` | `checklist-card.tsx` | Distribution checklist overview |
| `BooksDistributionToggle` | `books-distribution-toggle.tsx` | Per-student books distribution toggle |
| `IdCardToggle` | `id-card-toggle.tsx` | Per-student ID card distribution toggle |

### Student Components

| Component | File | Purpose |
|---|---|---|
| `ReuploadProofForm` | `student/ReuploadProofForm.tsx` | Inline re-upload form: drag/drop screenshot + transaction ID. Calls `POST /api/payments/reupload`. |

### Other Components

| Component | File | Purpose |
|---|---|---|
| `ReceiptDocument` | `pdf/receipt-document.tsx` | `@react-pdf/renderer` PDF template for payment receipts |
| `BatchStatusList` | `registration/batch-status-list.tsx` | Shows available batches during registration |
| `AuditTable` | `audit-logs/audit-table.tsx` | Paginated audit log display |
| `AuditFilterBar` | `audit-logs/filter-bar.tsx` | Audit log filters (action type, date, user) |
| `NotificationPreferencesCard` | `common/notification-preferences-card.tsx` | Email/SMS opt-in toggles |
| `AccessDenied` | `common/access-denied.tsx` | 403 display component |
| `ResponsiveNavbar` | `common/responsive-navbar.tsx` | Public-facing navbar (hamburger drawer on mobile) |
| `NavbarWrapper` | `common/NavbarWrapper.tsx` | Hides navbar on `/admin` and `/super-admin` routes |
| `Providers` | `providers/query-provider.tsx` | Wraps app in `QueryClientProvider` |

---

## Utility Modules

### `utils/audit-logger.ts`

**`logAudit(params)`**
Non-blocking fire-and-forget audit insert using the admin client.
```typescript
logAudit({
  actionType: 'PAYMENT_APPROVED',
  entityType: 'payment',
  entityId: paymentId,
  userId: adminUserId,
  details: { amount, student_id },
  clientInfo: { userAgent, ip }
})
```

**`withAuditLogging(handler, config)`**
Higher-order function wrapping a Next.js route handler. Automatically logs on 2xx responses.
```typescript
export const PATCH = withAuditLogging(myHandler, {
  actionType: 'PAYMENT_REJECTED',
  entityType: 'payment',
  entityIdResolver: (req, result) => result.payment_id,
  detailsResolver: (req, result) => ({ reason: result.reason })
})
```

### `utils/api-wrapper.ts`

**`withErrorHandler(handler)`**
Wraps a route handler. On uncaught exception: logs via `logError()`, returns `{ error: message }` with status 500.

### `utils/batch-validator.ts`

**`validateBatchCapacity(batchId)`** → `{ allowed: boolean, reason?: string }`
Pre-insert capacity check using the admin client. Validates UUID format, batch existence, status, and `current_enrollment_count < max_capacity`.

> Used as a **pre-flight UX check** in the approval route. The **authoritative enforcement** is the database trigger `trg_check_batch_capacity`.

### `utils/logger.ts`

**`logError(error, context?)`**
Sends to Sentry if `NEXT_PUBLIC_SENTRY_DSN` is set; otherwise falls back to `console.error`.

### `lib/env.ts`

Exports a validated `env` object:
```typescript
env.supabase.url
env.supabase.anonKey
env.supabase.serviceRoleKey
env.resend.apiKey
env.app.url
```
Throws at startup in development if any required variable is missing.

### `lib/validations.ts`

| Schema | Purpose |
|---|---|
| `loginIdentifierSchema` | Email OR 10-digit Indian mobile (`/^[6-9][0-9]{9}$/`) |
| `loginSchema` | Legacy email-only login |
| `signupSchema` | Student registration (name, email, phone, password, confirmPassword) |
| `studentDetailsSchema` | Profile update fields |
| `forgotPasswordSchema` | Email for reset |
| `dateRangeSchema` | Start/end date with cross-field validation |

---

## Data Flow Walkthroughs

### 1. Student Registration → Payment → Approval → Enrollment

```
[1] Student fills /register
        ↓ POST /api/register
        ↓ Validate (Zod: studentRegistrationSchema)
        ↓ Find or create student record
        ↓ Check batch capacity (validateBatchCapacity)
        ↓ Check for duplicate active enrollments
        ↓ Trigger REGISTRATION_CONFIRMATION email
        ↓ Redirect → /payment/[student_id]

[2] Student submits payment on /payment/[student_id]
        ↓ POST /api/payments
        ↓ Validate fields + file (type, size)
        ↓ Check student exists
        ↓ Check batch is Open + get fee from courses.total_fee
        ↓ Check no duplicate Pending payment for same student+batch
        ↓ Upload screenshot to storage: payment-screenshots/{student_id}/{payment_id}.ext
        ↓ INSERT into payments (status = 'Pending')
        ↓ INSERT into system_logs
        ↓ Fire PAYMENT_SUBMITTED email (non-blocking)

[3] Admin opens /admin/payments → sees Pending row
        ↓ Clicks View → PaymentDetailModal opens
        ↓ Admin clicks Approve
        ↓ PATCH /api/admin/payments/[id]/approve
        ↓ Fetch payment + student + course + batch
        ↓ UPDATE payments SET verification_status = 'Approved'
        ↓ POST /api/receipts/generate
          → generate_receipt_number() → SO/2025-26/0042
          → render PDF (ReceiptDocument)
          → upload to storage
          → INSERT into receipts
        ↓ validateBatchCapacity() pre-flight
        ↓ INSERT into batch_enrollments
          → trg_check_batch_capacity trigger fires
          → FOR UPDATE lock on batch row
          → live COUNT(*) check passes
          → insert succeeds
        ↓ Fire PAYMENT_APPROVED email (with receipt PDF attached)
        ↓ Fire BATCH_ALLOCATED email
        ↓ withAuditLogging writes to audit_logs

[4] Student refreshes /student/dashboard
        ↓ GET /api/student/dashboard
        ↓ Returns payment (status = Approved, receipt), enrollment, batch
        ↓ Dashboard shows Download Receipt button + Batch Allocation card
```

### 2. Payment Rejection → Student Re-upload

```
[1] Admin rejects on /admin/payments
        ↓ PaymentDetailModal → "Reject Payment"
        ↓ PaymentRejectionModal: select preset reason + toggle reupload
        ↓ PATCH /api/admin/payments/[id]/reject
        ↓ UPDATE payments SET
            verification_status = 'Rejected',
            rejection_remarks = reason,
            reupload_allowed = true/false
        ↓ Fire PAYMENT_REJECTED email with rejection_reason
        ↓ withAuditLogging → audit_logs

[2] Student sees /student/dashboard
        ↓ GET /api/student/dashboard returns payment with status = 'Rejected'
        ↓ Rejection alert banner renders (red border, reason text)
        ↓ If reupload_allowed = true → ReuploadProofForm renders inline

[3] Student fills ReuploadProofForm
        ↓ POST /api/payments/reupload (multipart FormData)
        ↓ Verify auth + role (users table lookup)
        ↓ Ownership check: payment.student_id = student.student_id
        ↓ Status check: must be 'Rejected'
        ↓ reupload_allowed check: must be true
        ↓ Upload new screenshot to storage (new filename with timestamp)
        ↓ Delete old screenshot from storage
        ↓ UPDATE payments SET
            verification_status = 'Pending',
            transaction_id = new_id,
            payment_date = today,
            payment_screenshot_path = new_path,
            reupload_allowed = false,   ← prevents double re-upload
            rejection_remarks = null,
            resubmitted_at = now()
        ↓ INSERT into system_logs (PAYMENT_RESUBMITTED)
        ↓ toast.success → dashboard refetches via React Query
```

### 3. Teacher First Login

```
Student / Admin creates teacher account
    ↓ INSERT into teachers (is_first_login = true)
    ↓ INSERT into auth.users (via Supabase admin)
    ↓ INSERT into users (role = 'Teacher', status = 'Active')

Teacher logs in
    ↓ auth/actions.ts → login()
    ↓ users table → role = 'teacher', is_first_login = true
    ↓ redirect('/teacher/force-password-change')

Teacher submits new password
    ↓ updateTeacherPassword() server action
    ↓ supabase.auth.updateUser({ password })
    ↓ UPDATE teachers SET is_first_login = false
    ↓ redirect('/teacher/dashboard')
```

---

## Background Jobs (Cron)

Both cron routes are `GET` endpoints protected by a `CRON_SECRET` bearer token in the `Authorization` header.

### `/api/cron/cleanup-payment-screenshots`

**Trigger:** External cron scheduler (e.g. Vercel Cron)
**Frequency:** Recommended: daily

**What it does:**
1. Queries payments where `verification_status = 'Approved'` AND `screenshot_deleted = false` AND `created_at < 30 days ago`
2. For each: deletes file from `payment-screenshots` storage bucket
3. Updates `payments.screenshot_deleted = true`, `screenshot_deleted_at = now()`
4. Returns count of deleted files

**Why:** Approved payments no longer need their screenshot stored. Reduces storage cost and removes PII.

---

### `/api/cron/batch-status-audit`

**Trigger:** External cron scheduler
**Frequency:** Recommended: weekly (Sunday 3 AM IST as noted in code)

**What it does:**
1. Fetches all batches with `batch_status != 'Closed'`
2. For each batch: counts actual active enrollments from `batch_enrollments`
3. If live count != `current_enrollment_count` → updates the cached count
4. If live count >= `max_capacity` AND status != 'Full' → sets `batch_status = 'Full'`
5. If live count < `max_capacity` AND status = 'Full' → sets `batch_status = 'Open'`
6. Logs each correction to `audit_logs`

**Why:** The denormalised `current_enrollment_count` can drift if DB operations fail mid-transaction. This job reconciles it weekly.

---

## Email System

### Architecture

```
API route detects email event
    ↓ fire-and-forget fetch to POST /api/email/send
    ↓ /api/email/send calls getEmailTemplate(type, metadata)
    ↓ Resend API sends HTML email
    ↓ INSERT into system_logs (EMAIL_SENT or EMAIL_FAILED)
```

All email calls in API routes are **non-blocking** (no `await`, wrapped in try/catch). A failed email never fails the main transaction.

### Email Types

| Type | Trigger | Key metadata |
|---|---|---|
| `REGISTRATION_CONFIRMATION` | Student registers | `student_name`, `course_name` |
| `PAYMENT_SUBMITTED` | Payment proof submitted | `student_name`, `transaction_id`, `amount` |
| `PAYMENT_APPROVED` | Admin approves | `student_name`, `course_name`, `batch_name`, `receipt_number` + PDF attachment |
| `PAYMENT_REJECTED` | Admin rejects | `student_name`, `rejection_reason` |
| `BATCH_ALLOCATED` | Enrollment created on approval | `student_name`, `course_name`, `batch_name` |
| `TEACHER_BATCH_ASSIGNED` | Teacher assigned to batch | `teacher_name`, `course_name`, `batch_name`, `batch_timing`, `start_date` |

### Template structure

All emails use `getEmailTemplate()` in `utils/email-templates.ts`. The base template provides:
- Header strip: orange (`#FF8C42`) with "Speak Orange Academy"
- Body: padded white content area
- Footer: beige (`#F0E4D7`) with copyright
- Fonts: Outfit (headings), Work Sans (body) via Google Fonts

---

## PDF & Receipt System

### Generation flow (`/api/receipts/generate`)

1. Fetch payment + student + course + batch data
2. Call `generate_receipt_number()` PostgreSQL function → returns e.g. `SO/2025-26/0042`
3. Render `<ReceiptDocument />` using `@react-pdf/renderer` server-side
4. Upload PDF buffer to Supabase storage
5. INSERT into `receipts` table (receipt_number, receipt_pdf_path)
6. Return receipt_number + public URL to caller

### Receipt number format

```
SO / YYYY-YY / XXXX
     ↑          ↑
  Financial   Zero-padded
  year        sequence
  (Apr–Mar)   (resets each FY)

Example: SO/2025-26/0001
```

Atomic generation: `receipt_sequences` table uses `INSERT ... ON CONFLICT DO UPDATE SET last_number = last_number + 1` — safe under concurrent receipt generation.

### Cancellation

Admin can cancel a receipt via `POST /api/admin/receipts/[receiptId]/cancel`. Sets `receipts.status = 'Cancelled'`, records `cancellation_reason`, `cancelled_by`, `cancelled_at`.

---

## PWA & Caching

Configured in `next.config.js` via `next-pwa`:

| Asset type | Strategy | TTL |
|---|---|---|
| JS/CSS/images | `CacheFirst` | 30 days |
| HTML pages | `StaleWhileRevalidate` | — |
| API routes | `NetworkOnly` | — |

Manifest at `public/manifest.json`. Service worker at `public/sw.js`.
Theme colour: `#FF8C42` (orange — matches brand).

---

## Error Handling & Observability

### Layers

| Layer | Mechanism |
|---|---|
| API routes | `withErrorHandler()` HOF catches unhandled exceptions, logs via Sentry, returns clean 500 JSON |
| Route handlers (admin) | `withAuditLogging()` HOF also catches and re-throws, ensuring audit log is written even on failure |
| Client-side | `sonner` toast for user-facing errors |
| Background | `logError()` in email send, cron jobs |
| Auth errors | Middleware redirects to `/login?error=...` with error code in query string |

### Error codes in login redirect

| Code | Meaning |
|---|---|
| `session_expired` | No active session |
| `account_not_found` | `users` table row missing or `status !== 'Active'` |
| `unauthorized` | Role doesn't match route prefix |

---

## Styling System

### CSS custom properties (`app/globals.css`)

```css
--color-bg:        #FFF9F4   /* page background */
--color-surface:   #FFFFFF   /* card/input surface */
--color-border:    #F0E4D7   /* borders */
--color-text:      #2C2416   /* primary text */
--color-text-muted:#8B7355   /* secondary text */
--color-primary:   #FF8C42   /* orange — brand primary */
--color-accent:    #D94E1F   /* darker orange — hover states */
--color-success:   #4CAF50
--color-warning:   #FFC107
--color-danger:    #E53935
```

Each colour also has RGB triplet variants (e.g. `--color-primary-rgb: 255, 140, 66`) for Tailwind opacity utilities like `bg-primary/10`.

### Tailwind config (`tailwind.config.js`)

Maps all CSS variables into Tailwind utilities:
```js
colors: {
  bg: 'var(--color-bg)',
  surface: 'var(--color-surface)',
  primary: 'var(--color-primary)',
  // ...etc
}
```

Custom fonts:
```js
fontFamily: {
  heading: ['Outfit', 'sans-serif'],
  body:    ['Work Sans', 'sans-serif'],
}
```

Custom animations:
- `animate-fade-up` — slides content up on mount
- `animate-micro-bounce` — small bounce for interactive elements

### Conventions

- **Cards:** `className="card"` global style or `<Card>` component
- **Tap targets:** `className="tap-target"` ensures 44px minimum touch area on mobile
- **Inline styles:** Used alongside Tailwind in dashboard pages for rapid layout (not ideal but consistent within the codebase)

---

## Known Gaps & Technical Debt

| Issue | Location | Impact | Notes |
|---|---|---|---|
| `current_enrollment_count` drift | `batches` table | Low — weekly cron reconciles it | Denormalised counter is display-only; trigger uses live count |
| `app_metadata.app_role` not set | Several RLS policies, old reupload route | Medium — policies using JWT claim won't work | Reupload route now fixed to use `users` table lookup |
| Legacy login endpoints | `/api/payments/approve`, `/api/payments/reject` | Low | Duplicate of admin endpoints; should be removed |
| `student/reupload/[id]` page | `app/student/reupload/` | Low | Now superseded by inline `ReuploadProofForm` on dashboard |
| No optimistic updates on approve | Admin payments table | UX — table requires manual refetch trigger | `onActionComplete` prop added; admin page needs to wire `refetch` |
| Debug scripts at root | `db_check.mjs`, `debug_*.mjs` etc. | Low — dev only | Should be moved to a `scripts/` folder or gitignored |
| `teacher-list-table.tsx` import path | Named `TeacherListTable.tsx` in component but referenced as `teacher-list-table` | Build-risk on case-sensitive filesystems (Linux) | Normalise to consistent casing |
| Email opt-out not enforced server-side | `notification_preferences` table exists | Medium | `notification_preferences.email_opt_in` is stored but `api/email/send` doesn't check it before sending |
| `backup_verification_logs` RLS policy | Uses `app_metadata.app_role` JWT claim | Low — internal tool only | Same JWT claim issue as above |

---

*Last updated: 2026-04-01 | Compiled from full source analysis of soa_app/*
