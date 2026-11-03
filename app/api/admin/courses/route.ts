import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { getMockCourses, addMockCourse, getMockCategories } from "@/lib/mock-data";
import { slugify } from "@/lib/utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const courseSchema = z
  .object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    slug: z.string().optional(),
    shortDescription: z.string().min(2, "Short description must be at least 2 characters").default("Comprehensive course curriculum"),
    description: z.string().min(2, "Detailed description must be at least 2 characters").default("Comprehensive course curriculum covering essential techniques, architecture, and practical implementations."),
    thumbnailUrl: z.string().nullable().optional(),
    videoUrl: z
      .string()
      .regex(/^(https:\/\/|\/uploads\/)/, "A valid uploaded video URL is required")
      .optional(),
    uploadedFiles: z
      .array(
        z.object({
          name: z.string().trim().min(1).max(255),
          url: z.string().regex(/^(https:\/\/|\/uploads\/)/),
          contentType: z.string().max(150).default("application/octet-stream"),
        })
      )
      .max(50)
      .default([]),
    writtenContent: z.string().max(50000).optional(),
    instructorName: z.string().min(1, "Instructor name is required").default("Expert Instructor"),
    level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
    language: z.string().default("English"),
    durationMinutes: z.number().int().nonnegative().default(60),
    tags: z.array(z.string()).default([]),
    categoryId: z.string().optional().default("cat_swe"),
    type: z.enum(["INTERNAL", "EXTERNAL"]).default("INTERNAL"),
    externalUrl: z.string().nullable().optional(),
    externalProvider: z.string().nullable().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
    isFeatured: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.type === "EXTERNAL") {
        if (!data.externalUrl || !data.externalUrl.startsWith("https://")) {
          return false;
        }
      }
      return true;
    },
    {
      message: "External courses require a valid https:// URL",
      path: ["externalUrl"],
    }
  )
  .refine(
    (data) =>
      data.type === "EXTERNAL" ||
      Boolean(
        data.videoUrl ||
          data.uploadedFiles.length > 0 ||
          data.writtenContent?.trim()
      ),
    {
      message: "Add a video or written lesson content.",
      path: ["writtenContent"],
    }
  );

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const status = searchParams.get("status") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  try {
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { instructorName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type && (type === "INTERNAL" || type === "EXTERNAL")) {
      whereClause.type = type;
    }

    if (status && (status === "DRAFT" || status === "PUBLISHED" || status === "ARCHIVED")) {
      whereClause.status = status;
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "popular") {
      orderBy = { enrollments: { _count: "desc" } };
    } else if (sort === "title") {
      orderBy = { title: "asc" };
    }

    const [courses, total] = await safeDbQuery(
      async () => {
        const c = await prisma.course.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy,
          include: {
            category: { select: { id: true, name: true, slug: true } },
            _count: {
              select: {
                sections: true,
                enrollments: true,
              },
            },
          },
        });
        const cnt = await prisma.course.count({ where: whereClause });
        return [c, cnt];
      },
      (() => {
        let list = getMockCourses().map((c: any) => {
          const cat = getMockCategories().find((cat: any) => cat.id === c.categoryId);
          return {
            ...c,
            category: cat
              ? { id: cat.id, name: cat.name, slug: cat.slug }
              : { id: c.categoryId || "cat_swe", name: "Engineering", slug: "swe" },
            _count: c._count || { sections: c.sections?.length || 0, enrollments: 8 },
          };
        });

        if (search) {
          const s = search.toLowerCase();
          list = list.filter(
            (c: any) =>
              c.title?.toLowerCase().includes(s) ||
              c.shortDescription?.toLowerCase().includes(s) ||
              c.instructorName?.toLowerCase().includes(s)
          );
        }

        if (type && (type === "INTERNAL" || type === "EXTERNAL")) {
          list = list.filter((c: any) => c.type === type);
        }

        if (status && (status === "DRAFT" || status === "PUBLISHED" || status === "ARCHIVED")) {
          list = list.filter((c: any) => c.status === status);
        }

        if (categoryId) {
          list = list.filter((c: any) => c.categoryId === categoryId);
        }

        if (sort === "title") {
          list.sort((a: any, b: any) => (a.title || "").localeCompare(b.title || ""));
        } else {
          list.sort(
            (a: any, b: any) =>
              new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
        }

        const totalCnt = list.length;
        const paginated = list.slice(skip, skip + limit);
        return [paginated, totalCnt];
      })()
    );

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List admin courses error:", error);
    return NextResponse.json(
      { error: "Failed to list courses" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = await req.json();
    const result = courseSchema.safeParse(body);

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
      () => prisma.course.findUnique({ where: { slug: finalSlug } }),
      null
    );

    if (existingSlug) {
      finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const lessonCreates = [
      ...(data.videoUrl
        ? [
            {
              title: data.title,
              type: "VIDEO" as const,
              contentUrl: data.videoUrl,
              durationMinutes: data.durationMinutes,
              order: 1,
            },
          ]
        : []),
      ...data.uploadedFiles.map((file, index) => {
        const extension = file.name.split(".").pop()?.toLowerCase();
        const isVideo = [
          "mp4",
          "m4v",
          "mov",
          "webm",
          "avi",
          "mkv",
        ].includes(extension || "");
        return {
          title: file.name,
          type: isVideo ? ("VIDEO" as const) : ("PDF" as const),
          contentUrl: file.url,
          durationMinutes: isVideo ? 10 : 1,
          order: (data.videoUrl ? 2 : 1) + index,
        };
      }),
      ...(data.writtenContent?.trim()
        ? [
            {
              title: `${data.title} - Written lesson`,
              type: "TEXT" as const,
              body: data.writtenContent,
              durationMinutes: Math.max(1, Math.ceil(data.writtenContent.length / 1000)),
              order:
                (data.videoUrl ? 2 : 1) + data.uploadedFiles.length,
            },
          ]
        : []),
    ];

    const course = await safeDbQuery(
      () =>
        prisma.course.create({
          data: {
            title: data.title,
            slug: finalSlug,
            shortDescription: data.shortDescription,
            description: data.description,
            thumbnailUrl: data.thumbnailUrl || null,
            instructorName: data.instructorName,
            level: data.level,
            language: data.language,
            durationMinutes: data.durationMinutes,
            tags: data.tags,
            categoryId: data.categoryId,
            type: data.type,
            externalUrl: data.type === "EXTERNAL" ? data.externalUrl : null,
            externalProvider: data.type === "EXTERNAL" ? (data.externalProvider || "Learning Partner") : null,
            status: data.status,
            isFeatured: data.isFeatured,
            sections: {
              create: [
                {
                  title: "Course content",
                  order: 1,
                  lessons: { create: lessonCreates },
                },
              ],
            },
          },
          include: { sections: true },
        }),
      {
        id: "course_" + Date.now(),
        ...data,
        sections: [
          {
            id: `section_${Date.now()}`,
            title: "Course content",
            order: 1,
            lessons: lessonCreates.map((lesson, index) => ({
              id: `lesson_${Date.now()}_${index}`,
              ...lesson,
            })),
          },
        ],
        slug: finalSlug,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );

    const savedCourse = course || {
      id: "course_" + Date.now(),
      ...data,
      slug: finalSlug,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addMockCourse(savedCourse);

    // Audit Log
    await safeDbQuery(
      () =>
        prisma.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "COURSE_CREATE",
            entity: "Course",
            entityId: savedCourse.id,
            meta: JSON.stringify({
              title: savedCourse.title,
              type: savedCourse.type,
              status: savedCourse.status,
            }),
          },
        }),
      null
    );

    return NextResponse.json({ success: true, course: savedCourse });
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
