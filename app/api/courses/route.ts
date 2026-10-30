import { NextResponse } from "next/server";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { getMockCourses } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const level = searchParams.get("level") || "";
  const type = searchParams.get("type") || ""; // INTERNAL or EXTERNAL
  const sort = searchParams.get("sort") || "relevance";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "12", 10);
  const skip = (page - 1) * limit;

  try {
    const whereClause: any = {
      status: "PUBLISHED",
    };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { instructorName: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search] } },
      ];
    }

    if (category) {
      whereClause.category = { slug: category };
    }

    if (level && (level === "BEGINNER" || level === "INTERMEDIATE" || level === "ADVANCED")) {
      whereClause.level = level;
    }

    if (type && (type === "INTERNAL" || type === "EXTERNAL")) {
      whereClause.type = type;
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
      [
        getMockCourses().map((c) => ({
          ...c,
          category: { id: c.categoryId, name: "Engineering", slug: "software-engineering" },
          _count: { sections: c.sections?.length || 0, enrollments: 14 },
        })),
        getMockCourses().length,
      ]
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
    console.error("Public courses API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses catalog" },
      { status: 500 }
    );
  }
}
