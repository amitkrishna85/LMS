import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const dynamic = "force-dynamic";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[0-9]/, "Must include at least one number"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = result.data;
    const userEmail = session.user.email.toLowerCase().trim();

    const user = await safeDbQuery(
      () => prisma.user.findUnique({ where: { email: userEmail } }),
      null
    );

    if (user) {
      const match = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!match) {
        return NextResponse.json(
          { error: "Current password does not match" },
          { status: 400 }
        );
      }

      const newHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newHash,
          mustChangePassword: false,
        },
      });

      // Audit Log
      await safeDbQuery(
        () =>
          prisma.auditLog.create({
            data: {
              actorId: user.id,
              action: "PASSWORD_CHANGE",
              entity: "User",
              entityId: user.id,
              meta: JSON.stringify({ reason: "First login force change or user profile update" }),
            },
          }),
        null
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Failed to update password. Please try again." },
      { status: 500 }
    );
  }
}
