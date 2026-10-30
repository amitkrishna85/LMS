import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import {
  getMockUsers,
  getMockCourses,
  getMockLearningPaths,
} from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    // 1. Fetch counts
    const totalUsers = await safeDbQuery(() => prisma.user.count(), getMockUsers().length);
    const totalStudents = await safeDbQuery(
      () => prisma.user.count({ where: { role: "STUDENT" } }),
      getMockUsers().filter((u) => u.role === "STUDENT").length
    );
    const totalCourses = await safeDbQuery(() => prisma.course.count(), getMockCourses().length);
    const internalCourses = await safeDbQuery(
      () => prisma.course.count({ where: { type: "INTERNAL" } }),
      getMockCourses().filter((c) => c.type === "INTERNAL").length
    );
    const externalCourses = await safeDbQuery(
      () => prisma.course.count({ where: { type: "EXTERNAL" } }),
      getMockCourses().filter((c) => c.type === "EXTERNAL").length
    );
    const totalPaths = await safeDbQuery(() => prisma.learningPath.count(), getMockLearningPaths().length);
    const totalEnrollments = await safeDbQuery(() => prisma.enrollment.count(), 14);

    // 2. Fetch popular courses
    const popularCourses = await safeDbQuery(
      () =>
        prisma.course.findMany({
          take: 5,
          where: { status: "PUBLISHED" },
          orderBy: { enrollments: { _count: "desc" } },
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            level: true,
            externalProvider: true,
            _count: { select: { enrollments: true } },
          },
        }),
      getMockCourses().slice(0, 5).map((c, i) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        type: c.type,
        level: c.level,
        externalProvider: c.externalProvider,
        _count: { enrollments: 12 - i * 2 },
      }))
    );

    // 3. Fetch recent audit logs
    const recentActivity = await safeDbQuery(
      () =>
        prisma.auditLog.findMany({
          take: 6,
          orderBy: { createdAt: "desc" },
          include: { actor: { select: { name: true, email: true } } },
        }),
      [
        {
          id: "act_1",
          actorId: "usr_admin_1",
          action: "COURSE_PUBLISH",
          entity: "Course",
          entityId: "crs_int_1",
          actor: { name: "Alex Vance (Admin)", email: "admin@skillpulse.local" },
          createdAt: new Date(),
          meta: JSON.stringify({ title: "Full-Stack TypeScript with Next.js & Prisma" }),
        },
        {
          id: "act_2",
          actorId: "usr_admin_1",
          action: "USER_CREATE",
          entity: "User",
          entityId: "usr_student_3",
          actor: { name: "Alex Vance (Admin)", email: "admin@skillpulse.local" },
          createdAt: new Date(Date.now() - 3600000),
          meta: JSON.stringify({ email: "jordan@skillpulse.local", role: "STUDENT" }),
        },
      ]
    );

    return NextResponse.json({
      stats: {
        totalUsers,
        totalStudents,
        totalCourses,
        internalCourses,
        externalCourses,
        totalPaths,
        totalEnrollments,
      },
      popularCourses,
      recentActivity,
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    return NextResponse.json({ error: "Failed to load overview data" }, { status: 500 });
  }
}
