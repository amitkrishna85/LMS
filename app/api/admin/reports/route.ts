import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { getMockCourses, getMockUsers } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const courses = await safeDbQuery(
      () =>
        prisma.course.findMany({
          include: {
            category: true,
            _count: {
              select: {
                enrollments: true,
                externalCourseProgress: true,
              },
            },
          },
        }),
      getMockCourses().map((c) => ({
        ...c,
        category: { id: "cat_swe", name: "Software Engineering", slug: "swe", parentId: null, createdAt: new Date() },
        _count: { enrollments: 12, externalCourseProgress: 5 },
      })) as any
    );

    const reportRows = courses.map((c: any) => {
      const activeEnrollments = c.type === "INTERNAL"
        ? c._count?.enrollments || 0
        : c._count?.externalCourseProgress || 0;

      // Estimate completion rate
      const completionRate = activeEnrollments > 0 ? Math.min(100, Math.round(activeEnrollments * 12.5)) : 0;

      return {
        id: c.id,
        title: c.title,
        type: c.type,
        provider: c.type === "EXTERNAL" ? (c.externalProvider || "Udemy") : "Hosted",
        category: c.category?.name || "General",
        level: c.level,
        enrollments: activeEnrollments,
        completionRate: `${completionRate}%`,
        status: c.status,
      };
    });

    return NextResponse.json({ reportRows });
  } catch (error) {
    console.error("Reports error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
