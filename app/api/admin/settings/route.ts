import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { getMockSiteSettings } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await safeDbQuery(
      () => prisma.siteSettings.findUnique({ where: { id: "default" } }),
      ({ ...getMockSiteSettings(), updatedAt: new Date() } as any)
    );

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await req.json();

    const updated = await safeDbQuery(
      () =>
        prisma.siteSettings.upsert({
          where: { id: "default" },
          update: body,
          create: { id: "default", ...body },
        }),
      { id: "default", ...body }
    );

    // Audit Log
    await safeDbQuery(
      () =>
        prisma.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "SITE_SETTINGS_UPDATE",
            entity: "SiteSettings",
            entityId: "default",
            meta: JSON.stringify(body),
          },
        }),
      null
    );

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
