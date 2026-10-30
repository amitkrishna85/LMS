"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Video,
  FileText,
  FileDown,
  HelpCircle,
  Eye,
  ExternalLink,
  Layers,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminCourseEditPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Lesson modal state
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: "",
    type: "VIDEO" as "VIDEO" | "TEXT" | "PDF" | "QUIZ",
    contentUrl: "",
    body: "",
    durationMinutes: 10,
    isPreview: false,
  });

  // Section modal state
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  // Load Course and Categories
  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/courses/${courseId}`).then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ])
      .then(([courseData, catData]) => {
        if (courseData.course) {
          setCourse(courseData.course);
        } else {
          toast.error("Course not found");
        }
        setCategories(catData.categories || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load course details");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (courseId) loadData();
  }, [courseId]);

  // Save General Course Details
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: course.title,
          shortDescription: course.shortDescription,
          description: course.description,
          thumbnailUrl: course.thumbnailUrl,
          instructorName: course.instructorName,
          level: course.level,
          durationMinutes: Number(course.durationMinutes) || 0,
          categoryId: course.categoryId,
          status: course.status,
          type: course.type,
          externalUrl: course.type === "EXTERNAL" ? course.externalUrl : null,
          externalProvider: course.type === "EXTERNAL" ? course.externalProvider : null,
          isFeatured: course.isFeatured,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Course details updated successfully");
      } else {
        toast.error(data.error || "Failed to update course");
      }
    } catch {
      toast.error("Error saving course");
    } finally {
      setSaving(false);
    }
  };

  // Add Section
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;

    try {
      const currentSections = course.sections || [];
      const res = await fetch(`/api/admin/courses/${courseId}/curriculum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "SECTION",
          title: newSectionTitle,
          order: currentSections.length + 1,
        }),
      });

      if (res.ok) {
        toast.success("Section added");
        setNewSectionTitle("");
        setShowAddSectionModal(false);
        loadData();
      } else {
        toast.error("Failed to add section");
      }
    } catch {
      toast.error("Network error");
    }
  };

  // Delete Section
  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section and all its lessons?")) return;
    try {
      const res = await fetch(
        `/api/admin/courses/${courseId}/curriculum?itemType=SECTION&itemId=${sectionId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("Section deleted");
        loadData();
      } else {
        toast.error("Failed to delete section");
      }
    } catch {
      toast.error("Network error");
    }
  };

  // Add Lesson
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSectionId) return;

    try {
      const section = course.sections?.find((s: any) => s.id === activeSectionId);
      const currentLessons = section?.lessons || [];

      const res = await fetch(`/api/admin/courses/${courseId}/curriculum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "LESSON",
          sectionId: activeSectionId,
          title: newLesson.title,
          type: newLesson.type,
          contentUrl: newLesson.contentUrl || null,
          body: newLesson.body || null,
          durationMinutes: Number(newLesson.durationMinutes) || 10,
          isPreview: newLesson.isPreview,
          order: currentLessons.length + 1,
        }),
      });

      if (res.ok) {
        toast.success("Lesson added");
        setShowAddLessonModal(false);
        setNewLesson({
          title: "",
          type: "VIDEO",
          contentUrl: "",
          body: "",
          durationMinutes: 10,
          isPreview: false,
        });
        loadData();
      } else {
        toast.error("Failed to add lesson");
      }
    } catch {
      toast.error("Network error");
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;
    try {
      const res = await fetch(
        `/api/admin/courses/${courseId}/curriculum?itemType=LESSON&itemId=${lessonId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("Lesson deleted");
        loadData();
      } else {
        toast.error("Failed to delete lesson");
      }
    } catch {
      toast.error("Network error");
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        Loading course configuration...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        Course not found.
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/courses"
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white truncate max-w-md">
                {course.title}
              </h2>
              {course.type === "INTERNAL" ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                  Internal (Hosted)
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                  External ({course.externalProvider || "Udemy"})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Slug: <code className="text-slate-300">/courses/{course.slug}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/courses/${course.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>Public Preview</span>
          </Link>
          <button
            onClick={handleSaveCourse}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      {/* Main Tabs / Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: General Metadata (1 col) */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Core Course Settings</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Course Title
              </label>
              <input
                type="text"
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Instructor Name
              </label>
              <input
                type="text"
                value={course.instructorName}
                onChange={(e) => setCourse({ ...course, instructorName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={course.categoryId}
                onChange={(e) => setCourse({ ...course, categoryId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Level
                </label>
                <select
                  value={course.level}
                  onChange={(e) => setCourse({ ...course, level: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={course.status}
                  onChange={(e) => setCourse({ ...course, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Short Description
              </label>
              <textarea
                rows={2}
                value={course.shortDescription}
                onChange={(e) => setCourse({ ...course, shortDescription: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Description / Syllabus Notes
              </label>
              <textarea
                rows={4}
                value={course.description}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isFeatured"
                checked={course.isFeatured}
                onChange={(e) => setCourse({ ...course, isFeatured: e.target.checked })}
                className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isFeatured" className="text-xs text-slate-300 cursor-pointer">
                Feature on Homepage
              </label>
            </div>
          </div>

          {/* External Provider Box (If External) */}
          {course.type === "EXTERNAL" && (
            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4">
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                <span>External Link Settings</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Destination URL *
                </label>
                <input
                  type="url"
                  value={course.externalUrl || ""}
                  onChange={(e) => setCourse({ ...course, externalUrl: e.target.value })}
                  placeholder="https://www.udemy.com/course/..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  External Provider Name
                </label>
                <input
                  type="text"
                  value={course.externalProvider || "Udemy"}
                  onChange={(e) => setCourse({ ...course, externalProvider: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {course.externalUrl && (
                <a
                  href={course.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 underline pt-1"
                >
                  <span>Test open destination link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Curriculum Builder or External Overview (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {course.type === "INTERNAL" ? (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    <span>Curriculum & Lessons</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Build structured modules with video lectures, reading material, downloadable PDFs, and quizzes.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddSectionModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Section</span>
                </button>
              </div>

              {/* Sections List */}
              <div className="space-y-4">
                {(!course.sections || course.sections.length === 0) ? (
                  <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center space-y-2">
                    <p className="text-xs text-slate-400">
                      No sections created yet for this course.
                    </p>
                    <button
                      onClick={() => setShowAddSectionModal(true)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition"
                    >
                      Create First Section
                    </button>
                  </div>
                ) : (
                  course.sections.map((section: any, idx: number) => (
                    <div
                      key={section.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden"
                    >
                      {/* Section Header */}
                      <div className="p-4 bg-slate-800/40 border-b border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-800 px-2 py-0.5 rounded-md">
                            Section {idx + 1}
                          </span>
                          <span className="font-semibold text-sm text-slate-100">
                            {section.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setActiveSectionId(section.id);
                              setShowAddLessonModal(true);
                            }}
                            className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Lesson</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSection(section.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                            title="Delete Section"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Lessons under this section */}
                      <div className="divide-y divide-slate-800/60 p-2">
                        {(!section.lessons || section.lessons.length === 0) ? (
                          <div className="py-3 px-4 text-xs text-slate-500 italic">
                            No lessons in this section. Click "Add Lesson" above.
                          </div>
                        ) : (
                          section.lessons.map((lesson: any, lIdx: number) => {
                            const LessonIcon =
                              lesson.type === "VIDEO"
                                ? Video
                                : lesson.type === "TEXT"
                                ? FileText
                                : lesson.type === "PDF"
                                ? FileDown
                                : HelpCircle;

                            return (
                              <div
                                key={lesson.id}
                                className="py-2.5 px-3 flex items-center justify-between gap-3 hover:bg-slate-900/60 rounded-lg transition"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                    <LessonIcon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-medium text-slate-200 truncate flex items-center gap-2">
                                      <span>
                                        {lIdx + 1}. {lesson.title}
                                      </span>
                                      {lesson.isPreview && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase">
                                          Free Preview
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                      <span className="capitalize">{lesson.type.toLowerCase()}</span>
                                      <span>•</span>
                                      <span>{lesson.durationMinutes} mins</span>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                  className="p-1 text-slate-500 hover:text-rose-400 transition"
                                  title="Delete Lesson"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <ExternalLink className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">
                External Course Configuration
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                This course is delivered through an external provider ({course.externalProvider || "Udemy"}). Students enroll and are directed to the destination platform via a secure, tracked link.
              </p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs font-mono max-w-lg mx-auto">
                <span className="text-slate-400 block mb-1">Target Outbound Link:</span>
                <span className="text-amber-400 break-all">{course.externalUrl || "None provided"}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD SECTION */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Add Curriculum Section</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter a title for this module (e.g. "Section 1: Architecture Blueprint").
            </p>

            <form onSubmit={handleAddSection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Section Title *
                </label>
                <input
                  type="text"
                  required
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="e.g. Core Foundations & Data Layer"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30"
                >
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD LESSON */}
      {showAddLessonModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white mb-1">Add Lesson</h3>
            <p className="text-xs text-slate-400 mb-4">
              Create a lesson with video streaming, markdown reading, PDF notes, or quiz.
            </p>

            <form onSubmit={handleAddLesson} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  placeholder="e.g. 1.1 Understanding Relational Modeling"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Content Type
                  </label>
                  <select
                    value={newLesson.type}
                    onChange={(e) =>
                      setNewLesson({ ...newLesson, type: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="VIDEO">Video Lecture</option>
                    <option value="TEXT">Reading (Rich Text / Markdown)</option>
                    <option value="PDF">PDF Download / Slide Deck</option>
                    <option value="QUIZ">Interactive Knowledge Quiz</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={newLesson.durationMinutes}
                    onChange={(e) =>
                      setNewLesson({
                        ...newLesson,
                        durationMinutes: parseInt(e.target.value, 10) || 10,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Conditional Content Inputs */}
              {(newLesson.type === "VIDEO" || newLesson.type === "PDF") && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Media / File URL (MP4 / WebM / PDF)
                  </label>
                  <input
                    type="url"
                    value={newLesson.contentUrl}
                    onChange={(e) =>
                      setNewLesson({ ...newLesson, contentUrl: e.target.value })
                    }
                    placeholder="https://...mp4 or /uploads/..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              )}

              {(newLesson.type === "TEXT" || newLesson.type === "VIDEO") && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    {newLesson.type === "TEXT" ? "Lesson Reading Content (Markdown)" : "Video Transcript / Summary"}
                  </label>
                  <textarea
                    rows={4}
                    value={newLesson.body}
                    onChange={(e) =>
                      setNewLesson({ ...newLesson, body: e.target.value })
                    }
                    placeholder="Provide lecture notes, code snippets, or key takeaways..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {newLesson.type === "QUIZ" && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Quiz JSON Structure
                  </label>
                  <textarea
                    rows={5}
                    value={newLesson.body}
                    onChange={(e) =>
                      setNewLesson({ ...newLesson, body: e.target.value })
                    }
                    placeholder={`{\n  "questions": [\n    {\n      "id": "q1",\n      "question": "What is ...?",\n      "options": ["A", "B", "C"],\n      "correctIndex": 0\n    }\n  ]\n}`}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPreview"
                  checked={newLesson.isPreview}
                  onChange={(e) =>
                    setNewLesson({ ...newLesson, isPreview: e.target.checked })
                  }
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isPreview" className="text-xs text-slate-300 cursor-pointer">
                  Allow Free Preview (Students can view without enrollment)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30"
                >
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
