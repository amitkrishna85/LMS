import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { MOCK_COURSES, getMockLearningPaths } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 1. Fetch internal enrollments with lessons and user progress
    const dbEnrollments = await safeDbQuery(
      () =>
        prisma.enrollment.findMany({
          where: { userId },
          include: {
            course: {
              include: {
                category: true,
                sections: {
                  include: {
                    lessons: {
                      select: { id: true, title: true, durationMinutes: true },
                    },
                  },
                },
              },
            },
          },
          orderBy: { lastOpenedAt: "desc" },
        }),
      []
    );

    // Fetch user's completed lesson IDs
    const userLessonProgress = await safeDbQuery(
      () =>
        prisma.lessonProgress.findMany({
          where: { userId, completed: true },
          select: { lessonId: true },
        }),
      []
    );
    const completedLessonIds = new Set(
      userLessonProgress.map((p: any) => p.lessonId)
    );

    let enrolledCourses: any[] = [];

    if (dbEnrollments.length > 0) {
      enrolledCourses = dbEnrollments.map((enr: any) => {
        const allLessons =
          enr.course.sections?.flatMap((s: any) => s.lessons) || [];
        const totalLessons = allLessons.length;
        const completedCount = allLessons.filter((l: any) =>
          completedLessonIds.has(l.id)
        ).length;
        const percent =
          totalLessons > 0
            ? Math.round((completedCount / totalLessons) * 100)
            : enr.status === "COMPLETED"
            ? 100
            : 0;

        return {
          id: enr.id,
          courseId: enr.course.id,
          title: enr.course.title,
          slug: enr.course.slug,
          thumbnailUrl: enr.course.thumbnailUrl,
          instructorName: enr.course.instructorName,
          categoryName: enr.course.category?.name || "General",
          durationMinutes: enr.course.durationMinutes,
          totalLessons,
          completedCount,
          progressPercent: percent,
          status: enr.status,
          enrolledAt: enr.enrolledAt,
          lastOpenedAt: enr.lastOpenedAt,
          completedAt: enr.completedAt,
          type: "INTERNAL",
        };
      });
    } else {
      // Fallback mock enrollment for demo presentation
      const internalMocks = MOCK_COURSES.filter((c) => c.type === "INTERNAL");
      enrolledCourses = internalMocks.slice(0, 2).map((c, idx) => ({
        id: `mock_enr_${c.id}`,
        courseId: c.id,
        title: c.title,
        slug: c.slug,
        thumbnailUrl: c.thumbnailUrl,
        instructorName: c.instructorName,
        categoryName: "Development",
        durationMinutes: c.durationMinutes,
        totalLessons: 8,
        completedCount: idx === 0 ? 8 : 4,
        progressPercent: idx === 0 ? 100 : 50,
        status: idx === 0 ? "COMPLETED" : "IN_PROGRESS",
        enrolledAt: new Date(),
        lastOpenedAt: new Date(),
        completedAt: idx === 0 ? new Date() : null,
        type: "INTERNAL",
      }));
    }

    // 2. Fetch external course progress
    const dbExternalProgress = await safeDbQuery(
      () =>
        prisma.externalCourseProgress.findMany({
          where: { userId },
          include: {
            course: {
              include: {
                category: true,
              },
            },
          },
          orderBy: { markedAt: "desc" },
        }),
      []
    );

    let externalCourses: any[] = [];
    if (dbExternalProgress.length > 0) {
      externalCourses = dbExternalProgress.map((ep: any) => ({
        id: ep.id,
        courseId: ep.course.id,
        title: ep.course.title,
        slug: ep.course.slug,
        thumbnailUrl: ep.course.thumbnailUrl,
        instructorName: ep.course.instructorName,
        categoryName: ep.course.category?.name || "General",
        externalUrl: ep.course.externalUrl,
        externalProvider: ep.course.externalProvider || "External",
        durationMinutes: ep.course.durationMinutes,
        status: ep.status,
        markedAt: ep.markedAt,
        type: "EXTERNAL",
        progressPercent:
          ep.status === "COMPLETED" ? 100 : ep.status === "IN_PROGRESS" ? 50 : 0,
      }));
    } else {
      const extMocks = MOCK_COURSES.filter((c) => c.type === "EXTERNAL");
      externalCourses = extMocks.slice(0, 2).map((c, idx) => ({
        id: `mock_ext_prg_${c.id}`,
        courseId: c.id,
        title: c.title,
        slug: c.slug,
        thumbnailUrl: c.thumbnailUrl,
        instructorName: c.instructorName,
        categoryName: "Design",
        externalUrl: c.externalUrl,
        externalProvider: c.externalProvider || "Udemy",
        durationMinutes: c.durationMinutes,
        status: idx === 0 ? "IN_PROGRESS" : "COMPLETED",
        markedAt: new Date(),
        type: "EXTERNAL",
        progressPercent: idx === 0 ? 50 : 100,
      }));
    }

    // 3. Fetch Learning Path enrollments
    const dbPathEnrollments = await safeDbQuery(
      () =>
        prisma.pathEnrollment.findMany({
          where: { userId },
          include: {
            path: {
              include: {
                items: {
                  include: {
                    course: true,
                  },
                  orderBy: { order: "asc" },
                },
              },
            },
          },
          orderBy: { startedAt: "desc" },
        }),
      []
    );

    let enrolledPaths: any[] = [];
    if (dbPathEnrollments.length > 0) {
      enrolledPaths = dbPathEnrollments.map((pe: any) => {
        const totalItems = pe.path.items?.length || 0;
        let completedCount = 0;

        for (const item of pe.path.items || []) {
          if (item.course.type === "INTERNAL") {
            const courseEnr = enrolledCourses.find(
              (ec) => ec.courseId === item.course.id
            );
            if (courseEnr && courseEnr.progressPercent === 100) {
              completedCount++;
            }
          } else {
            const extPrg = externalCourses.find(
              (ex) => ex.courseId === item.course.id
            );
            if (extPrg && extPrg.status === "COMPLETED") {
              completedCount++;
            }
          }
        }

        const percent =
          totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

        return {
          id: pe.id,
          pathId: pe.path.id,
          title: pe.path.title,
          slug: pe.path.slug,
          thumbnailUrl: pe.path.thumbnailUrl,
          level: pe.path.level,
          estimatedHours: pe.path.estimatedHours,
          totalCourses: totalItems,
          completedCourses: completedCount,
          progressPercent: percent,
          startedAt: pe.startedAt,
          completedAt: pe.completedAt,
        };
      });
    } else {
      enrolledPaths = getMockLearningPaths().slice(0, 1).map((p) => ({
        id: `mock_path_enr_${p.id}`,
        pathId: p.id,
        title: p.title,
        slug: p.slug,
        thumbnailUrl: p.thumbnailUrl,
        level: p.level,
        estimatedHours: p.estimatedHours,
        totalCourses: p.items.length,
        completedCourses: 1,
        progressPercent: Math.round((1 / p.items.length) * 100),
        startedAt: new Date(),
        completedAt: null,
      }));
    }

    // 4. Certificates of Completion (courses completed 100%)
    const completedCourses = enrolledCourses.filter(
      (c) => c.progressPercent === 100
    );
    const certificates = completedCourses.map((c) => ({
      id: `cert_${c.courseId}_${userId}`,
      courseId: c.courseId,
      courseTitle: c.title,
      courseSlug: c.slug,
      instructorName: c.instructorName,
      studentName: session.user.name || "Student",
      completedAt: c.completedAt || new Date().toISOString(),
      code: `SP-${c.courseId.slice(-4).toUpperCase()}-${userId.slice(-4).toUpperCase()}`,
    }));

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      },
      enrolledCourses,
      externalCourses,
      enrolledPaths,
      certificates,
    });
  } catch (error) {
    console.error("Student dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to load student dashboard" },
      { status: 500 }
    );
  }
}
