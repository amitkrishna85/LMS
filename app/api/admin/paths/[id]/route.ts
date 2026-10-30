import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { getMockLearningPaths } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const { id } = params;

    const path = await safeDbQuery(
      () =>
        prisma.learningPath.findUnique({
          where: { id },
          include: {
            items: {
              orderBy: { order: "asc" },
              include: {
                course: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    type: true,
                    externalProvider: true,
                    externalUrl: true,
                    thumbnailUrl: true,
                    durationMinutes: true,
                    level: true,
                  },
                },
              },
            },
          },
        }),
      (getMockLearningPaths().find((p) => p.id === id) as any) || null
    );

    if (!path) {
      return NextResponse.json({ error: "Path not found" }, { status: 404 });
    }

    return NextResponse.json({ path });
  } catch (error) {
    console.error("Get path error:", error);
    return NextResponse.json({ error: "Failed to fetch path" }, { status: 500 });
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

    const updated = await safeDbQuery(
      () =>
        prisma.learningPath.update({
          where: { id },
          data: body,
        }),
      { id, ...body, updatedAt: new Date() }
    );

    // Audit Log
    await safeDbQuery(
      () =>
        prisma.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "LEARNING_PATH_UPDATE",
            entity: "LearningPath",
            entityId: id,
            meta: JSON.stringify(body),
          },
        }),
      null
    );

    return NextResponse.json({ success: true, path: updated });
  } catch (error) {
    console.error("Update path error:", error);
    return NextResponse.json({ error: "Failed to update path" }, { status: 500 });
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
      () => prisma.learningPath.delete({ where: { id } }),
      null
    );

    // Audit Log
    await safeDbQuery(
      () =>
        prisma.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "LEARNING_PATH_DELETE",
            entity: "LearningPath",
            entityId: id,
          },
        }),
      null
    );

    return NextResponse.json({ success: true, message: "Path deleted" });
  } catch (error) {
    console.error("Delete path error:", error);
    return NextResponse.json({ error: "Failed to delete path" }, { status: 500 });
  }
}
