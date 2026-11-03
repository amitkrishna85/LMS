"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Milestone,
  FolderTree,
  Users,
  Layers,
  BarChart3,
  Settings,
  History,
  Sparkles,
  ExternalLink,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/brand";

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { label: "Home", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Create",
    items: [
      { label: "Course", href: "/admin/courses?create=1", icon: PlusCircle },
      { label: "Learning path", href: "/admin/paths?create=1", icon: Milestone },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "Courses", href: "/admin/courses", icon: BookOpen },
      { label: "Learning paths", href: "/admin/paths", icon: Milestone },
      { label: "User management", href: "/admin/users", icon: Users },
      { label: "Categories", href: "/admin/categories", icon: FolderTree },
      { label: "Homepage", href: "/admin/homepage", icon: Layers },
      { label: "Analytics", href: "/admin/reports", icon: BarChart3 },
      { label: "Audit log", href: "/admin/audit-logs", icon: History },
    ],
  },
  {
    label: "Settings",
    items: [{ label: "Academy settings", href: "/admin/settings", icon: Settings }],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-screen">
      {/* Brand header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1">
            {BRAND_NAME}
          </span>
          <span className="text-[11px] text-slate-400">Company workspace</span>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <section key={group.label}>
            <h2 className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.16em]">
              {group.label}
            </h2>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : group.label === "Manage" && pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={`${group.label}-${item.label}`}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition",
                      isActive
                        ? "bg-indigo-600/15 text-indigo-200 ring-1 ring-inset ring-indigo-500/30"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? "text-indigo-300" : "text-slate-500")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      {/* Footer shortcuts */}
      <div className="p-3 border-t border-slate-800">
        <Link
          href="/dashboard"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
        >
          <span>My learning library</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
