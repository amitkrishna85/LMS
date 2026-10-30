"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Milestone,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Eye,
  ExternalLink,
  Layers,
  Clock,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { formatDuration } from "@/lib/utils";

export default function AdminPathDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pathId = params?.id as string;

  const [path, setPath] = useState<any>(null);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Add course to path modal
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [stepNote, setStepNote] = useState("");
  const [stepRequired, setStepRequired] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/paths/${pathId}`).then((r) => r.json()),
      fetch("/api/admin/courses?limit=100").then((r) => r.json()),
    ])
      .then(([pathData, coursesData]) => {
        if (pathData.path) {
          setPath(pathData.path);
        } else {
          toast.error("Path not found");
        }
        setAvailableCourses(coursesData.courses || []);
        if (coursesData.courses?.length > 0 && !selectedCourseId) {
          setSelectedCourseId(coursesData.courses[0].id);
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load learning path details");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (pathId) loadData();
  }, [pathId]);

  // Save Path Details
  const handleSavePath = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/paths/${pathId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: path.title,
          description: path.description,
          level: path.level,
          estimatedHours: Number(path.estimatedHours) || 0,
          status: path.status,
          thumbnailUrl: path.thumbnailUrl,
          isFeatured: path.isFeatured,
        }),
      });

      if (res.ok) {
        toast.success("Path details saved");
      } else {
        toast.error("Failed to save path details");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  // Add Course Step
  const handleAddCourseStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    try {
      const currentItems = path.items || [];
      const res = await fetch(`/api/admin/paths/${pathId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourseId,
          order: currentItems.length + 1,
          isRequired: stepRequired,
          note: stepNote,
        }),
      });

      if (res.ok) {
        toast.success("Course added to path");
        setShowAddCourseModal(false);
        setStepNote("");
        loadData();
      } else {
        toast.error("Failed to add course step");
      }
    } catch {
      toast.error("Network error");
    }
  };

  // Reorder Item
  const handleMoveItem = async (itemId: string, direction: "UP" | "DOWN", currentIndex: number) => {
    const items = [...path.items];
    const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= items.length) return;

    const currentItem = items[currentIndex];
    const targetItem = items[targetIndex];

    try {
      await Promise.all([
        fetch(`/api/admin/paths/${pathId}/items`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId: currentItem.id,
            order: targetItem.order,
          }),
        }),
        fetch(`/api/admin/paths/${pathId}/items`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId: targetItem.id,
            order: currentItem.order,
          }),
        }),
      ]);

      toast.success("Step order updated");
      loadData();
    } catch {
      toast.error("Failed to reorder steps");
    }
  };

  // Remove Course Step
  const handleRemoveStep = async (itemId: string) => {
    if (!confirm("Remove this course step from the learning path?")) return;

    try {
      const res = await fetch(`/api/admin/paths/${pathId}/items?itemId=${itemId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Course step removed");
        loadData();
      } else {
        toast.error("Failed to remove course step");
      }
    } catch {
      toast.error("Network error");
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        Loading path designer...
      </div>
    );
  }

  if (!path) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        Path not found.
      </div>
    );
  }

  const filteredCourses = availableCourses.filter(
    (c) =>
      c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.instructorName.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/paths"
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white truncate max-w-md">
                {path.title}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold uppercase">
                {path.level}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Slug: <code className="text-slate-300">/paths/{path.slug}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/paths/${path.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>Public Roadmap</span>
          </Link>
          <button
            onClick={handleSavePath}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving..." : "Save Path"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metadata (1 col) */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Milestone className="w-4 h-4 text-indigo-400" />
              <span>Roadmap Details</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Path Title
              </label>
              <input
                type="text"
                value={path.title}
                onChange={(e) => setPath({ ...path, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={path.description}
                onChange={(e) => setPath({ ...path, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Level
                </label>
                <select
                  value={path.level}
                  onChange={(e) => setPath({ ...path, level: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Est. Hours
                </label>
                <input
                  type="number"
                  value={path.estimatedHours}
                  onChange={(e) =>
                    setPath({
                      ...path,
                      estimatedHours: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status
              </label>
              <select
                value={path.status}
                onChange={(e) => setPath({ ...path, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Thumbnail Image URL
              </label>
              <input
                type="url"
                value={path.thumbnailUrl || ""}
                onChange={(e) => setPath({ ...path, thumbnailUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isFeaturedPath"
                checked={path.isFeatured}
                onChange={(e) => setPath({ ...path, isFeatured: e.target.checked })}
                className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isFeaturedPath" className="text-xs text-slate-300 cursor-pointer">
                Feature on Homepage
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Ordered Course Steps (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <span>Sequential Learning Roadmap ({path.items?.length || 0} Steps)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Drag or order steps. Students progress sequentially through internal and external courses.
                </p>
              </div>

              <button
                onClick={() => setShowAddCourseModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Course Step</span>
              </button>
            </div>

            {/* List of Steps */}
            <div className="space-y-3">
              {(!path.items || path.items.length === 0) ? (
                <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center space-y-2">
                  <p className="text-xs text-slate-400">
                    No courses added to this path yet.
                  </p>
                  <button
                    onClick={() => setShowAddCourseModal(true)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition"
                  >
                    Add First Step
                  </button>
                </div>
              ) : (
                path.items.map((item: any, idx: number) => {
                  const course = item.course;
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Step Number Badge */}
                        <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-slate-100 truncate">
                              {course?.title || "Unknown Course"}
                            </span>
                            {course?.type === "INTERNAL" ? (
                              <span className="text-[9px] px-2 py-0.2 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                                Hosted
                              </span>
                            ) : (
                              <span className="text-[9px] px-2 py-0.2 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium flex items-center gap-1">
                                <ExternalLink className="w-2.5 h-2.5" />
                                <span>{course?.externalProvider || "Udemy"}</span>
                              </span>
                            )}
                            {item.isRequired ? (
                              <span className="text-[9px] text-emerald-400 font-semibold uppercase">
                                Required
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-400 uppercase">
                                Optional
                              </span>
                            )}
                          </div>

                          {item.note && (
                            <p className="text-xs text-indigo-300 italic mb-1">
                              Note: {item.note}
                            </p>
                          )}

                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{course?.level}</span>
                            <span>•</span>
                            <span>{formatDuration(course?.durationMinutes || 0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Reorder & Remove Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveItem(item.id, "UP", idx)}
                          className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          disabled={idx === path.items.length - 1}
                          onClick={() => handleMoveItem(item.id, "DOWN", idx)}
                          className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveStep(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                          title="Remove Step"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD COURSE STEP */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Add Course to Roadmap
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select an internal or external course from your catalog and specify milestone guidance.
            </p>

            <form onSubmit={handleAddCourseStep} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Select Course *
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      placeholder="Filter course list..."
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none"
                    />
                  </div>

                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    size={5}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {filteredCourses.map((c) => (
                      <option key={c.id} value={c.id} className="p-2 border-b border-slate-700/50">
                        {c.title} ({c.type === "INTERNAL" ? "Hosted" : `External: ${c.externalProvider}`})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Milestone Directive / Guidance Note (Optional)
                </label>
                <input
                  type="text"
                  value={stepNote}
                  onChange={(e) => setStepNote(e.target.value)}
                  placeholder="e.g. Complete Modules 1-3 before proceeding to the deployment lab."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reqCheck"
                  checked={stepRequired}
                  onChange={(e) => setStepRequired(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="reqCheck" className="text-xs text-slate-300 cursor-pointer">
                  Mandatory step for path completion (affects certificate badge)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30"
                >
                  Insert Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
