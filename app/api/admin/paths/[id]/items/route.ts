import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const addItemSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  order: z.number().int().default(1),
  isRequired: z.boolean().default(true),
  note: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const { id: pathId } = params;
    const body = await req.json();
    const result = addItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { courseId, order, isRequired, note } = result.data;

    const item = await safeDbQuery(
      () =>
        prisma.learningPathItem.upsert({
          where: {
            pathId_courseId: {
              pathId,
              courseId,
            },
          },
          update: {
            order,
            isRequired,
            note: note || null,
          },
          create: {
            pathId,
            courseId,
            order,
            isRequired,
            note: note || null,
          },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                type: true,
                externalProvider: true,
                level: true,
              },
            },
          },
        }),
      {
        id: "pi_" + Date.now(),
        pathId,
        courseId,
        order,
        isRequired,
        note: note || null,
      }
    );

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Add path item error:", error);
    return NextResponse.json({ error: "Failed to add course to path" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { itemId, order, isRequired, note } = body;

    const updated = await safeDbQuery(
      () =>
        prisma.learningPathItem.update({
          where: { id: itemId },
          data: {
            order,
            isRequired,
            note,
          },
        }),
      { id: itemId, order, isRequired, note }
    );

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("Update path item error:", error);
    return NextResponse.json({ error: "Failed to update path step" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "itemId required" }, { status: 400 });
    }

    await safeDbQuery(
      () => prisma.learningPathItem.delete({ where: { id: itemId } }),
      null
    );

    return NextResponse.json({ success: true, message: "Course removed from path" });
  } catch (error) {
    console.error("Delete path item error:", error);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
