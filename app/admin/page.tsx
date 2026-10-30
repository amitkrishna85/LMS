"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Milestone,
  GraduationCap,
  ArrowUpRight,
  PlusCircle,
  ExternalLink,
  ShieldAlert,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = data?.stats || {
    totalUsers: 4,
    totalStudents: 3,
    totalCourses: 8,
    internalCourses: 3,
    externalCourses: 5,
    totalPaths: 2,
    totalEnrollments: 14,
  };

  const popularCourses = data?.popularCourses || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Executive Dashboard</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Live Studio
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time platform metrics, course catalogs, and active student engagements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Course</span>
          </Link>
          <Link
            href="/admin/paths"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <Milestone className="w-4 h-4 text-indigo-400" />
            <span>New Path</span>
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {stats.totalStudents}
            </span>
            <span className="text-xs text-slate-400">
              ({stats.totalUsers} total accounts)
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            Admin-provisioned credentials only
          </div>
        </div>

        {/* Total Courses */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Catalog Courses
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {stats.totalCourses}
            </span>
            <span className="text-xs text-indigo-400 font-medium">
              {stats.internalCourses} Internal / {stats.externalCourses} External
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            Internal modules & external Udemy/Coursera links
          </div>
        </div>

        {/* Learning Paths */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Curated Paths
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <Milestone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {stats.totalPaths}
            </span>
            <span className="text-xs text-slate-400">Roadmaps</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            Sequential blended curricula
          </div>
        </div>

        {/* Total Enrollments */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Enrollments
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {stats.totalEnrollments}
            </span>
            <span className="text-xs text-amber-400 font-medium">Active</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            Across internal & self-reported tracks
          </div>
        </div>
      </div>

      {/* Two Column Layout: Popular Courses & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Courses (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Most Popular Courses</h3>
              <p className="text-xs text-slate-400">Ranked by active student enrollments</p>
            </div>
            <Link
              href="/admin/courses"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
            >
              <span>View all courses</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800">
            {popularCourses.length > 0 ? (
              popularCourses.map((c: any) => (
                <div key={c.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {c.type === "INTERNAL" ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          On Platform
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>External ({c.externalProvider || "Udemy"})</span>
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-semibold text-slate-500">
                        {c.level}
                      </span>
                    </div>
                    <Link
                      href={`/courses/${c.slug}`}
                      target="_blank"
                      className="text-sm font-medium text-slate-200 hover:text-white truncate block hover:underline"
                    >
                      {c.title}
                    </Link>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-white">
                      {c._count?.enrollments || 0}
                    </div>
                    <div className="text-[10px] text-slate-500">students</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No course data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Platform Activity (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Audit Log Feed</h3>
              <p className="text-xs text-slate-400">Recent administrative actions</p>
            </div>
            <Link
              href="/admin/audit-logs"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
            >
              <span>Full log</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((act: any) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-200 truncate">
                      {act.action.replace(/_/g, " ")}
                    </div>
                    <div className="text-slate-400 text-[11px] truncate">
                      by {act.actor?.name || "System Admin"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No recent actions recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
