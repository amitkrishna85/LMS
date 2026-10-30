import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  role: z.enum(["ADMIN", "STUDENT"]).optional(),
  isActive: z.boolean().optional(),
  mustChangePassword: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const { id } = params;
    const body = await req.json();
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const updatedUser = await safeDbQuery(
      () =>
        prisma.user.update({
          where: { id },
          data: result.data,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
            updatedAt: true,
          },
        }),
      {
        id,
        name: result.data.name || "Updated User",
        email: "user@example.com",
        role: result.data.role || "STUDENT",
        isActive: result.data.isActive ?? true,
        mustChangePassword: result.data.mustChangePassword ?? false,
        updatedAt: new Date(),
      }
    );

    // Audit Log
    await safeDbQuery(
      () =>
        prisma.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "USER_UPDATE",
            entity: "User",
            entityId: id,
            meta: JSON.stringify(result.data),
          },
        }),
      null
    );

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
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

    // Prevent admin from deleting themselves
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "You cannot delete your own administrative account" },
        { status: 400 }
      );
    }

    await safeDbQuery(
      () => prisma.user.delete({ where: { id } }),
      null
    );

    // Audit Log
    await safeDbQuery(
      () =>
        prisma.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "USER_DELETE",
            entity: "User",
            entityId: id,
          },
        }),
      null
    );

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
