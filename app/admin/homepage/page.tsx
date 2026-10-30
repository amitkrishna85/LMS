"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Save,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminHomepageBuilderPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero form editor
  const [heroForm, setHeroForm] = useState({
    headline: "Master In-Demand Skills with Curated Learning",
    subheadline: "Accelerate your career through high-impact internal masterclasses and world-class external certifications in one unified platform.",
    ctaText: "Explore Courses",
    ctaLink: "/courses",
    secondaryCtaText: "View Learning Paths",
    secondaryCtaLink: "/paths",
  });

  const loadSections = () => {
    setLoading(true);
    fetch("/api/admin/homepage")
      .then((res) => res.json())
      .then((data) => {
        const secs = data.sections || [];
        setSections(secs);
        const hero = secs.find((s: any) => s.type === "HERO");
        if (hero) {
          try {
            const parsed = JSON.parse(hero.config);
            setHeroForm((prev) => ({ ...prev, ...parsed }));
          } catch {}
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load sections");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSections();
  }, []);

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    const heroSec = sections.find((s) => s.type === "HERO");
    if (!heroSec) return;

    try {
      const res = await fetch("/api/admin/homepage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: heroSec.id,
          config: JSON.stringify(heroForm),
        }),
      });

      if (res.ok) {
        toast.success("Hero banner configuration saved!");
        loadSections();
      } else {
        toast.error("Failed to save hero section");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const toggleVisibility = async (section: any) => {
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: section.id,
          isVisible: !section.isVisible,
        }),
      });

      if (res.ok) {
        toast.success(`${section.title} visibility updated`);
        loadSections();
      } else {
        toast.error("Failed to update visibility");
      }
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-400" />
            <span>Homepage Section Builder</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Customize the public landing page, hero narrative, section visibility, and order.
          </p>
        </div>

        <a
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
        >
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span>View Public Homepage</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Hero Editor (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Hero Banner Narrative & CTAs</span>
              </h3>
            </div>

            <form onSubmit={handleSaveHero} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  required
                  value={heroForm.headline}
                  onChange={(e) =>
                    setHeroForm({ ...heroForm, headline: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Subheadline / Value Proposition
                </label>
                <textarea
                  rows={3}
                  required
                  value={heroForm.subheadline}
                  onChange={(e) =>
                    setHeroForm({ ...heroForm, subheadline: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Primary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={heroForm.ctaText}
                    onChange={(e) =>
                      setHeroForm({ ...heroForm, ctaText: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Primary CTA Link
                  </label>
                  <input
                    type="text"
                    value={heroForm.ctaLink}
                    onChange={(e) =>
                      setHeroForm({ ...heroForm, ctaLink: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Secondary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={heroForm.secondaryCtaText}
                    onChange={(e) =>
                      setHeroForm({ ...heroForm, secondaryCtaText: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Secondary CTA Link
                  </label>
                  <input
                    type="text"
                    value={heroForm.secondaryCtaLink}
                    onChange={(e) =>
                      setHeroForm({ ...heroForm, secondaryCtaLink: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Save Hero Settings
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Sections Visibility & Reorder (1 col) */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Section Controls</span>
            </h3>
            <p className="text-xs text-slate-400">
              Toggle visibility for individual sections across the public page.
            </p>

            <div className="space-y-2.5">
              {sections.map((sec) => (
                <div
                  key={sec.id}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">
                      {sec.title}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">
                      Type: {sec.type}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleVisibility(sec)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                  >
                    {sec.isVisible ? (
                      <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                        <ToggleRight className="w-4 h-4" />
                        <span>Visible</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 font-semibold text-[11px] flex items-center gap-1">
                        <ToggleLeft className="w-4 h-4" />
                        <span>Hidden</span>
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
