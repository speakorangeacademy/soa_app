# Application Context — Speak Orange Academy (SOA)

> A living document that explains **what this app is, why it works the way it does, and how its pieces fit together.**
> Last updated: 2026-03-31

---

## 1. What Is This Application?

Speak Orange Academy is a **language institute management platform** built specifically to replace a manual, paper-and-spreadsheet workflow with a structured digital one. The core problem it solves: a student wants to join a course, pays a fee, and the institute needs to reliably track that payment, allocate the student to the right batch, assign a teacher, and generate a receipt — all without things slipping through the cracks.

The app covers the full student journey from the moment they register on a public page, through fee submission and verification, all the way to viewing their batch schedule and downloading their receipt. On the institute's side, admins verify payments, manage capacity, and run reports; teachers see their assigned students; and a super admin controls everything at the configuration level.

---

## 2. Who Uses It and What They Can Do

The application is built around **four distinct roles**, each with their own isolated view of the system. This is not just a permissions thing — it reflects how the institute actually operates. Each role has a completely separate dashboard and can only ever see and do what is relevant to them.

**Students** are the end users. They register themselves publicly, submit their payment proof, and then log back in to check their enrollment status, see their batch timings, and download their receipt. They cannot see other students or any administrative data.

**Teachers** are created by the admin, not by self-registration. Their job in the app is narrow but important: view the students assigned to their batches and manage a per-batch checklist. They have no access to payments or administrative functions. The first time a teacher logs in, they are forced to change their password before they can access anything else.

**Admins** are the operational staff. Their primary responsibility is verifying payment screenshots and managing the day-to-day: assigning teachers to batches, looking up students, and running enrollment reports. They can act on what is happening but cannot change the fundamental structure of courses or batches — that belongs to the Super Admin.

**Super Admins** have full control over the system's configuration. They create courses, create batches, manage the UPI QR code used for payments, view the complete audit trail of every action taken in the system, and oversee all admins, teachers, students, and payments.

---

## 3. How the Application Is Built

The app is a **Next.js web application** — a React-based framework that handles both the frontend (what users see) and the backend (API logic) in a single codebase. This means there is no separate backend server; the API routes and the UI pages live together.

All data is stored in **Supabase**, which provides a PostgreSQL database, file storage (for payment screenshots and PDF receipts), and user authentication. Supabase handles the security layer at the database level — every user can only read or write the rows they are permitted to, enforced by rules that live in the database itself.

Authentication uses **email or mobile number + password**. Sessions are stored in secure cookies and validated on every single page load by middleware that runs before any page or API endpoint is reached. If someone tries to access `/admin/*` without an admin session, they are turned away immediately — they never even reach the page.

For emails (payment confirmations, password resets), the app uses **Resend** as the email delivery service. For PDF receipt generation, it renders React components directly into PDF files on the server. For error monitoring in production, **Sentry** captures any unhandled exceptions silently in the background.

---

## 4. The Core Concept: How a Student Becomes Enrolled

The most important workflow in the entire application is the path from "prospective student" to "enrolled and allocated." Understanding this flow explains why most of the app exists.

A student starts at the public registration page — no login required. They fill in their personal details and choose a course and batch. At this point they are only *registered*, not enrolled. Registration just creates their profile in the system. True enrollment only happens after payment is verified.

After registering, the student is immediately taken to the payment page. Here they see the academy's UPI QR code, scan it, make the payment through their phone's payment app, and then come back to upload a screenshot of the transaction as proof. They also enter the transaction ID and date manually. The system stores this as a **pending payment** — nothing is confirmed yet.

An admin then reviews the screenshot. They look at it, compare it with the details entered, and either approve or reject it. This manual verification step is deliberate — it is the institute's control point to confirm money actually arrived before committing a batch seat.

When a payment is **approved**, several things happen automatically in sequence: the student is formally enrolled in the batch, the batch's seat count goes up by one (and if it hits capacity, the batch closes automatically), and a numbered PDF receipt is generated and stored. The student can then log in to their dashboard and see their batch details and download the receipt.

If a payment is **rejected**, the admin can leave a reason and optionally allow the student to re-upload a corrected screenshot. The student sees the rejection reason on their dashboard and, if permitted, can submit a new screenshot without going through the registration process again.

---

## 5. How Batches and Courses Work

Courses and batches have a parent-child relationship. A **course** is the subject offering — it has a name, a level (Beginner, Intermediate, Advanced), and a fee. A **batch** is a scheduled run of a course — it has specific timings, start and end dates, a maximum capacity, and optionally an assigned teacher.

A batch goes through three states: **Open** (accepting students), **Full** (capacity reached, no new enrollments), and **Closed** (manually shut by the admin). The transition from Open to Full is automatic — as soon as the last available seat is filled by a payment approval, the system closes the batch on its own.

This design means the admin does not need to monitor seat counts manually. The batch simply becomes unavailable on the registration page once it fills up.

---

## 6. The Access Control Philosophy

The application enforces access control at multiple layers, and this is intentional — one layer failing should not expose data.

The first layer is the **middleware**, which runs before every page and API request. It reads the user's session, looks up their role and account status, and checks whether the route they are trying to reach matches their role. A teacher cannot reach any `/admin/*` URL, period.

The second layer is the **database itself**. Even if someone bypassed the middleware (hypothetically), the database's Row-Level Security rules would prevent them from reading rows that don't belong to them. A student's query to the database will only ever return their own records, regardless of what they ask for.

The third layer is **input validation**. Every form submission and API call validates the incoming data against a strict schema before anything touches the database. Wrong data types, impossible dates, missing fields — all rejected at the boundary.

---

## 7. The Audit Trail

Every significant action in the system — submitting a payment, approving it, rejecting it, creating a teacher, enrolling a student — writes a record to an audit log. This log captures what happened, to which entity, and when.

The purpose is accountability. If a payment was approved and then a dispute arises, the super admin can look at the audit log and see exactly when it happened. If a student claims they submitted a re-upload, the log will confirm or deny it. This is not a debugging tool — it is a business record.

---

## 8. The Receipt System

Receipts are more than just a download — they are the institute's formal acknowledgment of payment. Each receipt gets a **sequential receipt number** (like an invoice number), generated by the database to ensure no two receipts ever share a number, even under concurrent approvals.

The receipt PDF is generated entirely on the server side, containing the student's name, course, batch, amount paid, transaction ID, and the official receipt number. The file is then stored in the cloud and linked to the payment record. Students download it from their dashboard; the super admin can access any receipt from the admin panel.

---

## 9. Payment QR Code Management

Rather than hardcoding a payment QR image, the system manages it dynamically. The Super Admin can upload a new QR code at any time, and only one QR code is ever "active" at a given moment. Every payment page in the app fetches the active QR dynamically, so if the academy changes its UPI handle or bank, the super admin updates it once and every student immediately sees the new QR — no code deployment needed.

---

## 10. How the Pages Are Organized

The application's pages follow a clear hierarchy based on role. All public-facing pages (landing, registration, login, payment) require no authentication. Once logged in, each user type is confined to their own section:

- Students live under `/student/`
- Teachers live under `/teacher/`
- Admins live under `/admin/`
- Super Admins live under `/super-admin/`

Attempting to navigate to a section you do not belong to results in a redirect, not an error. The system assumes mis-navigation is accidental, not malicious, and simply sends the user to the right place.

---

## 11. Key Design Decisions Worth Knowing

**Login by mobile number.** Students and teachers often do not remember their email, so the login page accepts a 10-digit mobile number as an alternative. The system looks up the associated account behind the scenes.

**Registration does not equal enrollment.** These are two separate events. This is important because it means a student can register but not be enrolled if their payment fails or is rejected. The system tracks both states distinctly.

**No self-service for teachers.** Teachers are created by admins, not by self-registration. This prevents unauthorized access and keeps teacher accounts under institutional control.

**Batch capacity is enforced by the system, not by trust.** The app does not rely on admins remembering to close a batch when it is full. It is automatic. Similarly, the database-level enrollment guard prevents double-enrollments even if two admins approve payments simultaneously.

**Receipts are immutable once generated.** A receipt number, once assigned, is permanent. If a payment is later cancelled (which the system supports via a cancellation schema), the original receipt is not deleted — a cancellation record is created instead, preserving the financial trail.

---

## 12. Folder Purpose Summary

| Folder | What lives there |
|---|---|
| `app/` | Every page the user sees and every API endpoint, organized by role |
| `components/` | Reusable UI pieces — forms, tables, cards, modals — grouped by which role uses them |
| `utils/` | Behind-the-scenes helpers: database clients, email templates, audit logging, error handling |
| `lib/` | App-wide configuration: environment variable access and shared validation rules |
| `types/` | The data shapes the application works with — what a student looks like, what a payment contains |
| `hooks/` | Custom data-fetching logic reused across multiple pages |
| `database_queries/` | SQL files representing each schema change or feature addition to the database |
| `public/` | Static files: images, icons, the PWA manifest |
