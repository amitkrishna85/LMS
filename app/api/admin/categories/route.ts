import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { getMockCategories } from "@/lib/mock-data";
import { slugify } from "@/lib/utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z.string().optional(),
  parentId: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const categories = await safeDbQuery(
      () =>
        prisma.category.findMany({
          orderBy: { name: "asc" },
          include: {
            parent: { select: { id: true, name: true } },
            _count: { select: { courses: true } },
          },
        }),
      getMockCategories().map((c) => ({
        ...c,
        parent: null,
        _count: { courses: 2 },
      }))
    );

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("List categories error:", error);
    return NextResponse.json(
      { error: "Failed to list categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await req.json();
    const result = categorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, parentId } = result.data;
    const baseSlug = result.data.slug ? slugify(result.data.slug) : slugify(name);
    let finalSlug = baseSlug;

    // Check collision
    const existing = await safeDbQuery(
      () => prisma.category.findUnique({ where: { slug: finalSlug } }),
      null
    );

    if (existing) {
      finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const category = await safeDbQuery(
      () =>
        prisma.category.create({
          data: {
            name,
            slug: finalSlug,
            parentId: parentId || null,
          },
        }),
      {
        id: "cat_new_" + Date.now(),
        name,
        slug: finalSlug,
        parentId: parentId || null,
      }
    );

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
