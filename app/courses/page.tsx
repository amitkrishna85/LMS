import Link from "next/link";
import { prisma, safeDbQuery } from "@/lib/prisma";
import { getMockCourses, MOCK_CATEGORIES } from "@/lib/mock-data";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { CourseCard } from "@/components/public/course-card";
import {
  Search,
  Filter,
  SlidersHorizontal,
  BookOpen,
  CheckCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface CoursesPageProps {
  searchParams: {
    q?: string;
    category?: string;
    type?: string;
    level?: string;
    sort?: string;
    page?: string;
  };
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const query = searchParams.q?.toLowerCase().trim() || "";
  const selectedCategory = searchParams.category || "";
  const selectedType = searchParams.type || "";
  const selectedLevel = searchParams.level || "";
  const selectedSort = searchParams.sort || "newest";
  const currentPage = parseInt(searchParams.page || "1", 10) || 1;
  const pageSize = 9;

  // 1. Fetch categories
  const categories = await safeDbQuery(
    () => prisma.category.findMany({ orderBy: { name: "asc" } }),
    MOCK_CATEGORIES
  );

  // 2. Fetch all published courses with category
  const allCourses = await safeDbQuery(
    () =>
      prisma.course.findMany({
        where: { status: "PUBLISHED" },
        include: { category: true },
        orderBy: { createdAt: "desc" },
      }),
    getMockCourses().filter((c: any) => c.status === "PUBLISHED")
  );

  // 3. Filter in memory (works uniformly across live database and mock fallback)
  let filtered = allCourses.filter((course: any) => {
    // Search query match
    if (query) {
      const matchTitle = course.title?.toLowerCase().includes(query);
      const matchDesc = course.shortDescription?.toLowerCase().includes(query);
      const matchInstructor = course.instructorName?.toLowerCase().includes(query);
      const matchTags = Array.isArray(course.tags)
        ? course.tags.some((t: string) => t.toLowerCase().includes(query))
        : false;
      if (!matchTitle && !matchDesc && !matchInstructor && !matchTags) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory && course.categoryId !== selectedCategory) {
      return false;
    }

    // Type filter (INTERNAL or EXTERNAL)
    if (selectedType && course.type !== selectedType) {
      return false;
    }

    // Level filter (BEGINNER, INTERMEDIATE, ADVANCED)
    if (selectedLevel && course.level !== selectedLevel) {
      return false;
    }

    return true;
  });

  // 4. Sort
  if (selectedSort === "popular") {
    filtered.sort((a: any, b: any) => (b.sortOrder || 0) - (a.sortOrder || 0));
  } else if (selectedSort === "duration-asc") {
    filtered.sort((a: any, b: any) => a.durationMinutes - b.durationMinutes);
  } else if (selectedSort === "duration-desc") {
    filtered.sort((a: any, b: any) => b.durationMinutes - a.durationMinutes);
  } else {
    // Newest
    filtered.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // 5. Pagination
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginatedCourses = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Helper to construct filter URL
  const makeFilterUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (query && overrides.q === undefined) params.set("q", query);
    if (selectedCategory && overrides.category === undefined)
      params.set("category", selectedCategory);
    if (selectedType && overrides.type === undefined)
      params.set("type", selectedType);
    if (selectedLevel && overrides.level === undefined)
      params.set("level", selectedLevel);
    if (selectedSort && overrides.sort === undefined)
      params.set("sort", selectedSort);

    Object.entries(overrides).forEach(([key, val]) => {
      if (val !== undefined && val !== "") {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    const str = params.toString();
    return `/courses${str ? `?${str}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <PublicNavbar />

      {/* Hero header */}
      <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 block">
              Curated Course Directory
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Explore Masterclasses & External Certifications
            </h1>
            <p className="mt-3 text-sm text-slate-300">
              Browse our full catalog of hands-on internal workshops and
              authorized external credentials from Udemy, Coursera, and more.
            </p>
          </div>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Search & Active Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8">
          <form
            action="/courses"
            method="GET"
            className="flex flex-col md:flex-row gap-3 items-center"
          >
            {/* Retain other query params */}
            {selectedCategory && (
              <input type="hidden" name="category" value={selectedCategory} />
            )}
            {selectedType && (
              <input type="hidden" name="type" value={selectedType} />
            )}
            {selectedLevel && (
              <input type="hidden" name="level" value={selectedLevel} />
            )}

            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search by title, instructor, tag, or topic..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                name="sort"
                defaultValue={selectedSort}
                className="py-2.5 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="popular">Sort: Most Popular</option>
                <option value="duration-asc">Duration: Shortest First</option>
                <option value="duration-desc">Duration: Longest First</option>
              </select>

              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-xs flex-shrink-0"
              >
                Apply
              </button>
            </div>
          </form>

          {/* Type fast-toggles */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Format:
              </span>
              <Link
                href={makeFilterUrl({ type: undefined, page: "1" })}
                className={`px-3 py-1 rounded-full font-medium transition ${
                  !selectedType
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Formats ({allCourses.length})
              </Link>
              <Link
                href={makeFilterUrl({ type: "INTERNAL", page: "1" })}
                className={`px-3 py-1 rounded-full font-medium transition flex items-center gap-1 ${
                  selectedType === "INTERNAL"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <CheckCircle className="w-3 h-3" />
                On Platform
              </Link>
              <Link
                href={makeFilterUrl({ type: "EXTERNAL", page: "1" })}
                className={`px-3 py-1 rounded-full font-medium transition flex items-center gap-1 ${
                  selectedType === "EXTERNAL"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                <ExternalLink className="w-3 h-3" />
                External (Udemy, etc.)
              </Link>
            </div>

            {/* Level filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-500 mr-1">Level:</span>
              {["", "BEGINNER", "INTERMEDIATE", "ADVANCED"].map((lvl) => (
                <Link
                  key={lvl}
                  href={makeFilterUrl({
                    level: lvl || undefined,
                    page: "1",
                  })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    selectedLevel === lvl
                      ? "bg-indigo-100 text-indigo-700 font-bold"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {lvl ? lvl.charAt(0) + lvl.slice(1).toLowerCase() : "All Levels"}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Catalog Grid with Category Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Filter Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                Filter by Category
              </h3>

              <div className="space-y-1">
                <Link
                  href={makeFilterUrl({ category: undefined, page: "1" })}
                  className={`block px-3 py-2 rounded-xl text-xs font-medium transition ${
                    !selectedCategory
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  All Categories
                </Link>

                {categories.map((cat: any) => {
                  const count = allCourses.filter(
                    (c: any) => c.categoryId === cat.id
                  ).length;
                  return (
                    <Link
                      key={cat.id}
                      href={makeFilterUrl({ category: cat.id, page: "1" })}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                        selectedCategory === cat.id
                          ? "bg-indigo-50 text-indigo-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-normal">
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Reset all filters pill */}
            {(query || selectedCategory || selectedType || selectedLevel) && (
              <Link
                href="/courses"
                className="block text-center py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
              >
                Clear All Filters
              </Link>
            )}
          </div>

          {/* Courses Listing */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
              <p>
                Showing{" "}
                <strong className="text-slate-900">{filtered.length}</strong>{" "}
                results
                {query && (
                  <span>
                    {" "}
                    for &ldquo;<strong className="text-slate-900">{query}</strong>&rdquo;
                  </span>
                )}
              </p>
            </div>

            {paginatedCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedCourses.map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">
                  No courses found
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search criteria, clearing selected filters,
                  or exploring our curated learning paths.
                </p>
                <Link
                  href="/courses"
                  className="mt-4 inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  View All Courses
                </Link>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {currentPage > 1 ? (
                  <Link
                    href={makeFilterUrl({
                      page: (currentPage - 1).toString(),
                    })}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs flex items-center gap-1 font-medium transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Link>
                ) : (
                  <span className="p-2 rounded-xl bg-slate-100 text-slate-400 text-xs flex items-center gap-1 font-medium cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </span>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === currentPage;
                    return (
                      <Link
                        key={pageNum}
                        href={makeFilterUrl({ page: pageNum.toString() })}
                        className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>

                {currentPage < totalPages ? (
                  <Link
                    href={makeFilterUrl({
                      page: (currentPage + 1).toString(),
                    })}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs flex items-center gap-1 font-medium transition"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="p-2 rounded-xl bg-slate-100 text-slate-400 text-xs flex items-center gap-1 font-medium cursor-not-allowed">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
