import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { getMockCourses } from "@/lib/mock-data";
import { CoursePlayerClient } from "./course-player-client";

export const dynamic = "force-dynamic";

interface LearnPageProps {
  params: { slug: string };
}

export default async function CourseLearnPage({ params }: LearnPageProps) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect(`/auth/login?callbackUrl=/learn/${params.slug}`);
  }

  const { slug } = params;

  // 1. Fetch course with full curriculum
  const course = await safeDbQuery(
    () =>
      prisma.course.findUnique({
        where: { slug },
        include: {
          category: true,
          sections: {
            include: {
              lessons: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      }),
    getMockCourses().find((c: any) => c.slug === slug)
  );

  if (!course || course.type !== "INTERNAL") {
    // If course is external, redirect to course detail
    redirect(`/courses/${slug}`);
  }

  // 2. Fetch user's completed lessons
  const userProgress = await safeDbQuery(
    () =>
      prisma.lessonProgress.findMany({
        where: {
          userId: session.user.id,
          completed: true,
        },
        select: { lessonId: true },
      }),
    []
  );

  const completedLessonIds = userProgress.map((p: any) => p.lessonId);

  return (
    <CoursePlayerClient
      course={course}
      completedLessonIds={completedLessonIds}
      user={session.user}
    />
  );
}
