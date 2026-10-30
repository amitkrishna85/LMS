"use client";

import React, { useState, useEffect } from "react";
import {
  FolderTree,
  PlusCircle,
  Tag,
  BookOpen,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newParentId, setNewParentId] = useState<string>("");

  const loadCategories = () => {
    setLoading(true);
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load categories");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          parentId: newParentId || null,
        }),
      });

      if (res.ok) {
        toast.success("Category created successfully");
        setNewCategoryName("");
        setNewParentId("");
        loadCategories();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to create category");
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
            <FolderTree className="w-6 h-6 text-indigo-400" />
            <span>Categories & Taxonomies</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Organize catalog courses and roadmaps into logical, hierarchical topic disciplines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Create Form (1 col) */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 self-start">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-indigo-400" />
            <span>Create Category</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Data Engineering"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Parent Category (Optional Nesting)
              </label>
              <select
                value={newParentId}
                onChange={(e) => setNewParentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">None (Top-Level Category)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              Add Category
            </button>
          </form>
        </div>

        {/* Right: Categories Table (2 cols) */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-400" />
              <span>Available Catalog Categories</span>
            </h3>
            <span className="text-xs text-slate-400">
              {categories.length} total categories
            </span>
          </div>

          <div className="divide-y divide-slate-800">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No categories created yet.
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800 text-indigo-300 flex items-center justify-center font-bold">
                      {cat.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100 flex items-center gap-2">
                        <span>{cat.name}</span>
                        {cat.parent && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <ChevronRight className="w-3 h-3" />
                            <span>sub-discipline of {cat.parent.name}</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        slug: /{cat.slug}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span>{cat._count?.courses || 0} courses</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
