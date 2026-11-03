import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import {
  getMockCategories,
  getMockCourses,
  getMockLearningPaths,
} from "@/lib/mock-data";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { CourseCard } from "@/components/public/course-card";
import { PathCard } from "@/components/public/path-card";
import {
  Sparkles,
  ArrowRight,
  Search,
  BookOpen,
  Route,
  CheckCircle2,
  PlayCircle,
  Award,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // 1. Fetch Categories
  const categories = await safeDbQuery(
    () =>
      prisma.category.findMany({
        take: 8,
        orderBy: { name: "asc" },
      }),
    getMockCategories()
  );

  // 2. Fetch Featured Courses
  const featuredCourses = await safeDbQuery(
    () =>
      prisma.course.findMany({
        where: { status: "PUBLISHED", isFeatured: true, type: "INTERNAL" },
        include: { category: true },
        take: 6,
        orderBy: { sortOrder: "asc" },
      }),
    (() => {
      const internalCourses = getMockCourses().filter(
        (c: any) => c.status === "PUBLISHED" && c.type === "INTERNAL"
      );
      const featured = internalCourses.filter((c: any) => c.isFeatured);
      return (featured.length > 0 ? featured : internalCourses).slice(0, 6);
    })()
  );

  // 3. Fetch Featured Learning Paths
  const allMockPaths = getMockLearningPaths();
  const mockPublished = allMockPaths.filter((p: any) => p.status === "PUBLISHED");
  const fallbackPaths = mockPublished.length > 0 ? mockPublished : allMockPaths;

  const featuredPaths = await safeDbQuery(
    () =>
      prisma.learningPath.findMany({
        where: { status: "PUBLISHED" },
        include: {
          items: {
            include: { course: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    fallbackPaths
  );

  // 4. If user is logged in, fetch "Continue Learning" strip data
  let continueLearningCourses: any[] = [];
  if (session?.user?.id) {
    const enrollments = await safeDbQuery(
      () =>
        prisma.enrollment.findMany({
          where: { userId: session.user.id, status: { in: ["ENROLLED", "IN_PROGRESS"] } },
          include: { course: { include: { category: true } } },
          take: 3,
          orderBy: { lastOpenedAt: "desc" },
        }),
      []
    );

    if (enrollments.length > 0) {
      continueLearningCourses = enrollments.map((e: any) => ({
        ...e.course,
        progressPercent: 45,
      }));
    } else {
      // Show sample in-progress course from mocks
      continueLearningCourses = getMockCourses()
        .filter((course: any) => course.type === "INTERNAL")
        .slice(0, 2)
        .map((c: any, i: number) => ({
        ...c,
        progressPercent: i === 0 ? 60 : 30,
        }));
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-16 pb-24 sm:pt-24 sm:pb-32">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-inner">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Learning, made to help you grow</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            Falkor Academy
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Explore administrator-created courses with engaging videos, useful written lessons, and guided learning paths to help you build practical skills.
          </p>

          {/* Quick Search in Hero */}
          <div className="mt-10 max-w-2xl mx-auto">
            <form
              action="/courses"
              method="GET"
              className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 shadow-2xl focus-within:border-indigo-400 transition-all"
            >
              <div className="pl-3 pr-2 text-slate-400">
                <Search className="w-5 h-5 text-indigo-300" />
              </div>
              <input
                type="text"
                name="q"
                placeholder="What do you want to learn today? (e.g. Next.js, Cloud, System Design)..."
                className="w-full bg-transparent border-none text-white placeholder-slate-400 text-sm focus:outline-none px-2"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Value props badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Video and written courses</span>
            </div>
            <div className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-sky-400" />
              <span>Learn at your own pace</span>
            </div>
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-purple-400" />
              <span>Structured learning paths</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Verifiable Certificates</span>
            </div>
          </div>
        </div>
      </section>

      {/* Logged In Student: "Continue Learning" Strip */}
      {session?.user && continueLearningCourses.length > 0 && (
        <section className="bg-indigo-900/10 border-y border-indigo-100 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Welcome back, {session.user.name?.split(" ")[0] || "Learner"} • Jump Back In
                </h2>
              </div>
              <Link
                href="/dashboard"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {continueLearningCourses.slice(0, 3).map((course: any) => (
                <div
                  key={course.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">
                      In Progress
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {course.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${course.progressPercent || 40}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {course.progressPercent || 40}%
                      </span>
                    </div>
                  </div>

                  <Link
                    href={
                      course.type === "INTERNAL"
                        ? `/learn/${course.slug}`
                        : `/courses/${course.slug}`
                    }
                    className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    <PlayCircle className="w-5 h-5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Chips Bar */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Browse by Subject & Domain
            </h2>
            <Link
              href="/courses"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              All Categories →
            </Link>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/courses?category=${cat.id}`}
                className="px-4 py-2 rounded-full border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 text-xs font-medium whitespace-nowrap transition-all shadow-xs"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Learning Paths Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                <Route className="w-4 h-4" />
                Structured Roadmaps
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Curated Learning Paths
              </h2>
              <p className="mt-2 text-sm text-slate-600 max-w-xl">
                Master complete skill tracks from beginner to expert. Each path
                sequences internal lessons and external certifications in the right
                order.
              </p>
            </div>
            <Link
              href="/paths"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 font-semibold text-xs transition-all shadow-xs"
            >
              <span>View All Paths</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPaths.map((path: any) => (
              <PathCard key={path.id} path={path} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                <BookOpen className="w-4 h-4" />
                Platform Highlights
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Featured Courses
              </h2>
                <p className="mt-2 text-sm text-slate-600 max-w-xl">
                  Explore video courses and written lessons created and curated by Falkor Academy administrators.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/courses"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Browse All
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Explainer Strip */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Learning with Falkor Academy
          </h2>
          <p className="mt-3 text-sm text-slate-400 max-w-2xl mx-auto">
            Learn through a mix of administrator-created videos and written lessons, follow structured paths, and track your progress in one place.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Video and Written Lessons
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Watch focused videos and explore useful written content created and curated by Falkor Academy administrators.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Structured Learning Paths
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Follow a guided sequence of courses and build your knowledge one step at a time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Unified Learning Paths
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Keep track of your learning, resume courses, and celebrate completed programs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
