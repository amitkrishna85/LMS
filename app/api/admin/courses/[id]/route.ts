import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { getMockCourses } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const { id } = params;

    const course = await safeDbQuery(
      () =>
        prisma.course.findUnique({
          where: { id },
          include: {
            category: true,
            sections: {
              orderBy: { order: "asc" },
              include: {
                lessons: {
                  orderBy: { order: "asc" },
                },
              },
            },
            _count: {
              select: {
                enrollments: true,
                learningPathItems: true,
              },
            },
          },
        }),
      getMockCourses().find((c) => c.id === id) || null
    );

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Get course error:", error);
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const { id } = params;
    const body = await req.json();

    // Check externalUrl validity if type is EXTERNAL
    if (body.type === "EXTERNAL" && body.externalUrl) {
      if (!body.externalUrl.startsWith("https://")) {
        return NextResponse.json(
          { error: "External course URL must begin with https://" },
          { status: 400 }
        );
      }
    }

    const updated = await safeDbQuery(
      () =>
        prisma.course.update({
          where: { id },
          data: body,
        }),
      {
        id,
        ...body,
        updatedAt: new Date(),
      }
    );

    // Audit Log
    await safeDbQuery(
      () =>
        prisma.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "COURSE_UPDATE",
            entity: "Course",
            entityId: id,
            meta: JSON.stringify(body),
          },
        }),
      null
    );

    return NextResponse.json({ success: true, course: updated });
  } catch (error) {
    console.error("Update course error:", error);
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const { id } = params;

    await safeDbQuery(
      () => prisma.course.delete({ where: { id } }),
      null
    );

    // Audit Log
    await safeDbQuery(
      () =>
        prisma.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "COURSE_DELETE",
            entity: "Course",
            entityId: id,
          },
        }),
      null
    );

    return NextResponse.json({ success: true, message: "Course deleted" });
  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
