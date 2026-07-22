"use client";

import { cn } from "@/lib/utils";

type WorkOrderStatus = "open" | "new" | "assigned" | "in_progress" | "completed" | "cancelled" | "on_hold";

const STATUS_CLASSES: Record<string, string> = {
  new: "bg-white text-slate-700 border border-slate-200",
  open: "bg-white text-slate-700 border border-slate-200",
  assigned: "bg-white text-slate-700 border border-slate-200",
  in_progress: "bg-white text-slate-700 border border-slate-200",
  completed: "bg-white text-slate-700 border border-slate-200",
  cancelled: "bg-slate-100 text-slate-600 border border-slate-200",
  on_hold: "bg-white text-slate-700 border border-slate-200",
};

const STATUS_DOT_CLASSES: Record<string, string> = {
  new: "bg-amber-500",
  open: "bg-amber-500",
  assigned: "bg-sky-500",
  in_progress: "bg-blue-500",
  completed: "bg-emerald-500",
  cancelled: "bg-slate-400",
  on_hold: "bg-rose-500",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_CLASSES[status] ?? "bg-gray-100 text-gray-800";
  const dotCls = STATUS_DOT_CLASSES[status] ?? "bg-slate-400";
  return (
    <span className={cn("inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-md", cls)}>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotCls)} />
      {status.replaceAll("_", " ").toUpperCase()}
    </span>
  );
}
