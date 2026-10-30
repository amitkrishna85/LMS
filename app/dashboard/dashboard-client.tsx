"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import {
  BookOpen,
  Route,
  Award,
  User,
  Lock,
  PlayCircle,
  ExternalLink,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { ExternalNoticeModal } from "@/components/public/external-notice-modal";

interface StudentDashboardClientProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function StudentDashboardClient({ user }: StudentDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<
    "courses" | "paths" | "certificates" | "profile"
  >("courses");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // External course modal
  const [selectedExternal, setSelectedExternal] = useState<any | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/dashboard");
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle password change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to update password");
      }

      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Generate and download verified Certificate PDF
  const downloadCertificatePDF = (cert: any) => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Background color & borders
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, 297, 210, "F");

      // Outer gold/indigo border
      doc.setDrawColor(79, 70, 229); // Indigo 600
      doc.setLineWidth(4);
      doc.rect(10, 10, 277, 190);

      doc.setDrawColor(217, 119, 6); // Amber 600
      doc.setLineWidth(1);
      doc.rect(14, 14, 269, 182);

      // Header Institution Branding
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.text("SKILLPULSE ACADEMY", 148.5, 38, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("VERIFIED CERTIFICATE OF ACHIEVEMENT", 148.5, 46, {
        align: "center",
      });

      // Body text
      doc.setFontSize(13);
      doc.setTextColor(51, 65, 85);
      doc.text("This certifies that", 148.5, 68, { align: "center" });

      // Student Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(79, 70, 229);
      doc.text(cert.studentName || user.name || "Student", 148.5, 82, {
        align: "center",
      });

      // Completion details
      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.setTextColor(51, 65, 85);
      doc.text(
        "has successfully demonstrated mastery and completed all required curriculum for",
        148.5,
        96,
        { align: "center" }
      );

      // Course Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      doc.text(`"${cert.courseTitle}"`, 148.5, 112, { align: "center" });

      // Instructor & Institution Signatures
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);

      // Left sign
      doc.line(40, 150, 100, 150);
      doc.text(cert.instructorName || "Lead Instructor", 70, 156, {
        align: "center",
      });
      doc.setFontSize(9);
      doc.text("Authorized Lead Faculty", 70, 161, { align: "center" });

      // Right sign
      doc.setFontSize(11);
      doc.line(197, 150, 257, 150);
      doc.text("Academic Review Board", 227, 156, { align: "center" });
      doc.setFontSize(9);
      doc.text("SkillPulse Accreditation", 227, 161, { align: "center" });

      // Footer Verification Metadata
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Credential ID: ${cert.code || "SP-" + cert.courseId.slice(-6)} • Issued: ${new Date(
          cert.completedAt
        ).toLocaleDateString()}`,
        148.5,
        180,
        { align: "center" }
      );
      doc.text(
        "Verify online at https://skillpulse.io/verify",
        148.5,
        185,
        { align: "center" }
      );

      doc.save(`${cert.courseSlug || "course"}-certificate.pdf`);
      toast.success("Certificate downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF certificate");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Profile Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/40 border border-indigo-400/30 text-white font-extrabold text-2xl flex items-center justify-center shadow-inner">
              {user.name?.charAt(0) || "S"}
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                Student Learning Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                {user.name}
              </h1>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-center">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[90px]">
              <span className="block text-2xl font-black text-sky-400">
                {(data?.enrolledCourses?.length || 0) +
                  (data?.externalCourses?.length || 0)}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Courses
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[90px]">
              <span className="block text-2xl font-black text-purple-400">
                {data?.enrolledPaths?.length || 0}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Paths
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[90px]">
              <span className="block text-2xl font-black text-amber-400">
                {data?.certificates?.length || 0}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Certs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("courses")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "courses"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Enrolled Courses</span>
        </button>

        <button
          onClick={() => setActiveTab("paths")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "paths"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Route className="w-4 h-4" />
          <span>My Learning Paths</span>
        </button>

        <button
          onClick={() => setActiveTab("certificates")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "certificates"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certificates & Credentials</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "profile"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Profile & Security</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading student progress...</p>
        </div>
      ) : (
        <div>
          {/* TAB 1: MY COURSES */}
          {activeTab === "courses" && (
            <div className="space-y-8">
              {/* Internal Courses Enrolled */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Internal Masterclasses (Hosted on Platform)
                  </h2>
                  <Link
                    href="/courses?type=INTERNAL"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Browse Internal Courses →
                  </Link>
                </div>

                {data?.enrolledCourses && data.enrolledCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.enrolledCourses.map((c: any) => (
                      <div
                        key={c.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-semibold text-indigo-600 uppercase">
                              {c.categoryName}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                c.progressPercent === 100
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-indigo-100 text-indigo-800"
                              }`}
                            >
                              {c.progressPercent === 100
                                ? "Completed"
                                : "In Progress"}
                            </span>
                          </div>

                          <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                            {c.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            Instructor: {c.instructorName}
                          </p>

                          {/* Progress Bar */}
                          <div className="mt-4 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>
                                {c.completedCount} of {c.totalLessons} Lessons
                              </span>
                              <span className="font-bold text-slate-900">
                                {c.progressPercent}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                style={{ width: `${c.progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                          <Link
                            href={`/learn/${c.slug}`}
                            className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm transition"
                          >
                            <PlayCircle className="w-4 h-4" />
                            <span>
                              {c.progressPercent === 100
                                ? "Review Lessons"
                                : "Resume Course"}
                            </span>
                          </Link>

                          {c.progressPercent === 100 && (
                            <button
                              type="button"
                              onClick={() =>
                                downloadCertificatePDF({
                                  courseId: c.courseId,
                                  courseTitle: c.title,
                                  courseSlug: c.slug,
                                  studentName: user.name,
                                  instructorName: c.instructorName,
                                  completedAt: c.completedAt,
                                  code: `SP-${c.courseId.slice(-4).toUpperCase()}`,
                                })
                              }
                              title="Download Verified Certificate PDF"
                              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition"
                            >
                              <Award className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-xs">
                    You have not enrolled in any internal courses yet.
                  </div>
                )}
              </div>

              {/* External Courses Self-Reported */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    External Accredited Courses (Udemy, Coursera, etc.)
                  </h2>
                  <Link
                    href="/courses?type=EXTERNAL"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Explore External Directory →
                  </Link>
                </div>

                {data?.externalCourses && data.externalCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.externalCourses.map((c: any) => (
                      <div
                        key={c.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-semibold text-blue-600 uppercase">
                              {c.externalProvider || "Partner"}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                c.status === "COMPLETED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {c.status.replace("_", " ")}
                            </span>
                          </div>

                          <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                            {c.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            Instructor: {c.instructorName}
                          </p>

                          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                            <span>Status: </span>
                            <strong className="text-slate-900">
                              {c.status.replace("_", " ")}
                            </strong>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Self-reported progress
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setSelectedExternal(c)}
                            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                          >
                            <span>Open on {c.externalProvider || "Partner"}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-xs">
                    No external courses tracked yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY LEARNING PATHS */}
          {activeTab === "paths" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">
                  Enrolled Learning Roadmaps
                </h2>
                <Link
                  href="/paths"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Browse All Paths →
                </Link>
              </div>

              {data?.enrolledPaths && data.enrolledPaths.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.enrolledPaths.map((p: any) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-bold text-indigo-600 uppercase">
                            Level: {p.level}
                          </span>
                          <span className="text-slate-400">
                            ~{p.estimatedHours} hrs total
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-base">
                          {p.title}
                        </h3>

                        {/* Progress */}
                        <div className="mt-4 space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-slate-600">
                            <span>
                              {p.completedCourses} of {p.totalCourses} Courses Completed
                            </span>
                            <span className="font-bold text-indigo-600">
                              {p.progressPercent}%
                            </span>
                          </div>
                          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full transition-all duration-500"
                              style={{ width: `${p.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <Link
                          href={`/paths/${p.slug}`}
                          className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                        >
                          <span>Resume Roadmap</span>
                          <Route className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
                  <Route className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs text-slate-500">
                    You have not enrolled in any learning paths yet.
                  </p>
                  <Link
                    href="/paths"
                    className="mt-3 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Explore Paths
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CERTIFICATES */}
          {activeTab === "certificates" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">
                  Earned Certificates of Completion
                </h2>
                <span className="text-xs text-slate-500">
                  {data?.certificates?.length || 0} Credentials Earned
                </span>
              </div>

              {data?.certificates && data.certificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.certificates.map((cert: any) => (
                    <div
                      key={cert.id}
                      className="bg-white rounded-2xl border-2 border-indigo-100 p-6 shadow-sm hover:shadow-lg transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-bl-full pointer-events-none" />

                      <div className="flex items-start justify-between gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center flex-shrink-0">
                          <Award className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Verified Credential
                        </span>
                      </div>

                      <div className="mt-4">
                        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                          Certificate of Achievement
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-base mt-1">
                          {cert.courseTitle}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Instructor: {cert.instructorName}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-2">
                          Credential Code:{" "}
                          <span className="font-mono font-bold text-slate-700">
                            {cert.code}
                          </span>
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          Completed:{" "}
                          {new Date(cert.completedAt).toLocaleDateString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => downloadCertificatePDF(cert)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
                  <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs text-slate-500">
                    No certificates earned yet. Complete 100% of the lessons in an
                    internal masterclass to unlock your verified credential.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE & SECURITY */}
          {activeTab === "profile" && (
            <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Account Details & Security
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage your credentials and password security settings.
                </p>
              </div>

              {/* Readonly info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400">Full Name</span>
                  <p className="font-bold text-slate-900 mt-0.5">{user.name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Email Address</span>
                  <p className="font-bold text-slate-900 mt-0.5">{user.email}</p>
                </div>
                <div>
                  <span className="text-slate-400">System Role</span>
                  <p className="font-bold text-indigo-600 mt-0.5">{user.role}</p>
                </div>
                <div>
                  <span className="text-slate-400">Registration Mode</span>
                  <p className="font-bold text-slate-700 mt-0.5">
                    Admin Provisioned
                  </p>
                </div>
              </div>

              {/* Password Change Form */}
              <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">
                  Change Password
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                      placeholder="Minimum 8 characters"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* External Notice Modal if clicked from dashboard */}
      {selectedExternal && (
        <ExternalNoticeModal
          isOpen={!!selectedExternal}
          onClose={() => setSelectedExternal(null)}
          course={{
            id: selectedExternal.courseId,
            title: selectedExternal.title,
            slug: selectedExternal.slug,
            externalUrl: selectedExternal.externalUrl,
            externalProvider: selectedExternal.externalProvider || "Partner",
          }}
          currentStatus={selectedExternal.status}
          onMarkStatus={async (newStatus) => {
            await fetch(`/api/courses/${selectedExternal.slug}/progress`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: newStatus }),
            });
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
}
