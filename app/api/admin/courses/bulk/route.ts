import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { updateMockCourse, deleteMockCourse } from "@/lib/mock-data";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bulkSchema = z.object({
  courseIds: z.array(z.string()).min(1, "Select at least one course"),
  action: z.enum(["PUBLISH", "ARCHIVE", "DRAFT", "DELETE"]),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await req.json();
    const result = bulkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { courseIds, action } = result.data;

    if (action === "DELETE") {
      await safeDbQuery(
        () => prisma.course.deleteMany({ where: { id: { in: courseIds } } }),
        null
      );
      courseIds.forEach((id) => deleteMockCourse(id));
    } else {
      const statusMap: Record<string, "PUBLISHED" | "ARCHIVED" | "DRAFT"> = {
        PUBLISH: "PUBLISHED",
        ARCHIVE: "ARCHIVED",
        DRAFT: "DRAFT",
      };
      await safeDbQuery(
        () =>
          prisma.course.updateMany({
            where: { id: { in: courseIds } },
            data: { status: statusMap[action] },
          }),
        null
      );
      courseIds.forEach((id) =>
        updateMockCourse(id, { status: statusMap[action] })
      );
    }

    // Audit Log
    await safeDbQuery(
      () =>
        prisma.auditLog.create({
          data: {
            actorId: session.user.id,
            action: `COURSES_BULK_${action}`,
            entity: "Course",
            meta: JSON.stringify({ count: courseIds.length, courseIds }),
          },
        }),
      null
    );

    return NextResponse.json({
      success: true,
      message: `Successfully executed ${action.toLowerCase()} on ${courseIds.length} course(s)`,
    });
  } catch (error) {
    console.error("Bulk courses error:", error);
    return NextResponse.json(
      { error: "Failed to execute bulk action" },
      { status: 500 }
    );
  }
}
