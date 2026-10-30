import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const progressSchema = z.object({
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]).optional(),
  action: z.enum(["OUTBOUND_CLICK", "UPDATE_STATUS"]).default("UPDATE_STATUS"),
});

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const { slug } = params;
    const body = await req.json();
    const result = progressSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { status, action } = result.data;

    const course = await safeDbQuery(
      () => prisma.course.findUnique({ where: { slug } }),
      null
    );

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // 1. If Outbound Click, record audit tracking
    if (action === "OUTBOUND_CLICK") {
      await safeDbQuery(
        () =>
          prisma.auditLog.create({
            data: {
              actorId: userId || null,
              action: "EXTERNAL_COURSE_OUTBOUND_CLICK",
              entity: "Course",
              entityId: course.id,
              meta: JSON.stringify({
                externalUrl: course.externalUrl,
                provider: course.externalProvider,
              }),
            },
          }),
        null
      );
    }

    // 2. If student is authenticated and setting status, update ExternalCourseProgress
    if (userId && status) {
      const progress = await safeDbQuery(
        () =>
          prisma.externalCourseProgress.upsert({
            where: {
              userId_courseId: {
                userId,
                courseId: course.id,
              },
            },
            update: {
              status,
              markedAt: new Date(),
            },
            create: {
              userId,
              courseId: course.id,
              status,
            },
          }),
        { userId, courseId: course.id, status }
      );

      return NextResponse.json({ success: true, progress });
    }

    return NextResponse.json({ success: true, message: "Outbound click tracked" });
  } catch (error) {
    console.error("External progress error:", error);
    return NextResponse.json(
      { error: "Failed to update external progress" },
      { status: 500 }
    );
  }
}
