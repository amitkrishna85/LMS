import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export function unauthorizedResponse(message = "Unauthorized: Admin privileges required") {
  return NextResponse.json({ error: message }, { status: 403 });
}
