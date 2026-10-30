"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Route,
  Clock,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  PlayCircle,
  Award,
  Layers,
  ArrowRight,
  ShieldCheck,
  Circle,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { ExternalNoticeModal } from "@/components/public/external-notice-modal";
import { toast } from "sonner";

interface PathRoadmapClientProps {
  path: any;
  isLoggedIn: boolean;
  initialIsEnrolled: boolean;
  initialCourseStatusMap: Record<
    string,
    { status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"; percent: number }
  >;
}

export function PathRoadmapClient({
  path,
  isLoggedIn,
  initialIsEnrolled,
  initialCourseStatusMap,
}: PathRoadmapClientProps) {
  const router = useRouter();
  const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled);
  const [loading, setLoading] = useState(false);
  const [statusMap, setStatusMap] = useState(initialCourseStatusMap);
  const [selectedExternalCourse, setSelectedExternalCourse] =
    useState<any | null>(null);

  // Compute composite progress
  const items = path.items || [];
  const totalItems = items.length;
  let completedCount = 0;

  items.forEach((it: any) => {
    const courseStatus = statusMap[it.courseId]?.status;
    if (courseStatus === "COMPLETED") {
      completedCount++;
    }
  });

  const progressPercent =
    totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const handleEnrollPath = async () => {
    if (!isLoggedIn) {
      router.push(`/auth/login?callbackUrl=/paths/${path.slug}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/paths/${path.slug}/enroll`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to enroll in path");
      }

      setIsEnrolled(true);
      toast.success(`Enrolled in ${path.title}!`);
    } catch (err: any) {
      toast.error(err.message || "Enrollment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExternalStatus = async (
    courseSlug: string,
    courseId: string,
    newStatus: "IN_PROGRESS" | "COMPLETED"
  ) => {
    if (!isLoggedIn) {
      toast.info("Please sign in to record progress");
      return;
    }

    try {
      const res = await fetch(`/api/courses/${courseSlug}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatusMap((prev) => ({
          ...prev,
          [courseId]: { status: newStatus, percent: newStatus === "COMPLETED" ? 100 : 50 },
        }));
        toast.success(`Step marked as ${newStatus.replace("_", " ")}`);
      }
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  return (
    <>
      {/* Path Header Banner */}
      <div className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5" />
                Structured Career Path
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                {path.level}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {path.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              {path.description}
            </p>

            {/* Meta Strip */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <strong>{totalItems}</strong> Courses ({items.filter((i: any) => i.isRequired).length} Required)
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                ~{path.estimatedHours} Total Hours
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Integrated Curriculum
              </span>
            </div>

            {/* Path Progress Bar & Action CTA */}
            <div className="pt-6">
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">
                      Overall Roadmap Progress
                    </span>
                    <span className="font-bold text-sky-400">
                      {completedCount} of {totalItems} Completed ({progressPercent}%)
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isEnrolled ? (
                    <div className="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Path Enrolled</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleEnrollPath}
                      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Enrolling...</span>
                        </>
                      ) : (
                        <>
                          <span>{isLoggedIn ? "Start This Path" : "Sign In to Start Path"}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Sequence Steps */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex-1 w-full">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Curriculum Sequence & Step Checklist
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete each course in order to build upon previous concepts.
            Internal courses track completion automatically; external courses can
            be marked upon return.
          </p>
        </div>

        {/* Timeline List */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-10">
          {items.map((item: any, idx: number) => {
            const course = item.course;
            if (!course) return null;

            const courseStatus = statusMap[course.id]?.status || "NOT_STARTED";
            const isCompleted = courseStatus === "COMPLETED";
            const isInProgress = courseStatus === "IN_PROGRESS";

            return (
              <div key={item.id} className="relative group">
                {/* Step Circle Node */}
                <div
                  className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : isInProgress
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-white border-slate-300 text-slate-500"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Step Card Content */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
                  {/* Step Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Step {idx + 1}
                      </span>
                      {item.isRequired ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                          Required
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 uppercase">
                          Optional
                        </span>
                      )}
                      {course.type === "INTERNAL" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          On Platform
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          {course.externalProvider || "External"}
                        </span>
                      )}
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800"
                          : isInProgress
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {courseStatus.replace("_", " ")}
                    </span>
                  </div>

                  {/* Course Details Box */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                    <div className="flex-1 space-y-1">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                      >
                        {course.title}
                      </Link>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {course.shortDescription}
                      </p>
                      <div className="pt-1 flex items-center gap-4 text-xs text-slate-400">
                        <span>Instructor: {course.instructorName}</span>
                        <span>•</span>
                        <span>{Math.round(course.durationMinutes / 60)} hrs</span>
                        <span>•</span>
                        <span className="uppercase">{course.level}</span>
                      </div>
                    </div>

                    {/* CTA for this step */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {course.type === "INTERNAL" ? (
                        <Link
                          href={`/learn/${course.slug}`}
                          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>
                            {isCompleted
                              ? "Review Lessons"
                              : isInProgress
                              ? "Resume Course"
                              : "Start Course"}
                          </span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedExternalCourse(course)}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                        >
                          <span>Go to {course.externalProvider || "Course"}</span>
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Instructor Note for this Step */}
                  {item.note && (
                    <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Curator Recommendation:</strong> {item.note}
                      </div>
                    </div>
                  )}

                  {/* External self report status triggers */}
                  {course.type === "EXTERNAL" && (
                    <div className="pt-2 flex items-center justify-end gap-2 text-xs">
                      <span className="text-slate-400 text-[11px]">
                        Quick update:
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateExternalStatus(
                            course.slug,
                            course.id,
                            "IN_PROGRESS"
                          )
                        }
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition ${
                          isInProgress
                            ? "bg-blue-50 border-blue-300 text-blue-700"
                            : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        In Progress
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateExternalStatus(
                            course.slug,
                            course.id,
                            "COMPLETED"
                          )
                        }
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition ${
                          isCompleted
                            ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                            : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        Completed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* External Course Notice Modal */}
      {selectedExternalCourse && (
        <ExternalNoticeModal
          isOpen={!!selectedExternalCourse}
          onClose={() => setSelectedExternalCourse(null)}
          course={{
            id: selectedExternalCourse.id,
            title: selectedExternalCourse.title,
            slug: selectedExternalCourse.slug,
            externalUrl: selectedExternalCourse.externalUrl,
            externalProvider: selectedExternalCourse.externalProvider || "Partner",
          }}
          currentStatus={statusMap[selectedExternalCourse.id]?.status}
          onMarkStatus={(newStatus) =>
            handleUpdateExternalStatus(
              selectedExternalCourse.slug,
              selectedExternalCourse.id,
              newStatus
            )
          }
        />
      )}
    </>
  );
}
