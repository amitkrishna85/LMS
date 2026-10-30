import { NextResponse } from "next/server";
import { prisma, safeDbQuery } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const dynamic = "force-dynamic";

const resetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[0-9]/, "Must include at least one number"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = resetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, newPassword } = result.data;

    const resetRecord = await safeDbQuery(
      () =>
        prisma.passwordResetToken.findUnique({
          where: { token },
          include: { user: true },
        }),
      null
    );

    if (!resetRecord) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    if (new Date() > resetRecord.expiresAt) {
      await safeDbQuery(
        () => prisma.passwordResetToken.delete({ where: { id: resetRecord.id } }),
        null
      );
      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    });

    // Delete token after successful use
    await safeDbQuery(
      () => prisma.passwordResetToken.delete({ where: { id: resetRecord.id } }),
      null
    );

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
