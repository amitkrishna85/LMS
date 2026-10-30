import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { getMockLearningPaths, addMockLearningPath } from "@/lib/mock-data";
import { slugify } from "@/lib/utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const pathSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  thumbnailUrl: z.string().nullable().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  estimatedHours: z.number().int().nonnegative().default(20),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const paths = await safeDbQuery(
      () =>
        prisma.learningPath.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              orderBy: { order: "asc" },
              include: {
                course: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    type: true,
                    externalProvider: true,
                    durationMinutes: true,
                    level: true,
                  },
                },
              },
            },
            _count: {
              select: {
                enrollments: true,
                items: true,
              },
            },
          },
        }),
      getMockLearningPaths().map((p: any) => ({
        ...p,
        items: (p.items || []).map((it: any) => ({
          ...it,
          course: it.course || {
            id: it.courseId,
            title: "Course " + it.courseId,
            slug: "course-" + it.courseId,
            type: "INTERNAL",
            durationMinutes: 180,
            level: "INTERMEDIATE",
            externalProvider: null,
          },
        })),
        _count: p._count || { enrollments: 0, items: (p.items || []).length },
      })) as any
    );

    return NextResponse.json({ paths });
  } catch (error) {
    console.error("List paths error:", error);
    return NextResponse.json({ error: "Failed to list paths" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await req.json();
    const result = pathSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = result.data;
    const baseSlug = data.slug ? slugify(data.slug) : slugify(data.title);
    let finalSlug = baseSlug;

    const existingSlug = await safeDbQuery(
      () => prisma.learningPath.findUnique({ where: { slug: finalSlug } }),
      null
    );

    if (existingSlug) {
      finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const path = await safeDbQuery(
      () =>
        prisma.learningPath.create({
          data: {
            title: data.title,
            slug: finalSlug,
            description: data.description,
            thumbnailUrl: data.thumbnailUrl || null,
            level: data.level,
            status: data.status,
            isFeatured: data.isFeatured,
            estimatedHours: data.estimatedHours,
          },
        }),
      {
        id: "path_" + Date.now(),
        ...data,
        slug: finalSlug,
        items: [],
        _count: { enrollments: 0, items: 0 },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );

    const savedPath = path || {
      id: "path_" + Date.now(),
      ...data,
      slug: finalSlug,
      items: [],
      _count: { enrollments: 0, items: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addMockLearningPath(savedPath);

    // Audit Log
    await safeDbQuery(
      () =>
        prisma.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "LEARNING_PATH_CREATE",
            entity: "LearningPath",
            entityId: savedPath.id,
            meta: JSON.stringify({ title: savedPath.title, status: savedPath.status }),
          },
        }),
      null
    );

    return NextResponse.json({ success: true, path: savedPath });
  } catch (error) {
    console.error("Create path error:", error);
    return NextResponse.json({ error: "Failed to create path" }, { status: 500 });
  }
}
