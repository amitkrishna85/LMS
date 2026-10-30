"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  UserPlus,
  FileSpreadsheet,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Trash2,
  Edit,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Selection for bulk enrollment
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showResetResultModal, setShowResetResultModal] = useState<any>(null);

  // Form states
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "STUDENT",
    temporaryPassword: "",
    mustChangePassword: true,
  });

  const [csvText, setCsvText] = useState(
    `name,email,role\nAlice Morgan,alice@skillpulse.local,STUDENT\nBob Davis,bob@skillpulse.local,STUDENT\nClaire Wright,claire@skillpulse.local,ADMIN`
  );

  const [enrollTarget, setEnrollTarget] = useState({
    targetType: "COURSE",
    targetId: "crs_int_1",
  });

  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [pathsList, setPathsList] = useState<any[]>([]);

  // Fetch users list
  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "10",
      search,
      role: roleFilter,
      status: statusFilter,
    });

    fetch(`/api/admin/users?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
        setPagination(data.pagination || { total: 0, totalPages: 1 });
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load users");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  // Handle Search Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load available courses and paths for enrollment modal
  useEffect(() => {
    fetch("/api/courses?limit=100")
      .then((res) => res.json())
      .then((d) => setCoursesList(d.courses || []))
      .catch(() => {});

    fetch("/api/paths?limit=100")
      .then((res) => res.json())
      .then((d) => setPathsList(d.paths || []))
      .catch(() => {});
  }, []);

  // Add single user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create user");
      } else {
        toast.success(`User ${data.user.name} created!`);
        setShowAddModal(false);
        setShowResetResultModal({
          title: "New User Credentials",
          email: data.user.email,
          tempPassword: data.temporaryPassword,
        });
        setNewUser({
          name: "",
          email: "",
          role: "STUDENT",
          temporaryPassword: "",
          mustChangePassword: true,
        });
        fetchUsers();
      }
    } catch {
      toast.error("Network error while creating user");
    }
  };

  // Bulk CSV Import
  const handleBulkImport = async () => {
    try {
      const res = await fetch("/api/admin/users/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvData: csvText }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Import failed");
      } else {
        toast.success(
          `Imported ${data.createdCount} user(s). Skipped: ${data.skippedCount}`
        );
        setShowImportModal(false);
        fetchUsers();
      }
    } catch {
      toast.error("Import request failed");
    }
  };

  // Toggle active status
  const toggleUserStatus = async (user: any) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (res.ok) {
        toast.success(
          `User ${user.name} has been ${user.isActive ? "deactivated" : "reactivated"}`
        );
        fetchUsers();
      } else {
        toast.error("Failed to update user status");
      }
    } catch {
      toast.error("Network error");
    }
  };

  // Reset Password
  const handleResetPassword = async (user: any) => {
    if (!confirm(`Reset credentials for ${user.name}? This will generate a temporary password.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setShowResetResultModal({
          title: "Credentials Reset Successfully",
          email: user.email,
          tempPassword: data.temporaryPassword,
          resetLink: data.resetLink,
        });
        toast.success("Password reset instructions generated");
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to reset password");
      }
    } catch {
      toast.error("Error sending reset request");
    }
  };

  // Delete User
  const handleDeleteUser = async (user: any) => {
    if (!confirm(`Permanently delete account for ${user.name}? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("User deleted");
        fetchUsers();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to delete user");
      }
    } catch {
      toast.error("Network error");
    }
  };

  // Bulk Enroll Action
  const handleBulkEnroll = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("No users selected");
      return;
    }
    try {
      const res = await fetch("/api/admin/users/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: selectedUserIds,
          targetType: enrollTarget.targetType,
          targetId: enrollTarget.targetId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Enrolled successfully");
        setShowEnrollModal(false);
        setSelectedUserIds([]);
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to enroll users");
      }
    } catch {
      toast.error("Enrollment network error");
    }
  };

  // Select all toggle
  const toggleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map((u) => u.id));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>User Accounts & Access</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Admin-managed student provisioning, role management, and bulk batch assignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Single User</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Bulk CSV Import</span>
          </button>
          {selectedUserIds.length > 0 && (
            <button
              onClick={() => setShowEnrollModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Enroll Selected ({selectedUserIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admins Only</option>
            <option value="STUDENT">Students Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedUserIds.length === users.length}
                    onChange={toggleSelectAll}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Password Policy</th>
                <th className="p-4">Enrollments</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading user directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No users match your criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelected = selectedUserIds.includes(u.id);
                  return (
                    <tr
                      key={u.id}
                      className={isSelected ? "bg-indigo-950/20" : "hover:bg-slate-800/40 transition"}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setSelectedUserIds(selectedUserIds.filter((id) => id !== u.id));
                            } else {
                              setSelectedUserIds([...selectedUserIds, u.id]);
                            }
                          }}
                          className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100">{u.name}</div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {u.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            <span>Student</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400">
                            <UserX className="w-3.5 h-3.5" />
                            <span>Deactivated</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {u.mustChangePassword ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                            <AlertCircle className="w-3 h-3" />
                            <span>Password Change Required</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">Established</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-300">
                        {u._count?.enrollments || 0} courses
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleResetPassword(u)}
                            title="Reset Password & Token"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition cursor-pointer"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(u)}
                            title={u.isActive ? "Deactivate User" : "Reactivate User"}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                          >
                            {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4 text-emerald-400" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            title="Delete User"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {users.length} of {pagination.total} registered users
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

      {/* MODAL 1: ADD SINGLE USER */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Create User Account</h3>
            <p className="text-xs text-slate-400 mb-4">
              Provision a new account. Students receive login credentials and must change password on first login.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Maya Lin"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="maya@organization.com"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="STUDENT">STUDENT (Standard Learner)</option>
                  <option value="ADMIN">ADMIN (Full Console Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Temporary Password (Optional)
                </label>
                <input
                  type="text"
                  value={newUser.temporaryPassword}
                  onChange={(e) => setNewUser({ ...newUser, temporaryPassword: e.target.value })}
                  placeholder="Leave blank to auto-generate"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
                <span className="text-[11px] text-slate-500 block mt-1">
                  Auto-generated secure password will be provided if empty.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="forceChange"
                  checked={newUser.mustChangePassword}
                  onChange={(e) => setNewUser({ ...newUser, mustChangePassword: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="forceChange" className="text-xs text-slate-300 cursor-pointer">
                  Require password change on first sign-in
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK CSV IMPORT */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Bulk CSV User Import</h3>
            <p className="text-xs text-slate-400 mb-3">
              Paste CSV text containing <code className="text-indigo-300">name,email,role</code>. Each student will receive an auto-generated temporary password and be prompted to change it on login.
            </p>

            <div className="space-y-4">
              <div>
                <textarea
                  rows={7}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Header must be: name,email,role</span>
                <button
                  type="button"
                  onClick={() =>
                    setCsvText(
                      `name,email,role\nSarah Connor,sarah@domain.com,STUDENT\nJohn Connor,john@domain.com,STUDENT`
                    )
                  }
                  className="text-indigo-400 hover:underline"
                >
                  Reset sample
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkImport}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/20"
                >
                  Run Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: BULK ENROLL */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Bulk Enroll Students</h3>
            <p className="text-xs text-slate-400 mb-4">
              Assign {selectedUserIds.length} selected student(s) to a course or learning path.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assignment Target Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEnrollTarget({
                        targetType: "COURSE",
                        targetId: coursesList[0]?.id || "crs_int_1",
                      })
                    }
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                      enrollTarget.targetType === "COURSE"
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    Course
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEnrollTarget({
                        targetType: "PATH",
                        targetId: pathsList[0]?.id || "path_1",
                      })
                    }
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                      enrollTarget.targetType === "PATH"
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    Learning Path
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select {enrollTarget.targetType === "COURSE" ? "Course" : "Learning Path"}
                </label>
                <select
                  value={enrollTarget.targetId}
                  onChange={(e) => setEnrollTarget({ ...enrollTarget, targetId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {enrollTarget.targetType === "COURSE" ? (
                    coursesList.length > 0 ? (
                      coursesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.type})
                        </option>
                      ))
                    ) : (
                      <option value="crs_int_1">Full-Stack TypeScript Masterclass</option>
                    )
                  ) : pathsList.length > 0 ? (
                    pathsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))
                  ) : (
                    <option value="path_1">Full-Stack Cloud Developer Career Path</option>
                  )}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkEnroll}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition shadow-lg shadow-amber-600/30"
                >
                  Confirm Enrollment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CREDENTIALS / RESET RESULT MODAL */}
      {showResetResultModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {showResetResultModal.title}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Credentials generated for <span className="text-slate-200 font-semibold">{showResetResultModal.email}</span>. Please copy or share these credentials securely.
            </p>

            <div className="space-y-3 p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Temporary Password:</span>
                <div className="flex items-center gap-1.5 font-mono text-amber-300 font-bold">
                  <span>{showResetResultModal.tempPassword}</span>
                  <button
                    onClick={() => copyToClipboard(showResetResultModal.tempPassword)}
                    className="p-1 hover:text-white text-slate-400 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {showResetResultModal.resetLink && (
                <div className="pt-2 border-t border-slate-700">
                  <span className="text-slate-400 block mb-1">Direct One-Time Reset Link:</span>
                  <div className="flex items-center justify-between gap-2 p-2 bg-slate-900 rounded-lg">
                    <span className="truncate text-indigo-400 text-[11px] font-mono">
                      {showResetResultModal.resetLink}
                    </span>
                    <button
                      onClick={() => copyToClipboard(showResetResultModal.resetLink)}
                      className="p-1 text-slate-400 hover:text-white shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 text-right">
              <button
                type="button"
                onClick={() => setShowResetResultModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
