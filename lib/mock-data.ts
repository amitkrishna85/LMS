import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { BRAND_NAME, DEFAULT_TAGLINE, DEFAULT_FOOTER_TEXT, DEFAULT_SITE_COLOR } from "@/lib/brand";

// Pre-hashed passwords for deterministic mock fallback
// Password is "Admin123!" for admin, "Student123!" for students
const ADMIN_HASH = bcrypt.hashSync("Admin123!", 10);
const STUDENT_HASH = bcrypt.hashSync("Student123!", 10);
const NEW_STUDENT_HASH = bcrypt.hashSync("Welcome123!", 10);

function getInitialMockUsers() {
  return [
    {
      id: "usr_admin_1",
      name: "Amit Krishna",
      email: "admin@skillpulse.local",
      passwordHash: ADMIN_HASH,
      role: "ADMIN" as const,
      isActive: true,
      mustChangePassword: false,
      createdAt: new Date("2026-01-01"),
    },
    {
      id: "usr_student_1",
      name: "Marcus Chen",
      email: "marcus@skillpulse.local",
      passwordHash: STUDENT_HASH,
      role: "STUDENT" as const,
      isActive: true,
      mustChangePassword: false,
      createdAt: new Date("2026-01-05"),
    },
    {
      id: "usr_student_2",
      name: "Elena Rostova",
      email: "elena@skillpulse.local",
      passwordHash: STUDENT_HASH,
      role: "STUDENT" as const,
      isActive: true,
      mustChangePassword: false,
      createdAt: new Date("2026-01-10"),
    },
    {
      id: "usr_student_3",
      name: "Jordan Lee (New)",
      email: "jordan@skillpulse.local",
      passwordHash: NEW_STUDENT_HASH,
      role: "STUDENT" as const,
      isActive: true,
      mustChangePassword: true, // Will test force change password flow!
      createdAt: new Date("2026-02-01"),
    },
  ];
}

function getInitialMockCategories() {
  return [
    {
      id: "cat_swe",
      name: "Software Engineering",
      slug: "software-engineering",
      parentId: null,
    },
    {
      id: "cat_ai",
      name: "AI & Machine Learning",
      slug: "ai-machine-learning",
      parentId: null,
    },
    {
      id: "cat_cloud",
      name: "Cloud & DevOps",
      slug: "cloud-devops",
      parentId: null,
    },
    {
      id: "cat_design",
      name: "Design & UX",
      slug: "design-ux",
      parentId: null,
    },
  ];
}

const INITIAL_MOCK_COURSES = [
    // 3 INTERNAL COURSES
    {
      id: "crs_int_1",
      title: "Full-Stack TypeScript with Next.js & Prisma",
      slug: "fullstack-typescript-nextjs-prisma",
      shortDescription: "Build scalable, production-grade web applications from architecture to deployment.",
      description: "Master the complete modern TypeScript stack. This hands-on masterclass takes you through Next.js App Router, advanced server actions, relational data modeling with Prisma, JWT security, and high-performance serverless deployment.",
      thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
      instructorName: "Dr. Sarah Jenkins",
      level: "INTERMEDIATE" as const,
      language: "English",
      durationMinutes: 320,
      tags: ["TypeScript", "Next.js", "Prisma", "FullStack"],
      categoryId: "cat_swe",
      type: "INTERNAL" as const,
      externalUrl: null,
      externalProvider: null,
      status: "PUBLISHED" as const,
      isFeatured: true,
      sortOrder: 1,
      sections: [
        {
          id: "sec_1_1",
          title: "Architecture & Foundation",
          order: 1,
          lessons: [
            {
              id: "les_1_1_1",
              title: "Welcome to SkillPulse & Tech Stack Blueprint",
              type: "VIDEO" as const,
              contentUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              body: "Introduction to modern full-stack development patterns and system architecture.",
              durationMinutes: 12,
              order: 1,
              isPreview: true,
            },
            {
              id: "les_1_1_2",
              title: "Relational Modeling with Prisma & Neon",
              type: "TEXT" as const,
              contentUrl: null,
              body: "## Setting up Prisma & PostgreSQL\n\nPrisma gives you type-safe database queries. Always configure connection pooling for serverless environments like Vercel with Neon `DATABASE_URL`.",
              durationMinutes: 20,
              order: 2,
              isPreview: false,
            },
          ],
        },
        {
          id: "sec_1_2",
          title: "Authentication & Security",
          order: 2,
          lessons: [
            {
              id: "les_1_2_1",
              title: "JWT Session Flow & NextAuth Configuration",
              type: "VIDEO" as const,
              contentUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
              body: "Deep dive into secure session handling, role enforcement, and CSRF protection.",
              durationMinutes: 28,
              order: 1,
              isPreview: false,
            },
            {
              id: "les_1_2_2",
              title: "Security Cheatsheet & Architecture PDF",
              type: "PDF" as const,
              contentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              body: "Official application security guidelines and role-based permissions matrix.",
              durationMinutes: 15,
              order: 2,
              isPreview: false,
            },
            {
              id: "les_1_2_3",
              title: "Module 1 Knowledge Check",
              type: "QUIZ" as const,
              contentUrl: null,
              body: JSON.stringify({
                questions: [
                  {
                    id: "q1",
                    question: "Which Prisma URL is used for connection pooling in serverless environments?",
                    options: ["DIRECT_URL", "DATABASE_URL", "SHADOW_DATABASE_URL", "LOCAL_URL"],
                    correctIndex: 1,
                    explanation: "DATABASE_URL connects to the pooled PgBouncer endpoint, preventing connection exhaustion.",
                  },
                  {
                    id: "q2",
                    question: "Where should Role-Based Access Control be strictly enforced?",
                    options: ["Only in client components", "In middleware and in every server action / API route", "Only in the database schema", "In local storage"],
                    correctIndex: 1,
                    explanation: "Security requires defense-in-depth: enforce RBAC both at the routing layer and on each backend handler.",
                  },
                ],
              }),
              durationMinutes: 10,
              order: 3,
              isPreview: false,
            },
          ],
        },
      ],
    },
    {
      id: "crs_int_2",
      title: "Modern UI Engineering with Tailwind & React",
      slug: "modern-ui-engineering-tailwind-react",
      shortDescription: "Craft accessible, responsive, and aesthetically stunning web interfaces.",
      description: "Step up your frontend design skills. Learn to design responsive micro-interactions, dark/light themes, accessible modal workflows, and reusable design systems using Tailwind CSS and React.",
      thumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
      instructorName: "Marcus Sterling",
      level: "BEGINNER" as const,
      language: "English",
      durationMinutes: 240,
      tags: ["TailwindCSS", "React", "DesignSystem", "Accessibility"],
      categoryId: "cat_design",
      type: "INTERNAL" as const,
      externalUrl: null,
      externalProvider: null,
      status: "PUBLISHED" as const,
      isFeatured: true,
      sortOrder: 2,
      sections: [
        {
          id: "sec_2_1",
          title: "Design Tokens & Foundations",
          order: 1,
          lessons: [
            {
              id: "les_2_1_1",
              title: "Typography, Spacing & Color Theory",
              type: "VIDEO" as const,
              contentUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
              body: "Building a coherent design token palette using CSS variables and Tailwind.",
              durationMinutes: 18,
              order: 1,
              isPreview: true,
            },
          ],
        },
      ],
    },
    {
      id: "crs_int_3",
      title: "AI Engineering & LLM Application Architecture",
      slug: "ai-engineering-llm-application-architecture",
      shortDescription: "Architect agentic workflows, embeddings, vector search, and production RAG pipelines.",
      description: "Dive into the frontier of AI application development. This course covers LLM integration, function calling, vector databases, prompt grounding, and evaluation frameworks for enterprise workloads.",
      thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
      instructorName: "Elena Rostova",
      level: "ADVANCED" as const,
      language: "English",
      durationMinutes: 380,
      tags: ["AI", "LLM", "VectorSearch", "Agents", "Python"],
      categoryId: "cat_ai",
      type: "INTERNAL" as const,
      externalUrl: null,
      externalProvider: null,
      status: "PUBLISHED" as const,
      isFeatured: true,
      sortOrder: 3,
      sections: [
        {
          id: "sec_3_1",
          title: "Core Foundations of LLM Systems",
          order: 1,
          lessons: [
            {
              id: "les_3_1_1",
              title: "Embeddings, Context Windows & Retrieval",
              type: "VIDEO" as const,
              contentUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
              body: "How retrieval-augmented generation connects live external documents with foundation models.",
              durationMinutes: 25,
              order: 1,
              isPreview: true,
            },
          ],
        },
      ],
    },

    // 5 EXTERNAL COURSES
    {
      id: "crs_ext_1",
      title: "The Complete 2026 Web Development Bootcamp",
      slug: "complete-web-development-bootcamp",
      shortDescription: "Comprehensive external bootcamp covering web fundamentals, APIs, and modern toolchains.",
      description: "A top-rated external deep dive covering HTML5, CSS3, modern JavaScript, Node.js, Express, databases, and deployment.",
      thumbnailUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80",
      instructorName: "Dr. Angela Yu",
      level: "BEGINNER" as const,
      language: "English",
      durationMinutes: 3600,
      tags: ["WebDev", "Bootcamp", "JavaScript", "NodeJS"],
      categoryId: "cat_swe",
      type: "EXTERNAL" as const,
      externalUrl: "https://example.com/course/web-development-bootcamp",
      externalProvider: "Learning Partner",
      status: "PUBLISHED" as const,
      isFeatured: true,
      sortOrder: 4,
      sections: [],
    },
    {
      id: "crs_ext_2",
      title: "Machine Learning Specialization by Andrew Ng",
      slug: "machine-learning-specialization",
      shortDescription: "Foundational machine learning algorithms, supervised learning, neural networks, and decision trees.",
      description: "A structured learning curriculum covering the mathematics, intuition, and practical implementations behind modern machine learning.",
      thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
      instructorName: "Andrew Ng",
      level: "INTERMEDIATE" as const,
      language: "English",
      durationMinutes: 4800,
      tags: ["MachineLearning", "Python", "Math", "AI"],
      categoryId: "cat_ai",
      type: "EXTERNAL" as const,
      externalUrl: "https://example.com/course/machine-learning-specialization",
      externalProvider: "Learning Partner",
      status: "PUBLISHED" as const,
      isFeatured: true,
      sortOrder: 5,
      sections: [],
    },
    {
      id: "crs_ext_3",
      title: "Docker & Kubernetes: The Practical Guide",
      slug: "docker-kubernetes-practical-guide",
      shortDescription: "Containerize applications, manage multi-container clusters, and automate cloud orchestration.",
      description: "A practical guide covering Docker containers, images, volumes, networks, and Kubernetes production deployments.",
      thumbnailUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=80",
      instructorName: "Maximilian Schwarzmüller",
      level: "INTERMEDIATE" as const,
      language: "English",
      durationMinutes: 1440,
      tags: ["Docker", "Kubernetes", "DevOps", "Containers"],
      categoryId: "cat_cloud",
      type: "EXTERNAL" as const,
      externalUrl: "https://example.com/course/docker-kubernetes-practical-guide",
      externalProvider: "Learning Partner",
      status: "PUBLISHED" as const,
      isFeatured: false,
      sortOrder: 6,
      sections: [],
    },
    {
      id: "crs_ext_4",
      title: "Figma UI/UX Design Essentials",
      slug: "figma-ui-ux-design-essentials",
      shortDescription: "User interface and user experience design masterclass using Figma, auto-layout, and components.",
      description: "Learn to design modern web and mobile application interfaces in Figma with professional prototyping, responsive grids, and design handoff workflows.",
      thumbnailUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=80",
      instructorName: "Daniel Walter Scott",
      level: "BEGINNER" as const,
      language: "English",
      durationMinutes: 720,
      tags: ["Figma", "UIUX", "Prototyping", "Design"],
      categoryId: "cat_design",
      type: "EXTERNAL" as const,
      externalUrl: "https://example.com/course/figma-ui-ux-design-essentials",
      externalProvider: "Learning Partner",
      status: "PUBLISHED" as const,
      isFeatured: false,
      sortOrder: 7,
      sections: [],
    },
    {
      id: "crs_ext_5",
      title: "CS50: Introduction to Computer Science",
      slug: "cs50-introduction-to-computer-science-edx",
      shortDescription: "Harvard University's flagship introduction to the intellectual enterprises of computer science.",
      description: "An entry-level course on edX taught by David J. Malan. Covers algorithms, data structures, memory management, C, Python, SQL, and web development fundamentals.",
      thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      instructorName: "Prof. David J. Malan",
      level: "BEGINNER" as const,
      language: "English",
      durationMinutes: 7200,
      tags: ["ComputerScience", "Harvard", "Algorithms", "C", "Python"],
      categoryId: "cat_swe",
      type: "EXTERNAL" as const,
      externalUrl: "https://www.edx.org/cs50",
      externalProvider: "edX",
      status: "PUBLISHED" as const,
      isFeatured: true,
      sortOrder: 8,
      sections: [],
    },
  ];

const DB_FILE = path.join(process.cwd(), "data", "mock-db.json");

const globalForMock = globalThis as unknown as {
  __MOCK_COURSES__?: any[];
  __MOCK_PATHS__?: any[];
  __MOCK_USERS__?: any[];
  __MOCK_CATEGORIES__?: any[];
  __MOCK_SITE_SETTINGS__?: any;
  __MOCK_HOMEPAGE_SECTIONS__?: any[];
  __MOCK_ENROLLMENTS__?: any[];
  __MOCK_PATH_ENROLLMENTS__?: any[];
  __MOCK_LESSON_PROGRESS__?: any[];
  __MOCK_EXTERNAL_PROGRESS__?: any[];
  __MOCK_PASSWORD_RESET_TOKENS__?: any[];
};

function ensureMockDbInitialized() {
  if (
    globalForMock.__MOCK_COURSES__ !== undefined &&
    globalForMock.__MOCK_PATHS__ !== undefined &&
    globalForMock.__MOCK_USERS__ !== undefined &&
    globalForMock.__MOCK_CATEGORIES__ !== undefined &&
    globalForMock.__MOCK_SITE_SETTINGS__ !== undefined &&
    globalForMock.__MOCK_HOMEPAGE_SECTIONS__ !== undefined &&
    globalForMock.__MOCK_ENROLLMENTS__ !== undefined &&
    globalForMock.__MOCK_PATH_ENROLLMENTS__ !== undefined &&
    globalForMock.__MOCK_LESSON_PROGRESS__ !== undefined &&
    globalForMock.__MOCK_EXTERNAL_PROGRESS__ !== undefined &&
    globalForMock.__MOCK_PASSWORD_RESET_TOKENS__ !== undefined
  ) {
    return;
  }

  let savedData: any = {};
  if (fs.existsSync(DB_FILE)) {
    try {
      savedData = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    } catch (error) {
      console.error("Failed to read persistent mock data:", error);
      throw new Error("Saved application data could not be loaded.");
    }
  }

  if (globalForMock.__MOCK_COURSES__ === undefined) {
    globalForMock.__MOCK_COURSES__ = Array.isArray(savedData.courses)
      ? savedData.courses
      : INITIAL_MOCK_COURSES.map((c: any, i: number) => ({
      ...c,
      createdAt: c.createdAt || new Date(Date.now() - (100 - i) * 86400000).toISOString(),
      updatedAt: c.updatedAt || new Date(Date.now() - (100 - i) * 86400000).toISOString(),
      }));
  }

  if (globalForMock.__MOCK_PATHS__ === undefined) {
    globalForMock.__MOCK_PATHS__ = Array.isArray(savedData.paths)
      ? savedData.paths
      : INITIAL_MOCK_PATHS.map((p: any, i: number) => ({
      ...p,
      createdAt: p.createdAt || new Date(Date.now() - (50 - i) * 86400000).toISOString(),
      updatedAt: p.updatedAt || new Date(Date.now() - (50 - i) * 86400000).toISOString(),
      }));
  }

  globalForMock.__MOCK_USERS__ ??=
    Array.isArray(savedData.users) ? savedData.users : getInitialMockUsers();
  globalForMock.__MOCK_CATEGORIES__ ??=
    Array.isArray(savedData.categories)
      ? savedData.categories
      : getInitialMockCategories();
  globalForMock.__MOCK_SITE_SETTINGS__ ??=
    savedData.siteSettings || getDefaultMockSiteSettings();
  globalForMock.__MOCK_HOMEPAGE_SECTIONS__ ??=
    Array.isArray(savedData.homepageSections)
      ? savedData.homepageSections
      : getDefaultMockHomepageSections();
  globalForMock.__MOCK_ENROLLMENTS__ ??= Array.isArray(savedData.enrollments)
    ? savedData.enrollments
    : [];
  globalForMock.__MOCK_PATH_ENROLLMENTS__ ??=
    Array.isArray(savedData.pathEnrollments) ? savedData.pathEnrollments : [];
  globalForMock.__MOCK_LESSON_PROGRESS__ ??=
    Array.isArray(savedData.lessonProgress) ? savedData.lessonProgress : [];
  globalForMock.__MOCK_EXTERNAL_PROGRESS__ ??=
    Array.isArray(savedData.externalProgress) ? savedData.externalProgress : [];
  globalForMock.__MOCK_PASSWORD_RESET_TOKENS__ ??=
    Array.isArray(savedData.passwordResetTokens)
      ? savedData.passwordResetTokens
      : [];

  persistMockDb();
}

function persistMockDb() {
  if (
    process.env.DATABASE_URL ||
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return;
  }

  const dir = path.dirname(DB_FILE);
  fs.mkdirSync(dir, { recursive: true });
  const temporaryFile = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(
    temporaryFile,
    JSON.stringify(
      {
        courses: globalForMock.__MOCK_COURSES__ || [],
        paths: globalForMock.__MOCK_PATHS__ || [],
        users: globalForMock.__MOCK_USERS__ || [],
        categories: globalForMock.__MOCK_CATEGORIES__ || [],
        siteSettings: globalForMock.__MOCK_SITE_SETTINGS__ || getDefaultMockSiteSettings(),
        homepageSections:
          globalForMock.__MOCK_HOMEPAGE_SECTIONS__ || getDefaultMockHomepageSections(),
        enrollments: globalForMock.__MOCK_ENROLLMENTS__ || [],
        pathEnrollments: globalForMock.__MOCK_PATH_ENROLLMENTS__ || [],
        lessonProgress: globalForMock.__MOCK_LESSON_PROGRESS__ || [],
        externalProgress: globalForMock.__MOCK_EXTERNAL_PROGRESS__ || [],
        passwordResetTokens: globalForMock.__MOCK_PASSWORD_RESET_TOKENS__ || [],
      },
      null,
      2
    ),
    "utf-8"
  );
  try {
    fs.renameSync(temporaryFile, DB_FILE);
  } catch (error) {
    if (fs.existsSync(temporaryFile)) fs.unlinkSync(temporaryFile);
    throw error;
  }
}

export function getMockUsers() {
  ensureMockDbInitialized();
  return globalForMock.__MOCK_USERS__!;
}

export function addMockUser(user: any) {
  ensureMockDbInitialized();
  globalForMock.__MOCK_USERS__ = [
    { ...user },
    ...(globalForMock.__MOCK_USERS__ || []).filter(
      (savedUser: any) => savedUser.id !== user.id && savedUser.email !== user.email
    ),
  ];
  persistMockDb();
  return user;
}

export function updateMockUser(id: string, updates: any) {
  ensureMockDbInitialized();
  const user = globalForMock.__MOCK_USERS__?.find((savedUser: any) => savedUser.id === id);
  if (!user) return null;
  Object.assign(user, updates, { updatedAt: new Date().toISOString() });
  persistMockDb();
  return user;
}

export function deleteMockUser(id: string) {
  ensureMockDbInitialized();
  globalForMock.__MOCK_USERS__ = (globalForMock.__MOCK_USERS__ || []).filter(
    (user: any) => user.id !== id
  );
  persistMockDb();
}

export function upsertMockEnrollment(enrollment: any) {
  ensureMockDbInitialized();
  const existing = globalForMock.__MOCK_ENROLLMENTS__!.find(
    (item: any) =>
      item.userId === enrollment.userId && item.courseId === enrollment.courseId
  );
  const saved = {
    id: existing?.id || `mock_enrollment_${Date.now()}`,
    enrolledAt: new Date().toISOString(),
    ...existing,
    ...enrollment,
    updatedAt: new Date().toISOString(),
  };
  globalForMock.__MOCK_ENROLLMENTS__ = [
    saved,
    ...globalForMock.__MOCK_ENROLLMENTS__!.filter(
      (item: any) =>
        item.userId !== enrollment.userId || item.courseId !== enrollment.courseId
    ),
  ];
  persistMockDb();
  return saved;
}

export function getMockEnrollments(userId?: string) {
  ensureMockDbInitialized();
  return (globalForMock.__MOCK_ENROLLMENTS__ || []).filter(
    (item: any) => !userId || item.userId === userId
  );
}

export function deleteMockEnrollment(userId: string, courseId: string) {
  ensureMockDbInitialized();
  globalForMock.__MOCK_ENROLLMENTS__ = (
    globalForMock.__MOCK_ENROLLMENTS__ || []
  ).filter(
    (item: any) => item.userId !== userId || item.courseId !== courseId
  );
  persistMockDb();
}

export function upsertMockPathEnrollment(pathEnrollment: any) {
  ensureMockDbInitialized();
  const existing = globalForMock.__MOCK_PATH_ENROLLMENTS__!.find(
    (item: any) =>
      item.userId === pathEnrollment.userId &&
      item.pathId === pathEnrollment.pathId
  );
  const saved = {
    id: existing?.id || `mock_path_enrollment_${Date.now()}`,
    startedAt: new Date().toISOString(),
    ...existing,
    ...pathEnrollment,
  };
  globalForMock.__MOCK_PATH_ENROLLMENTS__ = [
    saved,
    ...globalForMock.__MOCK_PATH_ENROLLMENTS__!.filter(
      (item: any) =>
        item.userId !== pathEnrollment.userId ||
        item.pathId !== pathEnrollment.pathId
    ),
  ];
  persistMockDb();
  return saved;
}

export function getMockPathEnrollments(userId?: string) {
  ensureMockDbInitialized();
  return (globalForMock.__MOCK_PATH_ENROLLMENTS__ || []).filter(
    (item: any) => !userId || item.userId === userId
  );
}

export function upsertMockLessonProgress(progress: any) {
  ensureMockDbInitialized();
  const existing = globalForMock.__MOCK_LESSON_PROGRESS__!.find(
    (item: any) =>
      item.userId === progress.userId && item.lessonId === progress.lessonId
  );
  const saved = {
    id: existing?.id || `mock_lesson_progress_${Date.now()}`,
    ...existing,
    ...progress,
    updatedAt: new Date().toISOString(),
  };
  globalForMock.__MOCK_LESSON_PROGRESS__ = [
    saved,
    ...globalForMock.__MOCK_LESSON_PROGRESS__!.filter(
      (item: any) =>
        item.userId !== progress.userId || item.lessonId !== progress.lessonId
    ),
  ];
  persistMockDb();
  return saved;
}

export function getMockLessonProgress(userId?: string) {
  ensureMockDbInitialized();
  return (globalForMock.__MOCK_LESSON_PROGRESS__ || []).filter(
    (item: any) => !userId || item.userId === userId
  );
}

export function upsertMockExternalProgress(progress: any) {
  ensureMockDbInitialized();
  const existing = globalForMock.__MOCK_EXTERNAL_PROGRESS__!.find(
    (item: any) =>
      item.userId === progress.userId && item.courseId === progress.courseId
  );
  const saved = {
    id: existing?.id || `mock_external_progress_${Date.now()}`,
    markedAt: new Date().toISOString(),
    ...existing,
    ...progress,
  };
  globalForMock.__MOCK_EXTERNAL_PROGRESS__ = [
    saved,
    ...globalForMock.__MOCK_EXTERNAL_PROGRESS__!.filter(
      (item: any) =>
        item.userId !== progress.userId || item.courseId !== progress.courseId
    ),
  ];
  persistMockDb();
  return saved;
}

export function getMockExternalProgress(userId?: string) {
  ensureMockDbInitialized();
  return (globalForMock.__MOCK_EXTERNAL_PROGRESS__ || []).filter(
    (item: any) => !userId || item.userId === userId
  );
}

export function addMockPasswordResetToken(resetToken: any) {
  ensureMockDbInitialized();
  globalForMock.__MOCK_PASSWORD_RESET_TOKENS__ = [
    resetToken,
    ...(globalForMock.__MOCK_PASSWORD_RESET_TOKENS__ || []).filter(
      (item: any) => item.token !== resetToken.token
    ),
  ];
  persistMockDb();
  return resetToken;
}

export function getMockPasswordResetToken(token: string) {
  ensureMockDbInitialized();
  return globalForMock.__MOCK_PASSWORD_RESET_TOKENS__?.find(
    (item: any) => item.token === token
  ) || null;
}

export function deleteMockPasswordResetToken(token: string) {
  ensureMockDbInitialized();
  globalForMock.__MOCK_PASSWORD_RESET_TOKENS__ = (
    globalForMock.__MOCK_PASSWORD_RESET_TOKENS__ || []
  ).filter((item: any) => item.token !== token);
  persistMockDb();
}

export function getMockCategories() {
  ensureMockDbInitialized();
  return globalForMock.__MOCK_CATEGORIES__!;
}

export function addMockCategory(category: any) {
  ensureMockDbInitialized();
  globalForMock.__MOCK_CATEGORIES__ = [
    category,
    ...(globalForMock.__MOCK_CATEGORIES__ || []).filter(
      (savedCategory: any) => savedCategory.id !== category.id
    ),
  ];
  persistMockDb();
  return category;
}

export function deleteMockCategory(id: string) {
  ensureMockDbInitialized();
  globalForMock.__MOCK_CATEGORIES__ = (
    globalForMock.__MOCK_CATEGORIES__ || []
  ).filter((category: any) => category.id !== id);
  persistMockDb();
}

export function getMockCourses() {
  ensureMockDbInitialized();
  return globalForMock.__MOCK_COURSES__!;
}

export function addMockCourse(course: any) {
  ensureMockDbInitialized();
  const complete = {
    sections: [],
    _count: { sections: 0, enrollments: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...course,
  };
  globalForMock.__MOCK_COURSES__ = [
    complete,
    ...(globalForMock.__MOCK_COURSES__ || []).filter((c: any) => c.id !== course.id),
  ];
  persistMockDb();
  return complete;
}

export function updateMockCourse(id: string, updates: any) {
  ensureMockDbInitialized();
  const list = globalForMock.__MOCK_COURSES__ || [];
  const idx = list.findIndex((c: any) => c.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    persistMockDb();
    return list[idx];
  }
  return null;
}

export function deleteMockCourse(id: string) {
  ensureMockDbInitialized();
  globalForMock.__MOCK_COURSES__ = (globalForMock.__MOCK_COURSES__ || []).filter(
    (c: any) => c.id !== id
  );
  persistMockDb();
}

const INITIAL_MOCK_PATHS = [
    {
      id: "path_1",
      title: "Full-Stack Cloud Developer Career Path",
      slug: "full-stack-cloud-developer",
      description: "A comprehensive roadmap taking you from frontend foundations through scalable backend architectures and Dockerized cloud deployments. Mixes internal deep dives with industry-standard external certifications.",
      thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      level: "INTERMEDIATE" as const,
      status: "PUBLISHED" as const,
      isFeatured: true,
      estimatedHours: 65,
      items: [
        {
          id: "pi_1_1",
          courseId: "crs_int_2", // Modern UI Engineering (Internal)
          order: 1,
          isRequired: true,
          note: "Step 1: Master modern UI design systems and component architecture.",
        },
        {
          id: "pi_1_2",
          courseId: "crs_int_1", // Full-Stack TypeScript (Internal)
          order: 2,
          isRequired: true,
          note: "Step 2: Build end-to-end applications with Next.js, Prisma, and database modeling.",
        },
        {
          id: "pi_1_3",
          courseId: "crs_ext_3", // Docker & Kubernetes (External learning partner)
          order: 3,
          isRequired: true,
          note: "Step 3: Containerize and deploy your services into production clusters.",
        },
      ],
    },
    {
      id: "path_2",
      title: "Applied AI & Machine Learning Specialist",
      slug: "applied-ai-machine-learning-specialist",
      description: "From machine learning mathematical principles to advanced LLM application engineering and agentic workflows.",
      thumbnailUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
      level: "ADVANCED" as const,
      status: "PUBLISHED" as const,
      isFeatured: true,
      estimatedHours: 90,
      items: [
        {
          id: "pi_2_1",
          courseId: "crs_ext_2", // Machine Learning Specialization (External learning partner)
          order: 1,
          isRequired: true,
          note: "Step 1: Gain rigorous grounding in machine learning algorithms and theory.",
        },
        {
          id: "pi_2_2",
          courseId: "crs_int_3", // AI Engineering & LLM Architecture (Internal)
          order: 2,
          isRequired: true,
          note: "Step 2: Build production-grade generative AI applications, vector search, and agents.",
        },
      ],
    },
  ];

export function getMockLearningPaths() {
  ensureMockDbInitialized();
  return globalForMock.__MOCK_PATHS__!;
}

export function addMockLearningPath(path: any) {
  ensureMockDbInitialized();
  const complete = {
    items: [],
    _count: { enrollments: 0, items: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...path,
  };
  globalForMock.__MOCK_PATHS__ = [
    complete,
    ...(globalForMock.__MOCK_PATHS__ || []).filter((p: any) => p.id !== path.id),
  ];
  persistMockDb();
  return complete;
}

export function updateMockLearningPath(id: string, updates: any) {
  ensureMockDbInitialized();
  const list = globalForMock.__MOCK_PATHS__ || [];
  const idx = list.findIndex((p: any) => p.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    persistMockDb();
    return list[idx];
  }
  return null;
}

export function deleteMockLearningPath(id: string) {
  ensureMockDbInitialized();
  globalForMock.__MOCK_PATHS__ = (globalForMock.__MOCK_PATHS__ || []).filter(
    (p: any) => p.id !== id
  );
  persistMockDb();
}

export function addMockLearningPathItem(pathId: string, item: any) {
  ensureMockDbInitialized();
  const path = (globalForMock.__MOCK_PATHS__ || []).find((p: any) => p.id === pathId);
  if (path) {
    if (!path.items) path.items = [];
    const courses = getMockCourses();
    const course = courses.find((c: any) => c.id === item.courseId);
    const fullItem = {
      ...item,
      course: course
        ? {
            id: course.id,
            title: course.title,
            slug: course.slug,
            type: course.type,
            externalProvider: course.externalProvider,
            level: course.level,
            durationMinutes: course.durationMinutes,
          }
        : null,
    };
    path.items = [
      ...path.items.filter((it: any) => it.courseId !== item.courseId),
      fullItem,
    ].sort((a: any, b: any) => a.order - b.order);
    if (!path._count) path._count = { enrollments: 0, items: 0 };
    path._count.items = path.items.length;
    persistMockDb();
    return fullItem;
  }
  return item;
}

export function updateMockLearningPathItem(pathId: string, itemId: string, updates: any) {
  ensureMockDbInitialized();
  const path = (globalForMock.__MOCK_PATHS__ || []).find((p: any) => p.id === pathId);
  if (path && path.items) {
    const item = path.items.find((it: any) => it.id === itemId);
    if (item) {
      Object.assign(item, updates);
      path.items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      persistMockDb();
      return item;
    }
  }
  return null;
}

export function deleteMockLearningPathItem(pathId: string, itemId: string) {
  ensureMockDbInitialized();
  const path = (globalForMock.__MOCK_PATHS__ || []).find((p: any) => p.id === pathId);
  if (path && path.items) {
    path.items = path.items.filter((it: any) => it.id !== itemId);
    if (path._count) path._count.items = path.items.length;
    persistMockDb();
  }
}

function getDefaultMockSiteSettings() {
  return {
    id: "default",
    siteName: BRAND_NAME,
    logoUrl: null,
    primaryColor: DEFAULT_SITE_COLOR,
    tagline: DEFAULT_TAGLINE,
    footerText: DEFAULT_FOOTER_TEXT,
    socialLinks: JSON.stringify({
      twitter: "https://twitter.com",
      github: "https://github.com",
    }),
  };
}

export function getMockSiteSettings() {
  ensureMockDbInitialized();
  return globalForMock.__MOCK_SITE_SETTINGS__!;
}

export function updateMockSiteSettings(updates: any) {
  ensureMockDbInitialized();
  globalForMock.__MOCK_SITE_SETTINGS__ = {
    ...globalForMock.__MOCK_SITE_SETTINGS__,
    ...updates,
    id: "default",
    updatedAt: new Date().toISOString(),
  };
  persistMockDb();
  return globalForMock.__MOCK_SITE_SETTINGS__;
}

function getDefaultMockHomepageSections() {
  return [
    {
      id: "sec_hero",
      type: "HERO" as const,
      title: "Hero Banner",
      config: JSON.stringify({
        headline: "Falkor Academy",
        subheadline: "Explore administrator-created courses with engaging videos, useful written lessons, and guided learning paths to help you build practical skills.",
        ctaText: "Explore Courses",
        ctaLink: "/courses",
        secondaryCtaText: "View Learning Paths",
        secondaryCtaLink: "/paths",
      }),
      order: 1,
      isVisible: true,
    },
    {
      id: "sec_featured_paths",
      type: "FEATURED_PATHS" as const,
      title: "Curated Learning Paths",
      config: JSON.stringify({
        subtitle: "Follow clear, structured learning paths built around practical video and written lessons.",
      }),
      order: 2,
      isVisible: true,
    },
    {
      id: "sec_featured_courses",
      type: "FEATURED_COURSES" as const,
      title: "Featured Courses",
      config: JSON.stringify({
        subtitle: "Explore video courses and written lessons created and curated by Falkor Academy administrators.",
      }),
      order: 3,
      isVisible: true,
    },
    {
      id: "sec_categories",
      type: "CATEGORIES" as const,
      title: "Explore by Category",
      config: JSON.stringify({
        subtitle: "Browse our expansive catalog across engineering, AI, cloud, and design.",
      }),
      order: 4,
      isVisible: true,
    },
  ];
}

export function getMockHomepageSections() {
  ensureMockDbInitialized();
  return globalForMock.__MOCK_HOMEPAGE_SECTIONS__!;
}

export function updateMockHomepageSection(id: string, updates: any) {
  ensureMockDbInitialized();
  const section = globalForMock.__MOCK_HOMEPAGE_SECTIONS__?.find(
    (savedSection: any) => savedSection.id === id
  );
  if (!section) return null;
  Object.assign(section, updates);
  persistMockDb();
  return section;
}

export const MOCK_USERS = getMockUsers();
export const MOCK_CATEGORIES = getMockCategories();
export const MOCK_COURSES = getMockCourses();
export const MOCK_PATHS = getMockLearningPaths();
export const MOCK_HOMEPAGE_SECTIONS = getMockHomepageSections();
export const MOCK_SITE_SETTINGS = getMockSiteSettings();
