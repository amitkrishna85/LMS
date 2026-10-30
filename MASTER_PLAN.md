# SkillPulse LMS: Complete Implementation & Architecture Plan

## 1. Project Overview & Original Branding
- **Name:** SkillPulse (Original brand, clean high-tech corporate LMS design)
- **Tagline:** Accelerate mastery with curated internal deep dives and external courses.
- **Color Palette:** Deep Indigo (`#1e1b4b`), Vibrant Violet (`#6366f1`), Slate neutrals (`#0f172a`, `#334155`), Emerald accent for completion (`#10b981`).
- **Core Concept:**
  - **Internal Courses:** Full multi-section curriculum with video, reading, PDF, and quiz lessons hosted on the platform.
  - **External Courses:** Curated external links (e.g., Udemy, Coursera, YouTube, Pluralsight) opening securely in a new tab with explicit disclaimers and self-reported progress tracking.
  - **Learning Paths:** Multi-course ordered journeys mixing internal and external courses with required/optional milestones and overall completion progress.
  - **Admin-Gated Enrollment:** No public self-registration. Admins provision accounts, batch import via CSV, reset passwords, and force initial password change.

---

## 2. Technical Stack & Deployment Guarantees
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS, Lucide icons, responsive dark/light mode tokens
- **Database & ORM:** PostgreSQL (Neon-ready with pooled `DATABASE_URL` and direct `DIRECT_URL`), Prisma ORM
- **Authentication:** NextAuth.js with Credentials Provider, bcryptjs hashing, JWT sessions, Role-Based Access Control (`ADMIN`, `STUDENT`), session-level `mustChangePassword` gating
- **Forms & Validation:** React Hook Form + Zod on all forms, actions, and API endpoints
- **Storage Layer:** Unified Storage Abstraction (`lib/storage/index.ts`) supporting Vercel Blob, S3-compatible, or local/direct mock storage fallback
- **Build & Vercel Resilience:**
  - `export const dynamic = "force-dynamic"` on all database-accessing routes, sitemap.xml, and APIs.
  - Defensive database access wrappers so `npm run build` succeeds seamlessly even without an active DB connection.
  - Scripts: `"prisma generate && next build"` in `build`, `"postinstall": "prisma generate"`.

---

## 3. Milestones & Execution Roadmap

### Milestone 1: Scaffold, Core Architecture & Auth with RBAC (M1)
- Initialize Next.js 14 TypeScript app in workspace root.
- Install and configure dependencies: NextAuth, Prisma, bcryptjs, zod, react-hook-form, lucide-react, clsx, tailwind-merge, sonner.
- Define comprehensive Prisma schema in `prisma/schema.prisma` with all models, relations, cascades, and indexes.
- Set up Prisma singleton in `lib/prisma.ts`.
- Implement NextAuth options in `lib/auth.ts` with credentials, JWT callbacks, role injection, and password-change redirect.
- Create middleware for `/admin` (ADMIN only), `/dashboard` (authenticated), and `/auth/force-change-password`.
- Seed script (`prisma/seed.ts`) creating default Admin, sample Students, 3 Internal courses, 5 External courses, and 2 Learning Paths.
- Verify: Lint, type-check, and `npm run build`.

### Milestone 2: Admin User Management (M2)
- `/admin/users` data table: search, filter by role/status, pagination.
- Create single user modal/page (name, email, role, temporary password).
- Bulk CSV import for users (`name,email,role`) with validation and error reporting.
- Edit user details, activate/deactivate toggle, delete user.
- Password reset flow: generates secure token; displays reset link if no SMTP configured; email trigger hook.
- First-time login detection forcing users to `/auth/force-change-password` before granting access.
- Verify: Lint, type-check, and `npm run build`.

### Milestone 3: Admin Course Management (Internal & External) (M3)
- `/admin/courses` table: search, filters (Type: ALL/INTERNAL/EXTERNAL, Status: DRAFT/PUBLISHED/ARCHIVED, Category), sorting, pagination, bulk actions.
- Course creation & edit workflow with type toggle:
  - **External Course:** External URL validation (must be https), provider selector (Udemy, Coursera, YouTube, Other), instructor, level, tags, duration.
  - **Internal Course:** Curriculum Builder with Sections and Lessons, drag-and-drop / ordering controls, lesson types (VIDEO, TEXT, PDF, QUIZ), isPreview flag.
- Storage abstraction for media uploads (thumbnails, PDFs, videos).
- Rich-text editor integration with sanitized output.
- Slug auto-generation with collision avoidance.
- Verify: Lint, type-check, and `npm run build`.

### Milestone 4: Learning Paths Builder (M4)
- `/admin/paths` list and creator/editor.
- Course picker with search to add internal and external courses to a path.
- Reorder items, set required vs optional, add milestone notes.
- Estimated hours calculator, level badge, thumbnail, publish/draft toggle.
- Live preview modal for admin inspection.
- Verify: Lint, type-check, and `npm run build`.

### Milestone 5: Public Site & Search (M5)
- Public Navbar and Footer with brand identity, theme toggle, and session-aware navigation.
- Homepage: Hero section with live search input, featured learning paths, featured courses, category pill filters, and "Continue Learning" strip for authenticated users.
- `/courses`: Instant search with debouncing, category/level/type/duration filters, sorting (newest, popular, title), pagination, badges distinguishing "On-Platform" vs "External (Udemy/etc.)".
- `/courses/[slug]`:
  - Internal: Syllabus overview, preview lessons, instructor details, enrollment button.
  - External: Clear external banner ("You will continue on Udemy"), outbound link button (`target="_blank" rel="noopener noreferrer"`), outbound click tracking event, and self-report status toggles.
- `/paths` and `/paths/[slug]`: Interactive roadmap view with progress calculation, course cards, and step status.
- Content Pages: About, Contact, Terms, Privacy.
- SEO: Dynamic metadata, OpenGraph tags, JSON-LD schema, robots.txt, and DB-safe sitemap.xml.
- Verify: Lint, type-check, and `npm run build`.

### Milestone 6: Student Dashboard & Learning Classroom (M6)
- `/dashboard`:
  - "My Enrolled Courses" (Internal progress % and external course status).
  - "My Learning Paths" with path progression bar.
  - Earned completion certificates.
  - Profile settings & password update.
- Internal Classroom Player (`/learn/[slug]`):
  - Video streaming / text / PDF lesson viewer.
  - Course curriculum sidebar with real-time checkmarks upon completion.
  - "Mark Complete & Next Lesson" auto-progression.
  - Auto-resume last opened lesson.
- Certificate Engine: Dynamic completion certificate generation with unique verification hash.
- Verify: Lint, type-check, and `npm run build`.

### Milestone 7: Homepage Builder, Reports & Analytics, Settings, Audit Logs (M7)
- Homepage Builder (`/admin/homepage`): Configure sections (Hero, Featured Courses, Featured Paths, Categories, Custom Lists), toggle visibility, and reorder.
- Reports & Analytics (`/admin/reports`): Course enrollments, completion rates, active students, and one-click CSV export.
- Site Settings (`/admin/settings`): Custom site name, logo, primary color tokens, footer copy, social links, email provider configuration.
- Audit Log Viewer (`/admin/audit-logs`): Filterable log of admin actions (user creation, course edits, deletions, role updates).
- Verify: Lint, type-check, and `npm run build`.

### Milestone 8: Automated Tests, Quality Assurance & Deployment Documentation (M8)
- Vitest suite:
  - Auth guards & role-based middleware testing.
  - Learning path ordering & progress calculation logic.
  - External link URL validation & sanitize routines.
- Playwright E2E smoke test:
  - Seed login -> navigate courses -> filter internal/external -> open course details -> test external outbound disclaimer.
- Production README.md: Architecture, local setup, environment variables guide, Neon DB connection guide, step-by-step walkthrough for adding an external Udemy course and a learning path.
- Final build verification (`npm run build`).
