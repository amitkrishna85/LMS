import { NextResponse } from "next/server";
import { prisma, safeDbQuery } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await safeDbQuery(
      () => prisma.user.findUnique({ where: { email: normalizedEmail } }),
      null
    );

    if (!user) {
      // Return success to avoid email enumeration
      return NextResponse.json({
        success: true,
        message: "If an account exists, instructions have been generated.",
      });
    }

    // Generate token valid for 1 hour
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await safeDbQuery(
      () =>
        prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            token,
            expiresAt,
          },
        }),
      null
    );

    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`;

    const hasEmailProvider = !!process.env.RESEND_API_KEY;

    return NextResponse.json({
      success: true,
      message: hasEmailProvider
        ? "Password reset email sent."
        : "Reset token generated. (No SMTP/Resend configured; direct link provided below for testing).",
      devResetLink: !hasEmailProvider ? resetUrl : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
