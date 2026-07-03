"use client";

import { X, AlertTriangle, CheckCircle2, CircleDot } from "lucide-react";

function formatTimeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

interface Issue {
  id: string; company_id: string; worker_phone: string; worker_name?: string;
  description: string; equipment?: string; severity: "low" | "medium" | "high";
  status: "open" | "resolved"; created_at: string; resolved_at?: string; resolved_by?: string; notes?: string;
}

interface Props {
  issue: Issue | null;
  onClose: () => void;
  onUpdate: (issueId: string, updates: { status?: string; notes?: string; resolved_by?: string }) => void;
  companyName?: string;
}

export function IssueDetailModal({ issue, onClose, onUpdate, companyName }: Props) {
  if (!issue) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${issue.severity === "high" ? "bg-red-100" : issue.severity === "medium" ? "bg-amber-100" : "bg-green-100"}`}>
              <AlertTriangle className={`w-5 h-5 ${issue.severity === "high" ? "text-red-600" : issue.severity === "medium" ? "text-amber-600" : "text-green-600"}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Issue #{issue.id.slice(0, 8).toUpperCase()}</h3>
              <p className="text-sm text-gray-500">{formatTimeAgo(issue.created_at)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div><label className="text-xs font-medium text-gray-500">Reported By</label><p className="text-gray-900">{issue.worker_name || "Unknown Worker"}</p></div>
          {issue.equipment && <div><label className="text-xs font-medium text-gray-500">Equipment</label><p className="text-gray-900">{issue.equipment}</p></div>}
          <div><label className="text-xs font-medium text-gray-500">Description</label><p className="text-gray-900">{issue.description}</p></div>
          <div className="flex gap-4">
            <div><label className="text-xs font-medium text-gray-500">Severity</label><p className={`capitalize font-medium ${issue.severity === "high" ? "text-red-600" : issue.severity === "medium" ? "text-amber-600" : "text-green-600"}`}>{issue.severity}</p></div>
            <div><label className="text-xs font-medium text-gray-500">Status</label><p className={`capitalize font-medium ${issue.status === "open" ? "text-amber-600" : "text-green-600"}`}>{issue.status}</p></div>
          </div>
          {issue.resolved_at && (
            <div><label className="text-xs font-medium text-gray-500">Resolved</label><p className="text-gray-700">{formatTimeAgo(issue.resolved_at)} {issue.resolved_by && `by ${issue.resolved_by}`}</p></div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100">
          {issue.status === "open" ? (
            <button onClick={() => onUpdate(issue.id, { status: "resolved", resolved_by: companyName })} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-gray-900 rounded-lg font-medium hover:bg-green-700">
              <CheckCircle2 className="w-4 h-4" /> Mark Resolved
            </button>
          ) : (
            <button onClick={() => onUpdate(issue.id, { status: "open" })} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-gray-900 rounded-lg font-medium hover:bg-amber-700">
              <CircleDot className="w-4 h-4" /> Reopen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
