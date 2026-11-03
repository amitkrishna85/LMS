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
  const [uploadingCourseFiles, setUploadingCourseFiles] = useState(false);
  const [uploadedCourseFiles, setUploadedCourseFiles] = useState<
    { name: string; url: string; contentType: string }[]
  >([]);
  const [generatingCourse, setGeneratingCourse] = useState(false);
  const [creationMode, setCreationMode] = useState<"AI" | "MANUAL">("AI");
  const [courseBrief, setCourseBrief] = useState("");

  // Course Form
  const [courseForm, setCourseForm] = useState({
    title: "",
    shortDescription: "",
    description: "",
    thumbnailUrl: "",
    instructorName: "Falkor Academy",
    level: "BEGINNER",
    language: "English",
    durationMinutes: 60,
    tagsString: "",
    categoryId: "",
    type: "INTERNAL" as const,
    status: "DRAFT" as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    isFeatured: false,
    writtenContent: "",
  });

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("create") === "1") {
      setShowCreateModal(true);
    }
  }, []);

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
      type: "INTERNAL",
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
  }, [page, statusFilter, categoryFilter, sort]);

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

  const handleCourseFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    const remainingSlots = 50 - uploadedCourseFiles.length;
    if (files.length > remainingSlots) {
      toast.error("A course can include up to 50 uploaded files.");
      files = files.slice(0, remainingSlots);
    }
    if (files.length === 0) return;

    setUploadingCourseFiles(true);
    let uploadedCount = 0;
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "folder",
          file.type.startsWith("video/") ? "videos" : "materials"
        );

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(`${file.name}: ${data.error || "Upload failed"}`);
          continue;
        }
        setUploadedCourseFiles((current) => [...current, {
          name: file.name,
          url: data.url,
          contentType: data.contentType || file.type,
        }]);
        uploadedCount += 1;
      }

      if (uploadedCount > 0) {
        toast.success(`${uploadedCount} course file(s) uploaded`);
      }
    } catch {
      toast.error("Network error while uploading course files.");
    } finally {
      setUploadingCourseFiles(false);
    }
  };

  const generateCourseDraft = async () => {
    if (courseBrief.trim().length < 20) {
      toast.error("Describe the course in at least 20 characters.");
      return;
    }
    setGeneratingCourse(true);
    try {
      const res = await fetch("/api/admin/courses/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: courseBrief,
          level: courseForm.level,
          language: courseForm.language,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "AI could not generate a course draft.");
        return;
      }

      const generated = data.course;
      setCourseForm((prev) => ({
        ...prev,
        title: generated.title,
        shortDescription: generated.shortDescription,
        description: `${generated.description}\n\nLearning outcomes:\n${generated.outcomes
          .map((outcome: string) => `- ${outcome}`)
          .join("\n")}`,
        durationMinutes: generated.durationMinutes,
        tagsString: generated.tags.join(", "),
        writtenContent: generated.writtenLesson,
        status: "DRAFT",
      }));
      toast.success("AI draft ready. Review and edit it before saving.");
    } catch {
      toast.error("Network error while generating the course draft.");
    } finally {
      setGeneratingCourse(false);
    }
  };

  // Create Course Submit
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      uploadedCourseFiles.length === 0 &&
      !courseForm.writtenContent.trim()
    ) {
      toast.error("Add a video, course file, or written lesson before saving.");
      return;
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
          uploadedFiles: uploadedCourseFiles,
          tags,
          type: "INTERNAL",
          durationMinutes: Number(courseForm.durationMinutes) || 60,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create course");
      } else {
        const created = data.course;
        const formatted = {
          ...created,
          category: categories.find((c) => c.id === created.categoryId) || {
            id: created.categoryId,
            name: "Engineering",
            slug: "swe",
          },
          _count: {
            sections: created.sections?.length || 0,
            enrollments: 0,
          },
        };
        setCourses((prev) => [formatted, ...prev.filter((c) => c.id !== formatted.id)]);
        setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
        toast.success(`Course "${created.title}" created!`);
        setShowCreateModal(false);
        setCourseForm({
          title: "",
          shortDescription: "",
          description: "",
          thumbnailUrl: "",
          instructorName: "Falkor Academy",
          level: "BEGINNER",
          language: "English",
          durationMinutes: 60,
          tagsString: "",
          categoryId: categories[0]?.id || "",
          type: "INTERNAL",
          status: "DRAFT",
          isFeatured: false,
          writtenContent: "",
        });
        setUploadedCourseFiles([]);
        setCourseBrief("");
        setCreationMode("AI");
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
            Create and manage courses with administrator-produced video and written lessons.
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
                <th className="p-4">Format</th>
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
                            <span>External ({c.externalProvider || "Learning Partner"})</span>
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
                  Add video or written lessons, then enter course details or prepare a draft with AI.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div className="flex gap-2 rounded-xl bg-slate-950 p-1">
                <button
                  type="button"
                  onClick={() => setCreationMode("AI")}
                  className={`flex-1 rounded-lg px-3 py-2 font-semibold transition ${
                    creationMode === "AI" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="mr-1.5 inline h-3.5 w-3.5" />
                  Create with AI
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMode("MANUAL")}
                  className={`flex-1 rounded-lg px-3 py-2 font-semibold transition ${
                    creationMode === "MANUAL" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Create manually
                </button>
              </div>

              {creationMode === "AI" && (
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-indigo-200">
                    <Sparkles className="h-4 w-4" />
                    AI course assistant
                  </div>
                  <label className="block text-slate-300 font-medium" htmlFor="course-ai-brief">
                    Describe the course and what learners should take away
                  </label>
                  <textarea
                    id="course-ai-brief"
                    rows={3}
                    value={courseBrief}
                    onChange={(e) => setCourseBrief(e.target.value)}
                    placeholder="Describe the subject, key concepts, and intended audience..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    AI drafts course details and a written lesson from your brief. The brief is sent to the configured AI provider.
                    Uploaded files are attached as lessons but are not analyzed by AI. Do not include confidential information in the brief.
                  </p>
                  <button
                    type="button"
                    onClick={generateCourseDraft}
                    disabled={generatingCourse}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {generatingCourse ? "Generating draft..." : "Generate course draft"}
                  </button>
                </div>
              )}

              <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
                <label className="mb-2 block font-semibold text-slate-200">
                  Upload course content <span className="text-slate-500">(optional)</span>
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-semibold text-slate-200 hover:bg-slate-700">
                    <Upload className="h-4 w-4 text-indigo-400" />
                    {uploadingCourseFiles ? "Uploading..." : "Choose files"}
                    <input
                      type="file"
                      multiple
                      accept="video/*,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.csv,.txt,.rtf,.mp3,.wav,.m4a,.jpg,.jpeg,.png,.gif"
                      onChange={handleCourseFileUpload}
                      disabled={uploadingCourseFiles}
                      className="hidden"
                    />
                  </label>
                  <span className="text-slate-400">
                    Video, PowerPoint, Word, PDF, spreadsheets, audio, images, and text files. Max 100 MB per file; up to 50 files.
                  </span>
                </div>
                {uploadedCourseFiles.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {uploadedCourseFiles.map((file, index) => (
                      <li
                        key={`${file.url}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-lg bg-slate-800 px-3 py-2 text-slate-300"
                      >
                        <span className="truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setUploadedCourseFiles((current) =>
                              current.filter((_, fileIndex) => fileIndex !== index)
                            )
                          }
                          className="shrink-0 text-rose-300 hover:text-rose-200"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label
                  htmlFor="course-written-content"
                  className="mb-2 block font-semibold text-slate-200"
                >
                  Written lesson <span className="text-slate-500">(optional)</span>
                </label>
                <textarea
                  id="course-written-content"
                  rows={5}
                  maxLength={50000}
                  value={courseForm.writtenContent}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, writtenContent: e.target.value })
                  }
                  placeholder="Add written learning content, notes, or an AI-generated lesson..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Add uploaded files or a written lesson. At least one content item is required.
                </p>
              </div>

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
                    <option value="PUBLISHED">Publish course</option>
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
