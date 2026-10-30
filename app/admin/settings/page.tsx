"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, ShieldCheck, Mail, Palette, Globe } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    siteName: "SkillPulse",
    logoUrl: "",
    primaryColor: "#6366f1",
    footerText: "© 2026 SkillPulse Learning Platform. All rights reserved.",
    socialLinks: JSON.stringify({
      twitter: "https://twitter.com",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
    }),
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((d) => {
        if (d.settings) setForm(d.settings);
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Platform settings saved successfully");
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-400" />
            <span>Platform Branding & Configuration</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Global site metadata, theme accent tokens, and email delivery settings.
          </p>
        </div>
      </div>

      <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Platform Name *</span>
            </label>
            <input
              type="text"
              required
              value={form.siteName}
              onChange={(e) => setForm({ ...form, siteName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Logo Image URL (Optional)
            </label>
            <input
              type="url"
              value={form.logoUrl || ""}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              placeholder="https://...png"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-indigo-400" />
              <span>Primary Accent Color</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="w-10 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="w-32 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Footer Copyright Text
            </label>
            <input
              type="text"
              value={form.footerText}
              onChange={(e) => setForm({ ...form, footerText: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-semibold text-slate-300 block flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Email Delivery Status</span>
            </span>
            <p className="text-slate-400 text-[11px]">
              Optional SMTP / Resend integration. When not configured, password reset tokens and temporary passwords display directly in the admin modal to ensure frictionless zero-setup operations.
            </p>
          </div>

          <div className="pt-2 text-right">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 ml-auto cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
