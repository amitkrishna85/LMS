"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  PlusCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Archive,
  Send,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { formatDuration } from "@/lib/utils";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Bulk Selection
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Course Form
  const [courseForm, setCourseForm] = useState({
    title: "",
    shortDescription: "",
    description: "",
    thumbnailUrl: "",
    instructorName: "",
    level: "BEGINNER",
    language: "English",
    durationMinutes: 60,
    tagsString: "WebDev, React",
    categoryId: "",
    type: "INTERNAL" as "INTERNAL" | "EXTERNAL",
    externalUrl: "",
    externalProvider: "Udemy",
    status: "DRAFT" as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    isFeatured: false,
  });

  // Fetch Categories
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        if (data.categories?.length > 0 && !courseForm.categoryId) {
          setCourseForm((prev) => ({ ...prev, categoryId: data.categories[0].id }));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Courses
  const fetchCourses = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "10",
      search,
      type: typeFilter,
      status: statusFilter,
      categoryId: categoryFilter,
      sort,
    });

    fetch(`/api/admin/courses?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses || []);
        setPagination(data.pagination || { total: 0, totalPages: 1 });
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to fetch courses");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCourses();
  }, [page, typeFilter, statusFilter, categoryFilter, sort]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchCourses();
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Handle Thumbnail File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "thumbnails");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setCourseForm((prev) => ({ ...prev, thumbnailUrl: data.url }));
        toast.success("Thumbnail uploaded successfully");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Error uploading file");
    } finally {
      setUploadingMedia(false);
    }
  };

  // Create Course Submit
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (courseForm.type === "EXTERNAL") {
      if (!courseForm.externalUrl || !courseForm.externalUrl.startsWith("https://")) {
        toast.error("External course URL must begin with https://");
        return;
      }
    }

    const tags = courseForm.tagsString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...courseForm,
          tags,
          durationMinutes: Number(courseForm.durationMinutes) || 60,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create course");
      } else {
        toast.success(`Course "${data.course.title}" created!`);
        setShowCreateModal(false);
        fetchCourses();
      }
    } catch {
      toast.error("Network error while creating course");
    }
  };

  // Bulk Action
  const handleBulkAction = async (action: "PUBLISH" | "ARCHIVE" | "DELETE") => {
    if (selectedCourseIds.length === 0) return;
    if (
      action === "DELETE" &&
      !confirm(`Permanently delete ${selectedCourseIds.length} course(s)?`)
    ) {
      return;
    }

    try {
      const res = await fetch("/api/admin/courses/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseIds: selectedCourseIds,
          action,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Bulk operation completed");
        setSelectedCourseIds([]);
        fetchCourses();
      } else {
        toast.error(data.error || "Operation failed");
      }
    } catch {
      toast.error("Network error during bulk action");
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedCourseIds.length === courses.length) {
      setSelectedCourseIds([]);
    } else {
      setSelectedCourseIds(courses.map((c) => c.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <span>Course Catalog Management</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage hosted internal masterclasses and external course links (Udemy, Coursera, etc.).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Course</span>
          </button>

          {selectedCourseIds.length > 0 && (
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-700 rounded-xl">
              <span className="text-[11px] text-slate-400 px-2 font-medium">
                {selectedCourseIds.length} selected
              </span>
              <button
                onClick={() => handleBulkAction("PUBLISH")}
                className="px-2.5 py-1 text-xs bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-lg transition"
              >
                Publish
              </button>
              <button
                onClick={() => handleBulkAction("ARCHIVE")}
                className="px-2.5 py-1 text-xs bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 rounded-lg transition"
              >
                Archive
              </button>
              <button
                onClick={() => handleBulkAction("DELETE")}
                className="px-2.5 py-1 text-xs bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 rounded-lg transition"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, description, or instructor..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All Course Types</option>
            <option value="INTERNAL">Internal (Hosted)</option>
            <option value="EXTERNAL">External (Link)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Enrolled</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={courses.length > 0 && selectedCourseIds.length === courses.length}
                    onChange={toggleSelectAll}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="p-4">Course Details</th>
                <th className="p-4">Delivery Type</th>
                <th className="p-4">Category</th>
                <th className="p-4">Level / Duration</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading courses...
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No courses found matching criteria.
                  </td>
                </tr>
              ) : (
                courses.map((c) => {
                  const isSelected = selectedCourseIds.includes(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={isSelected ? "bg-indigo-950/20" : "hover:bg-slate-800/40 transition"}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setSelectedCourseIds(selectedCourseIds.filter((id) => id !== c.id));
                            } else {
                              setSelectedCourseIds([...selectedCourseIds, c.id]);
                            }
                          }}
                          className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {c.thumbnailUrl ? (
                            <img
                              src={c.thumbnailUrl}
                              alt={c.title}
                              className="w-12 h-8 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700"
                            />
                          ) : (
                            <div className="w-12 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 shrink-0">
                              <BookOpen className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0 max-w-sm">
                            <div className="font-semibold text-slate-100 truncate">
                              {c.title}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              Instructor: {c.instructorName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {c.type === "INTERNAL" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            <Layers className="w-3 h-3" />
                            <span>On Platform</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            <ExternalLink className="w-3 h-3" />
                            <span>External ({c.externalProvider || "Udemy"})</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400">
                        {c.category?.name || "General"}
                      </td>
                      <td className="p-4 text-slate-300">
                        <div>{c.level}</div>
                        <div className="text-[11px] text-slate-500">
                          {formatDuration(c.durationMinutes)}
                        </div>
                      </td>
                      <td className="p-4">
                        {c.status === "PUBLISHED" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Published</span>
                          </span>
                        ) : c.status === "DRAFT" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Draft</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                            <Archive className="w-3.5 h-3.5" />
                            <span>Archived</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/courses/${c.slug}`}
                            target="_blank"
                            title="Preview Public Page"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/courses/${c.id}/edit`}
                            title="Edit Curriculum & Settings"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {courses.length} of {pagination.total} catalog courses
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {page} of {pagination.totalPages || 1}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE COURSE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Create New Course</h3>
                <p className="text-xs text-slate-400">
                  Select delivery type: internal course hosted here or curated external course link.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              {/* Type Switcher Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Course Delivery Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setCourseForm({ ...courseForm, type: "INTERNAL" })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                      courseForm.type === "INTERNAL"
                        ? "bg-indigo-600/10 border-indigo-500 text-white"
                        : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <Layers className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-200">
                        Internal Course (Hosted)
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Upload videos, text lessons, PDFs, and quizzes inside the built-in LMS player.
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setCourseForm({ ...courseForm, type: "EXTERNAL" })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                      courseForm.type === "EXTERNAL"
                        ? "bg-amber-500/10 border-amber-500 text-white"
                        : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <ExternalLink className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-200">
                        External Course (Link)
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Curate a course on Udemy, Coursera, or edX. Opens in a new tab with self-reported progress.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* External Provider Fields */}
              {courseForm.type === "EXTERNAL" && (
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>External Course Configuration</span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      External Course URL (https:// only) *
                    </label>
                    <input
                      type="url"
                      required
                      value={courseForm.externalUrl}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, externalUrl: e.target.value })
                      }
                      placeholder="https://www.udemy.com/course/..."
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Provider Name
                    </label>
                    <select
                      value={courseForm.externalProvider}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, externalProvider: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Udemy">Udemy</option>
                      <option value="Coursera">Coursera</option>
                      <option value="YouTube">YouTube</option>
                      <option value="edX">edX</option>
                      <option value="Pluralsight">Pluralsight</option>
                      <option value="Other">Other Platform</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Title & Instructor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseForm.title}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, title: e.target.value })
                    }
                    placeholder="e.g. Full-Stack Systems Architecture"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Instructor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseForm.instructorName}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, instructorName: e.target.value })
                    }
                    placeholder="e.g. Dr. Angela Yu or Self"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Short Description (Card summary) *
                </label>
                <input
                  type="text"
                  required
                  value={courseForm.shortDescription}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, shortDescription: e.target.value })
                  }
                  placeholder="One or two sentences summarizing outcomes..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Description & Syllabus Outline *
                </label>
                <textarea
                  rows={4}
                  required
                  value={courseForm.description}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, description: e.target.value })
                  }
                  placeholder="Detailed learning objectives, prerequisites, and skills acquired..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Metadata Row: Level, Category, Duration, Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Level
                  </label>
                  <select
                    value={courseForm.level}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, level: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={courseForm.categoryId}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, categoryId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Est. Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={courseForm.durationMinutes}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        durationMinutes: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Thumbnail URL or Upload */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Course Thumbnail Image URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={courseForm.thumbnailUrl}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, thumbnailUrl: e.target.value })
                    }
                    placeholder="https://images.unsplash.com/... or upload below"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{uploadingMedia ? "Uploading..." : "Upload File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Tags & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={courseForm.tagsString}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, tagsString: e.target.value })
                    }
                    placeholder="React, TypeScript, DevOps"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Publishing Status
                  </label>
                  <select
                    value={courseForm.status}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="DRAFT">Save as Draft</option>
                    <option value="PUBLISHED">Published (Visible on site)</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
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
                  Create & Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
