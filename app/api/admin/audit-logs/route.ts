import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma, safeDbQuery } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "15", 10);
  const skip = (page - 1) * limit;

  try {
    const [logs, total] = await safeDbQuery(
      async () => {
        const l = await prisma.auditLog.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            actor: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        });
        const cnt = await prisma.auditLog.count();
        return [l, cnt];
      },
      [
        [
          {
            id: "log_1",
            actorId: "usr_admin_1",
            action: "COURSE_PUBLISH",
            entity: "Course",
            entityId: "crs_int_1",
            actor: {
              id: "usr_admin_1",
              name: "Alex Vance (Admin)",
              email: "admin@skillpulse.local",
              role: "ADMIN",
            },
            meta: JSON.stringify({ title: "Full-Stack TypeScript with Next.js & Prisma" }),
            createdAt: new Date(),
          },
          {
            id: "log_2",
            actorId: "usr_admin_1",
            action: "USER_CREATE",
            entity: "User",
            entityId: "usr_student_3",
            actor: {
              id: "usr_admin_1",
              name: "Alex Vance (Admin)",
              email: "admin@skillpulse.local",
              role: "ADMIN",
            },
            meta: JSON.stringify({ email: "jordan@skillpulse.local", role: "STUDENT" }),
            createdAt: new Date(Date.now() - 3600000),
          },
        ],
        2,
      ]
    );

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List audit logs error:", error);
    return NextResponse.json(
      { error: "Failed to list audit logs" },
      { status: 500 }
    );
  }
}
