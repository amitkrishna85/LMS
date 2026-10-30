"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PlayCircle,
  ExternalLink,
  CheckCircle2,
  Lock,
  Loader2,
  Clock,
  Layers,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { ExternalNoticeModal } from "@/components/public/external-notice-modal";
import { toast } from "sonner";

interface CourseDetailClientProps {
  course: {
    id: string;
    title: string;
    slug: string;
    type: "INTERNAL" | "EXTERNAL";
    externalUrl?: string | null;
    externalProvider?: string | null;
    thumbnailUrl?: string | null;
    durationMinutes: number;
  };
  isLoggedIn: boolean;
  isEnrolled: boolean;
  enrollmentStatus: string;
  initialExternalStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  totalLessons: number;
}

export function CourseDetailClient({
  course,
  isLoggedIn,
  isEnrolled,
  enrollmentStatus,
  initialExternalStatus,
  totalLessons,
}: CourseDetailClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(isEnrolled);
  const [externalStatus, setExternalStatus] = useState<
    "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
  >(initialExternalStatus);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  const handleEnrollInternal = async () => {
    if (!isLoggedIn) {
      router.push(`/auth/login?callbackUrl=/courses/${course.slug}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${course.slug}/enroll`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to enroll");
      }

      setEnrolled(true);
      toast.success("Enrolled successfully! Redirecting to classroom...");
      router.push(`/learn/${course.slug}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to enroll");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExternalStatus = async (
    newStatus: "IN_PROGRESS" | "COMPLETED"
  ) => {
    if (!isLoggedIn) {
      toast.info("Sign in to track your progress on SkillPulse");
      return;
    }

    try {
      const res = await fetch(`/api/courses/${course.slug}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setExternalStatus(newStatus);
        toast.success(`Progress updated to ${newStatus.replace("_", " ")}`);
      }
    } catch (err) {
      toast.error("Failed to update progress");
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-6">
        {/* Course Thumbnail */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-100 shadow-inner">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-900 to-indigo-950 text-white">
              <GraduationCap className="w-12 h-12 text-indigo-400" />
            </div>
          )}
        </div>

        {/* Action Button based on Type */}
        <div>
          {course.type === "INTERNAL" ? (
            enrolled ? (
              <Link
                href={`/learn/${course.slug}`}
                className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <PlayCircle className="w-5 h-5" />
                <span>
                  {enrollmentStatus === "COMPLETED"
                    ? "Review Course Lessons"
                    : "Continue Learning"}
                </span>
              </Link>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleEnrollInternal}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enrolling...</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5" />
                    <span>{isLoggedIn ? "Enroll Now (Free)" : "Sign In to Enroll"}</span>
                  </>
                )}
              </button>
            )
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
              >
                <span>Go to Course on {course.externalProvider || "Partner"}</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              {/* Status Self reporting bar */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Your Status:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      externalStatus === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800"
                        : externalStatus === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {externalStatus.replace("_", " ")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleUpdateExternalStatus("IN_PROGRESS")}
                    className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 transition"
                  >
                    Mark In Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateExternalStatus("COMPLETED")}
                    className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-medium text-emerald-700 transition"
                  >
                    Mark Completed
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Key Features List */}
        <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Access Duration
            </span>
            <span className="font-semibold text-slate-800">Lifetime</span>
          </div>

          {course.type === "INTERNAL" && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                Lesson Count
              </span>
              <span className="font-semibold text-slate-800">
                {totalLessons} Lectures
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Credential Verification
            </span>
            <span className="font-semibold text-slate-800">
              {course.type === "INTERNAL" ? "SkillPulse Certified" : "Host Provider"}
            </span>
          </div>
        </div>
      </div>

      {/* External Course Notice Modal */}
      {course.type === "EXTERNAL" && course.externalUrl && (
        <ExternalNoticeModal
          isOpen={isNoticeModalOpen}
          onClose={() => setIsNoticeModalOpen(false)}
          course={{
            id: course.id,
            title: course.title,
            slug: course.slug,
            externalUrl: course.externalUrl,
            externalProvider: course.externalProvider || "Partner",
          }}
          currentStatus={externalStatus}
          onMarkStatus={handleUpdateExternalStatus}
        />
      )}
    </>
  );
}
