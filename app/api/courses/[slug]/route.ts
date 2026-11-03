import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import {
  getMockCategories,
  getMockCourses,
  getMockEnrollments,
  getMockExternalProgress,
  getMockLessonProgress,
} from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const course = await safeDbQuery(
      () =>
        prisma.course.findUnique({
          where: { slug },
          include: {
            category: true,
            sections: {
              orderBy: { order: "asc" },
              include: {
                lessons: {
                  orderBy: { order: "asc" },
                  select: {
                    id: true,
                    title: true,
                    type: true,
                    durationMinutes: true,
                    order: true,
                    isPreview: true,
                    // Content is only exposed if enrolled or preview
                    contentUrl: true,
                  },
                },
              },
            },
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
        }),
      (() => {
        const savedCourse = getMockCourses().find((c) => c.slug === slug);
        if (!savedCourse) return null;
        return {
          ...savedCourse,
          category:
            getMockCategories().find(
              (category: any) => category.id === savedCourse.categoryId
            ) || null,
          _count: {
            enrollments: getMockEnrollments().filter(
              (item: any) => item.courseId === savedCourse.id
            ).length,
          },
        };
      })()
    );

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check user enrollment and progress if logged in
    let enrollment: any = null;
    let completedLessonIds: string[] = [];
    let externalProgress: any = null;

    if (userId) {
      if (course.type === "INTERNAL") {
        enrollment = await safeDbQuery(
          () =>
            prisma.enrollment.findUnique({
              where: {
                userId_courseId: {
                  userId,
                  courseId: course.id,
                },
              },
            }),
          getMockEnrollments(userId).find(
            (item: any) => item.courseId === course.id
          ) || null
        );

        const progressRecords = await safeDbQuery(
          () =>
            prisma.lessonProgress.findMany({
              where: {
                userId,
                completed: true,
                lesson: { section: { courseId: course.id } },
              },
              select: { lessonId: true },
            }),
          getMockLessonProgress(userId).filter(
            (item: any) =>
              item.completed &&
              course.sections?.some((section: any) =>
                section.lessons?.some((lesson: any) => lesson.id === item.lessonId)
              )
          )
        );
        completedLessonIds = progressRecords.map((p: any) => p.lessonId);
      } else {
        // External course progress
        externalProgress = await safeDbQuery(
          () =>
            prisma.externalCourseProgress.findUnique({
              where: {
                userId_courseId: {
                  userId,
                  courseId: course.id,
                },
              },
            }),
          getMockExternalProgress(userId).find(
            (item: any) => item.courseId === course.id
          ) || null
        );
      }
    }

    // Related courses in same category
    const relatedCourses = await safeDbQuery(
      () =>
        prisma.course.findMany({
          where: {
            categoryId: course.categoryId,
            id: { not: course.id },
            status: "PUBLISHED",
          },
          take: 3,
          include: { category: true },
        }),
      getMockCourses()
        .filter((c) => c.id !== course.id)
        .slice(0, 3)
    );

    return NextResponse.json({
      course,
      isEnrolled: !!enrollment,
      enrollment,
      completedLessonIds,
      externalProgress,
      relatedCourses,
    });
  } catch (error) {
    console.error("Course detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch course details" },
      { status: 500 }
    );
  }
}
