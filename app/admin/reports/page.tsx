"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  TrendingUp,
  Users,
  GraduationCap,
  ExternalLink,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";

export default function AdminReportsPage() {
  const [reportRows, setReportRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((res) => res.json())
      .then((data) => {
        setReportRows(data.reportRows || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load analytics");
        setLoading(false);
      });
  }, []);

  const exportCSV = () => {
    if (reportRows.length === 0) {
      toast.error("No report data available to export");
      return;
    }

    const csv = Papa.unparse(reportRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `skillpulse-report-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Report downloaded successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <span>Reports & Completion Analytics</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Track student enrollment volumes, course completions, and export platform data to CSV.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4">Course Title</th>
                <th className="p-4">Delivery Type</th>
                <th className="p-4">Provider</th>
                <th className="p-4">Category</th>
                <th className="p-4">Level</th>
                <th className="p-4">Active Learners</th>
                <th className="p-4">Est. Completion Rate</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Computing report metrics...
                  </td>
                </tr>
              ) : reportRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                reportRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-semibold text-slate-100 max-w-xs truncate">
                      {row.title}
                    </td>
                    <td className="p-4">
                      {row.type === "INTERNAL" ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                          Hosted
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                          External
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">{row.provider}</td>
                    <td className="p-4 text-slate-400">{row.category}</td>
                    <td className="p-4 text-slate-400">{row.level}</td>
                    <td className="p-4 font-bold text-white">{row.enrollments}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-400">{row.completionRate}</span>
                        <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: row.completionRate }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
