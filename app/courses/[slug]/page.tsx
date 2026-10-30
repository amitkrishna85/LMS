import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { getMockCourses } from "@/lib/mock-data";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { CourseDetailClient } from "./course-detail-client";
import {
  Clock,
  User,
  Globe,
  Tag,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Award,
  Video,
  FileText,
  FileQuestion,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface CoursePageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CoursePageProps) {
  const { slug } = params;
  const course = await safeDbQuery(
    () => prisma.course.findUnique({ where: { slug } }),
    getMockCourses().find((c: any) => c.slug === slug)
  );

  if (!course) {
    return { title: "Course Not Found" };
  }

  return {
    title: `${course.title} | SkillPulse Academy`,
    description: course.shortDescription,
    openGraph: {
      title: `${course.title} | SkillPulse`,
      description: course.shortDescription,
      type: "article",
    },
  };
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = params;
  const session = await getServerSession(authOptions);

  // 1. Fetch course details
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

  if (!course || course.status !== "PUBLISHED") {
    notFound();
  }

  // 2. Check enrollment or external progress if user logged in
  let isEnrolled = false;
  let enrollmentStatus = "NOT_STARTED";
  let externalStatus = "NOT_STARTED";

  if (session?.user?.id) {
    if (course.type === "INTERNAL") {
      const enr = await safeDbQuery(
        () =>
          prisma.enrollment.findUnique({
            where: {
              userId_courseId: {
                userId: session.user.id,
                courseId: course.id,
              },
            },
          }),
        null
      );
      if (enr) {
        isEnrolled = true;
        enrollmentStatus = enr.status;
      }
    } else {
      const ext = await safeDbQuery(
        () =>
          prisma.externalCourseProgress.findUnique({
            where: {
              userId_courseId: {
                userId: session.user.id,
                courseId: course.id,
              },
            },
          }),
        null
      );
      if (ext) {
        externalStatus = ext.status;
      }
    }
  }

  // 3. Related courses in the same category
  const relatedCourses = await safeDbQuery(
    () =>
      prisma.course.findMany({
        where: {
          categoryId: course.categoryId,
          id: { not: course.id },
          status: "PUBLISHED",
        },
        take: 3,
      }),
    getMockCourses().filter((c: any) => c.id !== course.id).slice(0, 3)
  );

  // 4. Build JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.shortDescription,
    provider: {
      "@type": "Organization",
      name:
        course.type === "INTERNAL"
          ? "SkillPulse Academy"
          : course.externalProvider || "Partner Provider",
      sameAs: course.externalUrl || "https://skillpulse.io",
    },
    educationalLevel: course.level,
    inLanguage: course.language || "en",
    instructor: {
      "@type": "Person",
      name: course.instructorName,
    },
  };

  const totalLessons =
    course.sections?.reduce(
      (sum: number, s: any) => sum + (s.lessons?.length || 0),
      0
    ) || 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicNavbar />

      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {course.category && (
                  <Link
                    href={`/courses?category=${course.categoryId}`}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition"
                  >
                    {course.category.name}
                  </Link>
                )}
                {course.type === "INTERNAL" ? (
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    On Platform Masterclass
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" />
                    External ({course.externalProvider || "Partner"})
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                  {course.level}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {course.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                {course.shortDescription}
              </p>

              {/* Meta strip */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-400" />
                  Instructor:{" "}
                  <strong className="text-slate-200">
                    {course.instructorName}
                  </strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {Math.round(course.durationMinutes / 60)} Hours Total
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-slate-400" />
                  Language: {course.language || "English"}
                </span>
                {course.type === "INTERNAL" && (
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    Certificate of Completion
                  </span>
                )}
              </div>
            </div>

            {/* Right Card Action Widget (Interactive Client Component) */}
            <div className="lg:col-span-1">
              <CourseDetailClient
                course={course}
                isLoggedIn={!!session?.user}
                isEnrolled={isEnrolled}
                enrollmentStatus={enrollmentStatus}
                initialExternalStatus={externalStatus as any}
                totalLessons={totalLessons}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left 2 cols: Description & Curriculum */}
          <div className="lg:col-span-2 space-y-10">
            {/* Rich Description */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900">
                About This Course
              </h2>
              <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {course.description || course.shortDescription}
              </div>

              {/* Tags */}
              {Array.isArray(course.tags) && course.tags.length > 0 && (
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  {course.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Curriculum for Internal Courses */}
            {course.type === "INTERNAL" ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Curriculum & Lessons
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {course.sections?.length || 0} Modules • {totalLessons}{" "}
                      Lectures
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {course.sections && course.sections.length > 0 ? (
                    course.sections.map((section: any, idx: number) => (
                      <div
                        key={section.id}
                        className="border border-slate-200 rounded-xl overflow-hidden"
                      >
                        <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                          <span className="font-semibold text-sm text-slate-800">
                            Section {idx + 1}: {section.title}
                          </span>
                          <span className="text-xs text-slate-500">
                            {section.lessons?.length || 0} lessons
                          </span>
                        </div>

                        <div className="divide-y divide-slate-100 bg-white">
                          {section.lessons?.map((lesson: any) => (
                            <div
                              key={lesson.id}
                              className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50/50 transition"
                            >
                              <div className="flex items-center gap-2.5">
                                {lesson.type === "VIDEO" ? (
                                  <Video className="w-4 h-4 text-indigo-500" />
                                ) : lesson.type === "QUIZ" ? (
                                  <FileQuestion className="w-4 h-4 text-amber-500" />
                                ) : (
                                  <FileText className="w-4 h-4 text-emerald-500" />
                                )}
                                <span className="font-medium text-slate-700">
                                  {lesson.title}
                                </span>
                                {lesson.isPreview && (
                                  <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 font-bold text-[10px]">
                                    Preview
                                  </span>
                                )}
                              </div>
                              <span className="text-slate-400 font-medium">
                                {lesson.durationMinutes} mins
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      Curriculum outline is being finalized by the instructor.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* External Course Syllabus Notice */
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl">
                <h3 className="font-bold text-sm text-blue-900 mb-2 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  Complete Curriculum Hosted on {course.externalProvider || "Partner"}
                </h3>
                <p className="text-xs text-blue-800 leading-relaxed">
                  The comprehensive module breakdown, live exercises, quizzes,
                  and discussion forums are hosted directly on{" "}
                  <strong>{course.externalProvider || "the host platform"}</strong>
                  . Click &ldquo;Go to Course&rdquo; to view the complete
                  syllabus and start learning.
                </p>
              </div>
            )}
          </div>

          {/* Right column: Instructor Bio & Related Courses */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Instructor
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-base">
                  {course.instructorName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {course.instructorName}
                  </h4>
                  <p className="text-xs text-slate-500">Domain Specialist</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                Experienced educator and industry expert bringing battle-tested
                perspectives to this curriculum.
              </p>
            </div>

            {/* Related Courses */}
            {relatedCourses.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Related Courses
                </h3>
                <div className="space-y-3">
                  {relatedCourses.map((rc: any) => (
                    <Link
                      key={rc.id}
                      href={`/courses/${rc.slug}`}
                      className="block p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
                    >
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {rc.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {rc.instructorName} • {Math.round(rc.durationMinutes / 60)} hrs
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
