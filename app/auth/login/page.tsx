"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(
    errorParam ? "Authentication failed. Please check your credentials." : ""
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
        callbackUrl,
      });

      if (!res?.ok || res?.error) {
        setErrorMsg(res?.error || "Invalid email or password");
        toast.error(res?.error || "Login failed");
      } else {
        toast.success("Welcome back!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@organization.com"
              className="w-full pl-11 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-11 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Logins Helper */}
      <div className="mt-8 pt-6 border-t border-slate-700/60">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Demo Quick Sign-In</span>
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => quickFill("admin@skillpulse.local", "Admin123!")}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600/60 text-left transition"
          >
            <div className="font-semibold text-indigo-300">Admin Account</div>
            <div className="text-slate-400 truncate">admin@skillpulse...</div>
          </button>
          <button
            type="button"
            onClick={() => quickFill("marcus@skillpulse.local", "Student123!")}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600/60 text-left transition"
          >
            <div className="font-semibold text-emerald-300">Student Account</div>
            <div className="text-slate-400 truncate">marcus@skillpulse...</div>
          </button>
        </div>
        <button
          type="button"
          onClick={() => quickFill("jordan@skillpulse.local", "Welcome123!")}
          className="w-full mt-2 p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/40 text-left transition text-xs"
        >
          <span className="font-semibold text-amber-300">New Student Demo: </span>
          <span className="text-slate-400">jordan@skillpulse... (Tests forced password change)</span>
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-white mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <span>Skill<span className="text-indigo-400">Pulse</span></span>
        </Link>
        <h2 className="text-xl font-semibold text-slate-200">Sign in to your learning account</h2>
        <p className="mt-1 text-sm text-slate-400">
          Admin-managed access platform. Sign in with your provided credentials.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense fallback={<div className="text-center text-slate-400 p-8">Loading authentication...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
