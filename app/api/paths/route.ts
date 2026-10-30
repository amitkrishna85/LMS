import { NextResponse } from "next/server";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { getMockLearningPaths } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const level = searchParams.get("level") || "";

  try {
    const whereClause: any = {
      status: "PUBLISHED",
    };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (level && (level === "BEGINNER" || level === "INTERMEDIATE" || level === "ADVANCED")) {
      whereClause.level = level;
    }

    const paths = await safeDbQuery(
      () =>
        prisma.learningPath.findMany({
          where: whereClause,
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
                  },
                },
              },
            },
            _count: {
              select: {
                items: true,
                enrollments: true,
              },
            },
          },
        }),
      getMockLearningPaths()
    );

    return NextResponse.json({ paths });
  } catch (error) {
    console.error("Public paths error:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning paths" },
      { status: 500 }
    );
  }
}
