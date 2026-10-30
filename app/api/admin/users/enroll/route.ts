import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const enrollSchema = z.object({
  userIds: z.array(z.string()).min(1, "Select at least one user"),
  targetType: z.enum(["COURSE", "PATH"]),
  targetId: z.string().min(1, "Target ID is required"),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await req.json();
    const result = enrollSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { userIds, targetType, targetId } = result.data;
    let enrolledCount = 0;

    if (targetType === "COURSE") {
      for (const userId of userIds) {
        await safeDbQuery(
          () =>
            prisma.enrollment.upsert({
              where: {
                userId_courseId: {
                  userId,
                  courseId: targetId,
                },
              },
              update: { status: "ENROLLED" },
              create: {
                userId,
                courseId: targetId,
                status: "ENROLLED",
              },
            }),
          null
        );
        enrolledCount++;
      }
    } else {
      for (const userId of userIds) {
        await safeDbQuery(
          () =>
            prisma.pathEnrollment.upsert({
              where: {
                userId_pathId: {
                  userId,
                  pathId: targetId,
                },
              },
              update: {},
              create: {
                userId,
                pathId: targetId,
              },
            }),
          null
        );
        enrolledCount++;
      }
    }

    // Audit Log
    await safeDbQuery(
      () =>
        prisma.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "BULK_ENROLL",
            entity: targetType,
            entityId: targetId,
            meta: JSON.stringify({ enrolledUsersCount: enrolledCount }),
          },
        }),
      null
    );

    return NextResponse.json({
      success: true,
      message: `Enrolled ${enrolledCount} user(s) successfully`,
    });
  } catch (error) {
    console.error("Bulk enroll error:", error);
    return NextResponse.json({ error: "Failed to enroll users" }, { status: 500 });
  }
}
