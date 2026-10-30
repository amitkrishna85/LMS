import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma, safeDbQuery } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Authentication required to enroll" },
        { status: 401 }
      );
    }

    const { slug } = params;
    const userId = session.user.id;

    const course = await safeDbQuery(
      () => prisma.course.findUnique({ where: { slug } }),
      null
    );

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.type === "INTERNAL") {
      const enrollment = await safeDbQuery(
        () =>
          prisma.enrollment.upsert({
            where: {
              userId_courseId: {
                userId,
                courseId: course.id,
              },
            },
            update: { lastOpenedAt: new Date() },
            create: {
              userId,
              courseId: course.id,
              status: "ENROLLED",
            },
          }),
        { id: "mock_enr_" + Date.now(), userId, courseId: course.id, status: "ENROLLED" }
      );

      // Audit Log
      await safeDbQuery(
        () =>
          prisma.auditLog.create({
            data: {
              actorId: userId,
              action: "STUDENT_ENROLL",
              entity: "Course",
              entityId: course.id,
              meta: JSON.stringify({ courseTitle: course.title }),
            },
          }),
        null
      );

      return NextResponse.json({ success: true, enrollment });
    } else {
      // External course: mark as in progress
      const progress = await safeDbQuery(
        () =>
          prisma.externalCourseProgress.upsert({
            where: {
              userId_courseId: {
                userId,
                courseId: course.id,
              },
            },
            update: { markedAt: new Date() },
            create: {
              userId,
              courseId: course.id,
              status: "IN_PROGRESS",
            },
          }),
        { id: "mock_ext_" + Date.now(), userId, courseId: course.id, status: "IN_PROGRESS" }
      );

      return NextResponse.json({ success: true, progress });
    }
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Failed to enroll in course" },
      { status: 500 }
    );
  }
}
