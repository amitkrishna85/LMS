import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import {
  getMockCourses,
  getMockLessonProgress,
  upsertMockEnrollment,
  upsertMockLessonProgress,
} from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { lessonId } = params;
    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));
    const completed = body.completed !== false; // default true

    // 1. Find lesson and section/course
    const mockCourse = getMockCourses().find((course: any) =>
      (course.sections || []).some((section: any) =>
        (section.lessons || []).some((item: any) => item.id === lessonId)
      )
    );
    const mockSection = mockCourse?.sections?.find((section: any) =>
      (section.lessons || []).some((item: any) => item.id === lessonId)
    );
    const mockLesson = mockSection?.lessons?.find(
      (item: any) => item.id === lessonId
    );
    const lesson = await safeDbQuery(
      () =>
        prisma.lesson.findUnique({
          where: { id: lessonId },
          include: {
            section: {
              include: {
                course: {
                  include: {
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
      mockLesson
        ? {
            ...mockLesson,
            section: {
              ...mockSection,
              course: {
                ...mockCourse,
                sections: mockCourse.sections,
              },
            },
          }
        : null
    ) || (mockLesson
      ? {
          ...mockLesson,
          section: {
            ...mockSection,
            course: { ...mockCourse, sections: mockCourse.sections },
          },
        }
      : null);

    // 2. Upsert LessonProgress
    const progress = await safeDbQuery(
      () =>
        prisma.lessonProgress.upsert({
          where: {
            userId_lessonId: {
              userId,
              lessonId,
            },
          },
          update: {
            completed,
            completedAt: completed ? new Date() : null,
          },
          create: {
            userId,
            lessonId,
            completed,
            completedAt: completed ? new Date() : null,
          },
        }),
      { userId, lessonId, completed, completedAt: new Date() }
    );
    const savedProgress = upsertMockLessonProgress({
      ...progress,
      userId,
      lessonId,
      completed,
      completedAt: completed ? new Date().toISOString() : null,
    });

    let courseCompleted = false;
    let percent = 0;

    if (lesson?.section?.course) {
      const course = lesson.section.course;
      const allLessons =
        course.sections?.flatMap((s: any) => s.lessons) || [];
      const totalLessons = allLessons.length;

      // Count user's completed lessons for this course
      const allCompleted = await safeDbQuery(
        () =>
          prisma.lessonProgress.findMany({
            where: {
              userId,
              completed: true,
              lessonId: { in: allLessons.map((l: any) => l.id) },
            },
          }),
        getMockLessonProgress(userId).filter(
          (item: any) =>
            item.completed && allLessons.some((lesson: any) => lesson.id === item.lessonId)
        )
      );

      const completedCount = allCompleted.length;
      percent =
        totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 100;

      courseCompleted = percent === 100;

      // Update enrollment status
      const enrollment = await safeDbQuery(
        () =>
          prisma.enrollment.upsert({
            where: {
              userId_courseId: {
                userId,
                courseId: course.id,
              },
            },
            update: {
              status: courseCompleted ? "COMPLETED" : "IN_PROGRESS",
              lastOpenedAt: new Date(),
              completedAt: courseCompleted ? new Date() : undefined,
            },
            create: {
              userId,
              courseId: course.id,
              status: courseCompleted ? "COMPLETED" : "IN_PROGRESS",
              lastOpenedAt: new Date(),
              completedAt: courseCompleted ? new Date() : undefined,
            },
          }),
        null
      );
      upsertMockEnrollment({
        ...enrollment,
        userId,
        courseId: course.id,
        status: courseCompleted ? "COMPLETED" : "IN_PROGRESS",
        completedAt: courseCompleted ? new Date().toISOString() : null,
        lastOpenedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      progress: process.env.DATABASE_URL ? progress : savedProgress,
      courseCompleted,
      percent,
    });
  } catch (error) {
    console.error("Lesson progress error:", error);
    return NextResponse.json(
      { error: "Failed to update lesson progress" },
      { status: 500 }
    );
  }
}
