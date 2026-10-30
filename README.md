# SkillPulse LMS — Modern Learning Platform & External Course Marketplace

SkillPulse is a production-ready, full-stack learning platform web application built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma**, **PostgreSQL (Neon)**, and **Auth.js (NextAuth)**.

It provides a unified enterprise learning experience by seamlessly combining:
1. **Internal Courses:** In-house masterclasses with video, text, PDF, and interactive quiz lessons hosted directly on the platform with automated progress tracking and PDF certificate generation.
2. **External Courses:** Curated direct links to accredited external courses (e.g., Udemy, Coursera, edX). Clicking "Go to course" opens the external URL in a new tab with explicit outbound notices, click telemetry, and student self-reported progress tracking.
3. **Curated Learning Paths:** Admin-curated career roadmaps sequencing internal workshops and external certifications with composite progress tracking.

---

## 🚀 Key Features

### For Students
- **Dynamic Catalog:** Fast, responsive course discovery with full-text search, category chips, level filters, and distinct badges (`On Platform` vs `External (Udemy)`).
- **Interactive Roadmap View (`/paths/[slug]`):** Ordered career paths showing required vs. optional milestones, curator guidance notes, and completion checklists.
- **Dedicated Classroom Player (`/learn/[slug]`):** Video lectures, rich architectural reading material, PDF manual downloads, interactive quiz assessments, collapsible curriculum sidebar, and position memory.
- **Student Dashboard (`/dashboard`):** My enrolled courses, external courses tracked, enrolled roadmaps, verified **PDF Certificate generation** (downloadable in landscape format), and account security.
- **Security & Password Management:** Mandatory password reset on first login for admin-provisioned accounts.

### For Administrators (`/admin`)
- **Executive Dashboard:** Live metrics for users, courses, learning paths, and enrollments, plus audit activity feeds.
- **Courses Management:** Table with status/type filters, search, pagination, bulk publish/archive/delete, and a full course editor.
  - **External Courses:** Requires HTTPS validation, provider selection (Udemy, Coursera, YouTube, Other), and disclaimer generation.
  - **Internal Courses:** Visual curriculum builder with sections, lesson reordering, rich text editor, and media upload abstraction.
- **Learning Paths Studio:** Visual builder to search, add, and sequence courses, mark steps as required/optional, and add milestone notes.
- **Category Hierarchy:** Nested category manager.
- **User Management & Bulk CSV Import:**
  - Create individual accounts with temporary passwords.
  - Bulk import users from CSV (`name,email,role`).
  - Activate, deactivate, reset credentials, or generate password reset tokens.
  - Bulk enroll selected users into courses or learning paths.
- **Homepage Builder:** Live configuration of Hero text/CTA, featured courses, featured learning paths, and domain categories.
- **Reports & Analytics:** Course enrollment numbers, completion rates, and active learners with instant **CSV Export**.
- **Audit Logs:** Tamper-evident administrative audit trail tracking user creation, course publishing, and outbound clicks.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, Server Components, Server Actions) |
| **Language** | TypeScript (Strict mode) |
| **Styling** | Tailwind CSS with responsive layout & smooth micro-animations |
| **Icons** | Lucide React |
| **Database** | PostgreSQL (Neon serverless ready) |
| **ORM** | Prisma 5 with singleton pattern and resilient `safeDbQuery` fallback |
| **Authentication** | NextAuth (JWT sessions, credentials provider, bcrypt hashing, RBAC) |
| **Validation** | Zod schemas on API endpoints |
| **File Generation** | jsPDF for verified completion certificates |
| **CSV Processing** | PapaParse for bulk user imports and reports export |
| **Testing** | Vitest for unit tests; Playwright config for smoke testing |

---

## ⚙️ Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon pooled PostgreSQL connection string (`?sslmode=require&pgbouncer=true`) |
| `DIRECT_URL` | Neon direct connection string (used for running migrations) |
| `NEXTAUTH_URL` | Base URL of the deployment (e.g., `http://localhost:3000` or `https://your-domain.vercel.app`) |
| `NEXTAUTH_SECRET` | 32+ character random secret for JWT signing |
| `SEED_ADMIN_EMAIL` | Default administrator email for initial seeding |
| `SEED_ADMIN_PASSWORD` | Default administrator password for initial seeding |
| `STORAGE_PROVIDER` | Storage backend: `"mock"` (local/safe demo), `"vercel-blob"`, or `"s3"` |
| `BLOB_READ_WRITE_TOKEN` | Token if using Vercel Blob storage |
| `RESEND_API_KEY` | (Optional) Resend API key for password reset emails |
| `EMAIL_FROM` | Sender address for notifications |

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Seed Database & Create Initial Admin
To seed the database with the initial administrator, sample students, 3 internal courses, 5 external courses, and 2 learning paths:

```bash
npm run seed
```

Default credentials created by the seed script:
- **Admin Workspace:** `admin@skillpulse.local` / `AdminSecurePassword123!` (or value in `SEED_ADMIN_PASSWORD`)
- **Student 1 (Active):** `marcus@skillpulse.local` / `Student123!`
- **Student 2 (Active):** `elena@skillpulse.local` / `Student123!`
- **Student 3 (New - tests force password change):** `jordan@skillpulse.local` / `Welcome123!`

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the public site or [http://localhost:3000/auth/login](http://localhost:3000/auth/login) to sign in.

---

## 🧪 Running Tests

### Unit Tests (Vitest)
Executes auth guards, path sequencing, and external link compliance tests:
```bash
npm run test
```

### Type Checking & Build Verification
```bash
npx tsc --noEmit
npm run build
```

---

## 📖 Step-by-Step Tutorials

### How to Add an External Udemy Course
1. Sign in as an **Admin** at `/auth/login`.
2. Navigate to **Courses** in the Admin sidebar (`/admin/courses`).
3. Click **"Create Course"** at the top right.
4. Set the **Course Type** toggle to **"External Course (Link)"**.
5. Fill in the course details:
   - **Course Title:** e.g., *"Docker & Kubernetes: The Practical Guide"*
   - **External URL:** Must be a valid `https://` link (e.g., `https://www.udemy.com/course/docker-kubernetes-the-practical-guide/`)
   - **Provider:** Select `"Udemy"` from the dropdown.
   - **Instructor Name:** Maximilian Schwarzmüller
   - **Level:** Intermediate
   - **Duration:** 1440 minutes (24 hours)
   - **Tags:** `Docker, Kubernetes, DevOps`
6. Click **"Save Course"**.
7. The course will now be available in the public directory with an `"External (Udemy)"` badge. When learners click **"Go to Course"**, an outbound notice modal explains that they will continue on Udemy, opens the course in a new tab with `rel="noopener noreferrer"`, and logs an outbound click event.

### How to Create a Learning Path (Internal + External Mixed)
1. Go to **Learning Paths** (`/admin/paths`) in the Admin sidebar.
2. Click **"Create New Path"**.
3. Enter title (e.g., *"Full-Stack Cloud Developer Career Path"*), slug, level, and estimated hours.
4. Click **"Open Path Studio"** on the path card (`/admin/paths/[id]`).
5. Under **"Add Courses to Path"**, select a course from the dropdown (internal or external).
6. Set whether the step is **Required** or **Optional**, and provide a curator note (e.g., *"Step 1: Master UI Engineering before diving into backend systems"*).
7. Reorder steps as needed using the **Move Up / Move Down** controls.
8. Set the path status to **"PUBLISHED"**.
9. Students can now visit `/paths/[slug]` to view the interactive roadmap and track progress across both internal and external courses!

### How to Bulk Import Students from CSV
1. In the Admin sidebar, navigate to **User Accounts** (`/admin/users`).
2. Click **"Bulk CSV Import"**.
3. Upload a CSV file structured as follows:
   ```csv
   name,email,role
   Sarah Connor,sconnor@example.com,STUDENT
   John Connor,jconnor@example.com,STUDENT
   Kyle Reese,kreese@example.com,ADMIN
   ```
4. Click **"Import Users"**. The platform provisions their accounts, hashes temporary passwords, and flags them for a mandatory password change on first sign-in.

---

## 🌐 Deploying to Vercel with Neon PostgreSQL

1. **Create a Neon Project:**
   - In the Neon console, create a new project and copy both the **Pooled connection string** (for `DATABASE_URL`) and the **Direct connection string** (for `DIRECT_URL`).
2. **Push Database Schema:**
   ```bash
   npx prisma db push
   npm run seed
   ```
3. **Configure Vercel Environment Variables:**
   - Add `DATABASE_URL` (pooled Neon connection)
   - Add `DIRECT_URL` (direct Neon connection)
   - Add `NEXTAUTH_SECRET` (generate using `openssl rand -base64 32`)
   - Add `NEXTAUTH_URL` (your production URL, e.g. `https://skillpulse.vercel.app`)
   - Add `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`
   - Add `STORAGE_PROVIDER="mock"` (or configure Vercel Blob with `BLOB_READ_WRITE_TOKEN`)
4. **Deploy:**
   - Push your code to GitHub and import the repository into Vercel.
   - The build command is pre-configured in `package.json`:
     `"build": "prisma generate && next build"`
   - Thanks to the `safeDbQuery` utility and `dynamic = "force-dynamic"`, Next.js builds on Vercel will never fail even if database pooling is cold during pre-rendering.

---

## ⚖️ Compliance & Intellectual Property Notice
SkillPulse uses original branding, layout, typography, and copywriting. It does not copy, scrape, proxy, or embed any third-party course videos or intellectual property. External links direct users directly to authorized partner platforms (such as Udemy and Coursera), respecting their content terms and user authentication models.
