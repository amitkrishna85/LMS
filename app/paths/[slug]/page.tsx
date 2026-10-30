import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { MOCK_PATHS } from "@/lib/mock-data";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { PathRoadmapClient } from "./path-roadmap-client";
import { Route, Clock, BookOpen, Layers, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface PathPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PathPageProps) {
  const { slug } = params;
  const path = await safeDbQuery(
    () => prisma.learningPath.findUnique({ where: { slug } }),
    MOCK_PATHS.find((p) => p.slug === slug)
  );

  if (!path) return { title: "Path Not Found" };

  return {
    title: `${path.title} | Learning Roadmap | SkillPulse`,
    description: path.description,
  };
}

export default async function PathDetailPage({ params }: PathPageProps) {
  const { slug } = params;
  const session = await getServerSession(authOptions);

  // 1. Fetch path with items and ordered courses
  const path = await safeDbQuery(
    () =>
      prisma.learningPath.findUnique({
        where: { slug },
        include: {
          items: {
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
            orderBy: { order: "asc" },
          },
        },
      }),
    MOCK_PATHS.find((p) => p.slug === slug)
  );

  if (!path || path.status !== "PUBLISHED") {
    notFound();
  }

  // 2. Fetch path enrollment status
  let isPathEnrolled = false;
  if (session?.user?.id) {
    const pe = await safeDbQuery(
      () =>
        prisma.pathEnrollment.findUnique({
          where: {
            userId_pathId: {
              userId: session.user.id,
              pathId: path.id,
            },
          },
        }),
      null
    );
    if (pe) isPathEnrolled = true;
  }

  // 3. Fetch user course progress for items in path
  const courseStatusMap: Record<
    string,
    { status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"; percent: number }
  > = {};

  if (session?.user?.id) {
    const courseIds = path.items.map((it: any) => it.courseId);

    // Internal enrollments
    const enrollments = await safeDbQuery(
      () =>
        prisma.enrollment.findMany({
          where: {
            userId: session.user.id,
            courseId: { in: courseIds },
          },
        }),
      []
    );

    // External progress
    const extProgress = await safeDbQuery(
      () =>
        prisma.externalCourseProgress.findMany({
          where: {
            userId: session.user.id,
            courseId: { in: courseIds },
          },
        }),
      []
    );

    enrollments.forEach((e: any) => {
      courseStatusMap[e.courseId] = {
        status: e.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS",
        percent: e.status === "COMPLETED" ? 100 : 50,
      };
    });

    extProgress.forEach((ep: any) => {
      courseStatusMap[ep.courseId] = {
        status: ep.status,
        percent: ep.status === "COMPLETED" ? 100 : 50,
      };
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <PublicNavbar />

      <PathRoadmapClient
        path={path}
        isLoggedIn={!!session?.user}
        initialIsEnrolled={isPathEnrolled}
        initialCourseStatusMap={courseStatusMap}
      />

      <PublicFooter />
    </div>
  );
}
