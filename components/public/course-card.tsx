"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Clock,
  User,
  ExternalLink,
  CheckCircle,
  PlayCircle,
  GraduationCap,
} from "lucide-react";
import { ExternalNoticeModal } from "./external-notice-modal";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    shortDescription?: string;
    thumbnailUrl?: string | null;
    instructorName: string;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    durationMinutes: number;
    type: "INTERNAL" | "EXTERNAL";
    externalUrl?: string | null;
    externalProvider?: string | null;
    category?: { name: string } | null;
    progressPercent?: number;
    status?: string;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    if (hours === 0) return `${m} mins`;
    return m > 0 ? `${hours}h ${m}m` : `${hours} hrs`;
  };

  const levelColor = {
    BEGINNER: "text-emerald-700 bg-emerald-50 border-emerald-200",
    INTERMEDIATE: "text-amber-700 bg-amber-50 border-amber-200",
    ADVANCED: "text-purple-700 bg-purple-50 border-purple-200",
  }[course.level] || "text-slate-700 bg-slate-50 border-slate-200";

  return (
    <>
      <div className="group flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Thumbnail banner */}
        <Link
          href={`/courses/${course.slug}`}
          className="relative aspect-video w-full overflow-hidden bg-slate-100 block"
        >
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-slate-800 to-indigo-900 flex items-center justify-center p-4 text-center">
              <GraduationCap className="w-12 h-12 text-white/40" />
            </div>
          )}

          {/* Type Badge on Thumbnail */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {course.type === "INTERNAL" ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600/90 text-white backdrop-blur shadow-sm flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                On Platform
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600/90 text-white backdrop-blur shadow-sm flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                {course.externalProvider || "External"}
              </span>
            )}
          </div>

          {/* Level badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider backdrop-blur border ${levelColor}`}
            >
              {course.level}
            </span>
          </div>

          {/* Optional progress indicator bar */}
          {course.progressPercent !== undefined && course.progressPercent > 0 && (
            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-200">
              <div
                className="h-full bg-indigo-600"
                style={{ width: `${course.progressPercent}%` }}
              />
            </div>
          )}
        </Link>

        {/* Card Body */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            {/* Category */}
            {course.category && (
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                {course.category.name}
              </span>
            )}

            {/* Title */}
            <Link
              href={`/courses/${course.slug}`}
              className="mt-1 block font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 text-base leading-snug"
            >
              {course.title}
            </Link>

            {/* Short Description */}
            {course.shortDescription && (
              <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {course.shortDescription}
              </p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
            {/* Instructor and Duration */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 truncate max-w-[140px]">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {course.instructorName}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatDuration(course.durationMinutes)}
              </span>
            </div>

            {/* CTA action button */}
            <div className="pt-1">
              {course.type === "INTERNAL" ? (
                <Link
                  href={`/courses/${course.slug}`}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>
                    {course.progressPercent !== undefined &&
                    course.progressPercent > 0
                      ? `Continue (${course.progressPercent}%)`
                      : "View Course"}
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Go to {course.externalProvider || "Course"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* External Course Notice Modal */}
      {course.type === "EXTERNAL" && course.externalUrl && (
        <ExternalNoticeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          course={{
            id: course.id,
            title: course.title,
            slug: course.slug,
            externalUrl: course.externalUrl,
            externalProvider: course.externalProvider || "External Site",
          }}
          currentStatus={
            course.status === "COMPLETED"
              ? "COMPLETED"
              : course.status === "IN_PROGRESS"
              ? "IN_PROGRESS"
              : "NOT_STARTED"
          }
        />
      )}
    </>
  );
}
