"use client";

import { useState } from "react";
import { ExternalLink, X, ShieldAlert, CheckCircle2, PlayCircle } from "lucide-react";

interface ExternalNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    slug: string;
    externalUrl: string;
    externalProvider?: string;
  };
  onMarkStatus?: (status: "IN_PROGRESS" | "COMPLETED") => Promise<void>;
  currentStatus?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

export function ExternalNoticeModal({
  isOpen,
  onClose,
  course,
  onMarkStatus,
  currentStatus = "NOT_STARTED",
}: ExternalNoticeModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const provider = course.externalProvider || "External Site";

  if (!isOpen) return null;

  const handleOpenCourse = async () => {
    // 1. Trigger outbound click analytics / logging
    try {
      fetch(`/api/courses/${course.slug}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "OUTBOUND_CLICK", status: "IN_PROGRESS" }),
      }).catch(() => {});
    } catch (e) {}

    // 2. Open external URL in a new tab with noopener noreferrer
    window.open(course.externalUrl, "_blank", "noopener,noreferrer");
  };

  const handleStatusChange = async (newStatus: "IN_PROGRESS" | "COMPLETED") => {
    if (onMarkStatus) {
      setIsUpdating(true);
      await onMarkStatus(newStatus);
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
            <ExternalLink className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold leading-snug">
            Leaving to {provider}
          </h3>
          <p className="text-xs text-blue-100 mt-1">
            External Curriculum Partner
          </p>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4">
          <div className="text-sm text-slate-700 space-y-2">
            <p className="font-semibold text-slate-900 line-clamp-2">
              {course.title}
            </p>
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Notice:</strong> You will continue learning on{" "}
                <span className="font-semibold">{provider}</span> in a new tab.
                Sign in or register there using your {provider} account.
              </div>
            </div>
          </div>

          {/* Outbound Launch Button */}
          <button
            onClick={handleOpenCourse}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <span>Go to Course on {provider}</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Self reporting tracker */}
          <div className="border-t border-slate-100 pt-4 mt-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Track Your Progress on SkillPulse
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStatusChange("IN_PROGRESS")}
                className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                  currentStatus === "IN_PROGRESS"
                    ? "bg-blue-50 border-blue-400 text-blue-700"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Mark In Progress</span>
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStatusChange("COMPLETED")}
                className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                  currentStatus === "COMPLETED"
                    ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Completed</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
