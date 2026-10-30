"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Milestone,
  PlusCircle,
  Clock,
  BookOpen,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Archive,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPathsPage() {
  const [paths, setPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pathForm, setPathForm] = useState({
    title: "",
    description: "",
    thumbnailUrl: "",
    level: "INTERMEDIATE" as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
    estimatedHours: 40,
    status: "PUBLISHED" as "DRAFT" | "PUBLISHED",
    isFeatured: true,
  });

  const loadPaths = () => {
    setLoading(true);
    fetch("/api/admin/paths")
      .then((res) => res.json())
      .then((data) => {
        setPaths(data.paths || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load learning paths");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPaths();
  }, []);

  const handleCreatePath = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...pathForm,
          estimatedHours: Number(pathForm.estimatedHours) || 20,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Learning path "${data.path.title}" created!`);
        setShowCreateModal(false);
        const createdPath = data.path;
        setPaths((prev) => [createdPath, ...prev.filter((p) => p.id !== createdPath.id)]);
        setPathForm({
          title: "",
          description: "",
          thumbnailUrl: "",
          level: "INTERMEDIATE",
          estimatedHours: 40,
          status: "PUBLISHED",
          isFeatured: true,
        });
        loadPaths();
      } else {
        toast.error(data.error || "Failed to create path");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleDeletePath = async (path: any) => {
    if (!confirm(`Delete learning path "${path.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/paths/${path.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Path deleted");
        loadPaths();
      } else {
        toast.error("Failed to delete path");
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
            <Milestone className="w-6 h-6 text-indigo-400" />
            <span>Learning Paths & Career Roadmaps</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Admin-curated sequences combining internal deep dives and external certifications.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Learning Path</span>
        </button>
      </div>

      {/* Grid of Paths */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Loading learning paths...
        </div>
      ) : paths.length === 0 ? (
        <div className="p-12 border border-dashed border-slate-800 rounded-2xl text-center space-y-3">
          <Milestone className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Learning Paths Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Design your first sequential career roadmap combining internal and external courses.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
          >
            Create Learning Path
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paths.map((p) => (
            <div
              key={p.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-sm hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {p.level}
                    </span>
                    {p.status === "PUBLISHED" ? (
                      <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Published</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Draft</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>~{p.estimatedHours} Hours</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-1.5 hover:text-indigo-400 transition">
                  <Link href={`/admin/paths/${p.id}`}>{p.title}</Link>
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                  {p.description}
                </p>

                {/* Steps summary */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4">
                  <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                    <span>Curriculum Sequence</span>
                    <span className="text-indigo-400 font-normal">
                      {p.items?.length || 0} Course Steps
                    </span>
                  </div>
                  {p.items?.slice(0, 3).map((it: any, idx: number) => (
                    <div
                      key={it.id || idx}
                      className="text-[11px] text-slate-400 truncate flex items-center gap-1.5"
                    >
                      <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[9px] text-slate-300 shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate">
                        {it.course?.title || `Course ID: ${it.courseId}`}
                      </span>
                      {it.course?.type === "EXTERNAL" && (
                        <span className="text-[9px] text-amber-400 shrink-0 font-medium">
                          (Ext)
                        </span>
                      )}
                    </div>
                  ))}
                  {p.items?.length > 3 && (
                    <div className="text-[10px] text-slate-500 pl-5">
                      + {p.items.length - 3} more steps in roadmap
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <Link
                  href={`/paths/${p.slug}`}
                  target="_blank"
                  className="text-slate-400 hover:text-white flex items-center gap-1 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Public View</span>
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/paths/${p.id}`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-semibold flex items-center gap-1.5 transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Roadmap</span>
                  </Link>
                  <button
                    onClick={() => handleDeletePath(p)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                    title="Delete Learning Path"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PATH MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Create New Learning Path
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter roadmap details. You can add internal and external course steps in the next screen.
            </p>

            <form onSubmit={handleCreatePath} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Learning Path Title *
                </label>
                <input
                  type="text"
                  required
                  value={pathForm.title}
                  onChange={(e) =>
                    setPathForm({ ...pathForm, title: e.target.value })
                  }
                  placeholder="e.g. Full-Stack Cloud Architect"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={pathForm.description}
                  onChange={(e) =>
                    setPathForm({ ...pathForm, description: e.target.value })
                  }
                  placeholder="What learners will master by finishing this complete sequence..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Target Difficulty Level
                  </label>
                  <select
                    value={pathForm.level}
                    onChange={(e) =>
                      setPathForm({ ...pathForm, level: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    value={pathForm.estimatedHours}
                    onChange={(e) =>
                      setPathForm({
                        ...pathForm,
                        estimatedHours: parseInt(e.target.value, 10) || 20,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Thumbnail Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={pathForm.thumbnailUrl}
                  onChange={(e) =>
                    setPathForm({ ...pathForm, thumbnailUrl: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={pathForm.status}
                  onChange={(e) =>
                    setPathForm({ ...pathForm, status: e.target.value as any })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="PUBLISHED">Published (Visible on Home & Roadmaps)</option>
                  <option value="DRAFT">Draft (Admin Only)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featuredPath"
                  checked={pathForm.isFeatured}
                  onChange={(e) =>
                    setPathForm({ ...pathForm, isFeatured: e.target.checked })
                  }
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="featuredPath" className="text-xs text-slate-300 cursor-pointer">
                  Feature prominently on homepage
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30"
                >
                  Create & Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
