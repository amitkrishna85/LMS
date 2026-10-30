"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, ExternalLink, ShieldCheck, User } from "lucide-react";

export function AdminNavbar({ title }: { title?: string }) {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-base font-semibold text-slate-100">
          {title || "Admin Console"}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-300 transition"
        >
          <span>Live Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        {/* Current user pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
          <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
            {session?.user?.name ? session.user.name.charAt(0) : <User className="w-3.5 h-3.5" />}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs font-semibold text-slate-200 leading-tight">
              {session?.user?.name || "Admin"}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>System Administrator</span>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          title="Sign out of Admin Console"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
