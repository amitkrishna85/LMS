import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { getMockHomepageSections } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sections = await safeDbQuery(
      () =>
        prisma.homepageSection.findMany({
          orderBy: { order: "asc" },
        }),
      getMockHomepageSections()
    );

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("List homepage sections error:", error);
    return NextResponse.json(
      { error: "Failed to list homepage sections" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const { sectionId, config, isVisible, order } = await req.json();

    const updateData: any = {};
    if (config !== undefined) updateData.config = typeof config === "string" ? config : JSON.stringify(config);
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    if (order !== undefined) updateData.order = order;

    const updated = await safeDbQuery(
      () =>
        prisma.homepageSection.update({
          where: { id: sectionId },
          data: updateData,
        }),
      { id: sectionId, ...updateData }
    );

    // Audit Log
    await safeDbQuery(
      () =>
        prisma.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "HOMEPAGE_SECTION_UPDATE",
            entity: "HomepageSection",
            entityId: sectionId,
            meta: JSON.stringify(updateData),
          },
        }),
      null
    );

    return NextResponse.json({ success: true, section: updated });
  } catch (error) {
    console.error("Update homepage section error:", error);
    return NextResponse.json(
      { error: "Failed to update homepage section" },
      { status: 500 }
    );
  }
}
