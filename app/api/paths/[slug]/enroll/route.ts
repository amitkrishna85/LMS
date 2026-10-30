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
        { error: "Authentication required to enroll in learning paths" },
        { status: 401 }
      );
    }

    const { slug } = params;
    const userId = session.user.id;

    const path = await safeDbQuery(
      () =>
        prisma.learningPath.findUnique({
          where: { slug },
          include: {
            items: {
              include: {
                course: true,
              },
              orderBy: { order: "asc" },
            },
          },
        }),
      null
    );

    if (!path) {
      return NextResponse.json(
        { error: "Learning path not found" },
        { status: 404 }
      );
    }

    // Upsert path enrollment
    const pathEnrollment = await safeDbQuery(
      () =>
        prisma.pathEnrollment.upsert({
          where: {
            userId_pathId: {
              userId,
              pathId: path.id,
            },
          },
          update: {},
          create: {
            userId,
            pathId: path.id,
            startedAt: new Date(),
          },
        }),
      {
        id: "mock_path_enr_" + Date.now(),
        userId,
        pathId: path.id,
        startedAt: new Date(),
      }
    );

    // Optionally auto-enroll in internal courses
    if (path.items && path.items.length > 0) {
      for (const item of path.items) {
        if (item.course && item.course.type === "INTERNAL") {
          await safeDbQuery(
            () =>
              prisma.enrollment.upsert({
                where: {
                  userId_courseId: {
                    userId,
                    courseId: item.course.id,
                  },
                },
                update: {},
                create: {
                  userId,
                  courseId: item.course.id,
                  status: "ENROLLED",
                },
              }),
            null
          );
        }
      }
    }

    // Audit log
    await safeDbQuery(
      () =>
        prisma.auditLog.create({
          data: {
            actorId: userId,
            action: "STUDENT_PATH_ENROLL",
            entity: "LearningPath",
            entityId: path.id,
            meta: JSON.stringify({ pathTitle: path.title }),
          },
        }),
      null
    );

    return NextResponse.json({
      success: true,
      message: `Successfully enrolled in ${path.title}`,
      pathEnrollment,
    });
  } catch (error) {
    console.error("Path enrollment error:", error);
    return NextResponse.json(
      { error: "Failed to enroll in learning path" },
      { status: 500 }
    );
  }
}
