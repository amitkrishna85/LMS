import { PrismaClient, Role, CourseLevel, CourseType, CourseStatus, LessonType, PathStatus, HomepageSectionType } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  getMockCategories,
  getMockCourses,
  getMockLearningPaths,
  getMockHomepageSections,
  getMockSiteSettings,
} from "../lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting SkillPulse Database Seeding...");

  // 1. Admin Credentials
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@skillpulse.local").toLowerCase().trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin12345!";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Alex Vance (Admin)",
      role: Role.ADMIN,
      isActive: true,
      mustChangePassword: false,
    },
    create: {
      name: "Alex Vance (Admin)",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      isActive: true,
      mustChangePassword: false,
    },
  });
  console.log(`✅ Admin user seeded: ${admin.email}`);

  // 2. Student Accounts (3 demo students)
  const defaultStudentHash = await bcrypt.hash("Student123!", 10);
  const newStudentHash = await bcrypt.hash("Welcome123!", 10);

  const studentsData = [
    {
      name: "Marcus Chen",
      email: "marcus@skillpulse.local",
      passwordHash: defaultStudentHash,
      role: Role.STUDENT,
      isActive: true,
      mustChangePassword: false,
    },
    {
      name: "Elena Rostova",
      email: "elena@skillpulse.local",
      passwordHash: defaultStudentHash,
      role: Role.STUDENT,
      isActive: true,
      mustChangePassword: false,
    },
    {
      name: "Jordan Lee (First-time Login Demo)",
      email: "jordan@skillpulse.local",
      passwordHash: newStudentHash,
      role: Role.STUDENT,
      isActive: true,
      mustChangePassword: true, // Requires password change on first login
    },
  ];

  for (const s of studentsData) {
    const student = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        name: s.name,
        role: s.role,
        isActive: s.isActive,
        mustChangePassword: s.mustChangePassword,
      },
      create: s,
    });
    console.log(`✅ Student seeded: ${student.email} (mustChangePassword: ${student.mustChangePassword})`);
  }

  // 3. Categories
  const categories = getMockCategories();
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      },
    });
  }
  console.log(`✅ Categories seeded: ${categories.length} categories`);

  // 4. Courses (3 Internal + 5 External)
  const courses = getMockCourses();
  for (const c of courses) {
    const existing = await prisma.course.findUnique({
      where: { slug: c.slug },
    });

    let courseId = existing?.id || c.id;

    if (!existing) {
      const created = await prisma.course.create({
        data: {
          id: c.id,
          title: c.title,
          slug: c.slug,
          shortDescription: c.shortDescription,
          description: c.description,
          thumbnailUrl: c.thumbnailUrl,
          instructorName: c.instructorName,
          level: c.level as CourseLevel,
          language: c.language,
          durationMinutes: c.durationMinutes,
          tags: c.tags,
          categoryId: c.categoryId,
          type: c.type as CourseType,
          externalUrl: c.externalUrl,
          externalProvider: c.externalProvider,
          status: c.status as CourseStatus,
          isFeatured: c.isFeatured,
          sortOrder: c.sortOrder,
        },
      });
      courseId = created.id;
    }

    // Seed sections and lessons for internal courses
    if (c.type === "INTERNAL" && c.sections.length > 0) {
      for (const sec of c.sections) {
        let section = await prisma.section.findFirst({
          where: { courseId: courseId, title: sec.title },
        });

        if (!section) {
          section = await prisma.section.create({
            data: {
              courseId: courseId,
              title: sec.title,
              order: sec.order,
            },
          });
        }

        for (const les of sec.lessons) {
          const existingLesson = await prisma.lesson.findFirst({
            where: { sectionId: section.id, title: les.title },
          });

          if (!existingLesson) {
            await prisma.lesson.create({
              data: {
                sectionId: section.id,
                title: les.title,
                type: les.type as LessonType,
                contentUrl: les.contentUrl,
                body: les.body,
                durationMinutes: les.durationMinutes,
                order: les.order,
                isPreview: les.isPreview,
              },
            });
          }
        }
      }
    }
  }
  console.log(`✅ Courses seeded: ${courses.length} courses (Internal + External)`);

  // 5. Learning Paths
  const paths = getMockLearningPaths();
  for (const p of paths) {
    const existingPath = await prisma.learningPath.findUnique({
      where: { slug: p.slug },
    });

    let pathId = existingPath?.id || p.id;

    if (!existingPath) {
      const createdPath = await prisma.learningPath.create({
        data: {
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          thumbnailUrl: p.thumbnailUrl,
          level: p.level as CourseLevel,
          status: p.status as PathStatus,
          isFeatured: p.isFeatured,
          estimatedHours: p.estimatedHours,
        },
      });
      pathId = createdPath.id;
    }

    // Seed path items
    for (const item of p.items) {
      await prisma.learningPathItem.upsert({
        where: {
          pathId_courseId: {
            pathId: pathId,
            courseId: item.courseId,
          },
        },
        update: {
          order: item.order,
          isRequired: item.isRequired,
          note: item.note,
        },
        create: {
          pathId: pathId,
          courseId: item.courseId,
          order: item.order,
          isRequired: item.isRequired,
          note: item.note,
        },
      });
    }
  }
  console.log(`✅ Learning Paths seeded: ${paths.length} paths`);

  // 6. Homepage Sections
  const homepageSections = getMockHomepageSections();
  for (const hs of homepageSections) {
    const existingHs = await prisma.homepageSection.findFirst({
      where: { title: hs.title },
    });
    if (!existingHs) {
      await prisma.homepageSection.create({
        data: {
          type: hs.type as HomepageSectionType,
          title: hs.title,
          config: hs.config,
          order: hs.order,
          isVisible: hs.isVisible,
        },
      });
    }
  }
  console.log(`✅ Homepage builder sections seeded`);

  // 7. Site Settings
  const siteSettings = getMockSiteSettings();
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      siteName: siteSettings.siteName,
      primaryColor: siteSettings.primaryColor,
      footerText: siteSettings.footerText,
      socialLinks: siteSettings.socialLinks,
    },
    create: siteSettings,
  });
  console.log(`✅ Site settings initialized`);

  console.log("🎉 Seeding complete successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding encountered an error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
