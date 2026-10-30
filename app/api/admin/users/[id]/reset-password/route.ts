import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const { id } = params;

    const user = await safeDbQuery(
      () => prisma.user.findUnique({ where: { id } }),
      null
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Generate new temporary password
    const tempPassword = "Reset" + Math.floor(1000 + Math.random() * 9000) + "!";
    const newHash = await bcrypt.hash(tempPassword, 10);

    // 2. Generate reset token valid for 24 hours
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await safeDbQuery(
      async () => {
        await prisma.user.update({
          where: { id },
          data: {
            passwordHash: newHash,
            mustChangePassword: true,
          },
        });

        await prisma.passwordResetToken.create({
          data: {
            userId: id,
            token,
            expiresAt,
          },
        });
      },
      null
    );

    const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`;

    // Audit Log
    await safeDbQuery(
      () =>
        prisma.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "ADMIN_PASSWORD_RESET",
            entity: "User",
            entityId: id,
            meta: JSON.stringify({ targetEmail: user.email }),
          },
        }),
      null
    );

    return NextResponse.json({
      success: true,
      message: "Password reset processed",
      temporaryPassword: tempPassword,
      resetLink,
    });
  } catch (error) {
    console.error("Admin reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
