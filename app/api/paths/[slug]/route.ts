import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { getMockLearningPaths } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const path = await safeDbQuery(
      () =>
        prisma.learningPath.findUnique({
          where: { slug },
          include: {
            items: {
              orderBy: { order: "asc" },
              include: {
                course: {
                  include: {
                    category: true,
                    sections: {
                      include: {
                        lessons: { select: { id: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
      getMockLearningPaths().find((p) => p.slug === slug) || null
    );

    if (!path) {
      return NextResponse.json({ error: "Path not found" }, { status: 404 });
    }

    let isEnrolled = false;
    let completedStepsCount = 0;
    const itemsWithStatus: any[] = [];

    if (userId) {
      const enrollment = await safeDbQuery(
        () =>
          prisma.pathEnrollment.findUnique({
            where: {
              userId_pathId: {
                userId,
                pathId: path.id,
              },
            },
          }),
        null
      );
      isEnrolled = !!enrollment;

      for (const item of path.items) {
        const c = item.course;
        let isStepCompleted = false;

        if (c.type === "INTERNAL") {
          const totalLessons = c.sections.reduce(
            (acc: number, s: any) => acc + s.lessons.length,
            0
          );

          if (totalLessons > 0) {
            const completedCount = await safeDbQuery(
              () =>
                prisma.lessonProgress.count({
                  where: {
                    userId,
                    completed: true,
                    lesson: { section: { courseId: c.id } },
                  },
                }),
              0
            );
            if (completedCount >= totalLessons) {
              isStepCompleted = true;
            }
          }
        } else {
          // External course
          const extProg = await safeDbQuery(
            () =>
              prisma.externalCourseProgress.findUnique({
                where: {
                  userId_courseId: {
                    userId,
                    courseId: c.id,
                  },
                },
              }),
            null
          );
          if (extProg?.status === "COMPLETED") {
            isStepCompleted = true;
          }
        }

        if (isStepCompleted) completedStepsCount++;

        itemsWithStatus.push({
          ...item,
          isCompleted: isStepCompleted,
        });
      }
    } else {
      itemsWithStatus.push(
        ...path.items.map((it: any) => ({ ...it, isCompleted: false }))
      );
    }

    const totalSteps = path.items.length;
    const progressPercent = totalSteps > 0
      ? Math.round((completedStepsCount / totalSteps) * 100)
      : 0;

    return NextResponse.json({
      path: {
        ...path,
        items: itemsWithStatus,
      },
      isEnrolled,
      progressPercent,
      completedStepsCount,
      totalSteps,
    });
  } catch (error) {
    console.error("Path detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch path details" },
      { status: 500 }
    );
  }
}
