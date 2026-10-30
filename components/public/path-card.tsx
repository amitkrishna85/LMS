"use client";

import Link from "next/link";
import { Route, Clock, BookOpen, ChevronRight, Layers } from "lucide-react";

interface PathCardProps {
  path: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnailUrl?: string | null;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    estimatedHours: number;
    items?: Array<{
      id: string;
      course?: {
        type: "INTERNAL" | "EXTERNAL";
        title: string;
      } | null;
    }>;
    totalCourses?: number;
    progressPercent?: number;
  };
}

export function PathCard({ path }: PathCardProps) {
  const levelBadge = {
    BEGINNER: "text-emerald-700 bg-emerald-50 border-emerald-200",
    INTERMEDIATE: "text-amber-700 bg-amber-50 border-amber-200",
    ADVANCED: "text-purple-700 bg-purple-50 border-purple-200",
  }[path.level] || "text-slate-700 bg-slate-50 border-slate-200";

  const totalCourses = path.totalCourses || path.items?.length || 0;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Visual Header / Banner */}
      <Link
        href={`/paths/${path.slug}`}
        className="relative h-44 w-full overflow-hidden bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900 flex items-center justify-center p-6 block"
      >
        {path.thumbnailUrl ? (
          <img
            src={path.thumbnailUrl}
            alt={path.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
            <Route className="w-8 h-8 text-sky-300" />
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-600/90 text-white backdrop-blur shadow-sm flex items-center gap-1">
            <Layers className="w-3 h-3" />
            Curated Path
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider backdrop-blur border ${levelBadge}`}
          >
            {path.level}
          </span>
        </div>

        {/* Progress bar if present */}
        {path.progressPercent !== undefined && path.progressPercent > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-200/40">
            <div
              className="h-full bg-emerald-400"
              style={{ width: `${path.progressPercent}%` }}
            />
          </div>
        )}
      </Link>

      {/* Card Content */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <Link
            href={`/paths/${path.slug}`}
            className="block text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2"
          >
            {path.title}
          </Link>
          <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
            {path.description}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <strong>{totalCourses}</strong> Courses Included
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              ~{path.estimatedHours} Hours
            </span>
          </div>

          <Link
            href={`/paths/${path.slug}`}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <span>
              {path.progressPercent !== undefined && path.progressPercent > 0
                ? `Continue Path (${path.progressPercent}%)`
                : "Explore Roadmap"}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
