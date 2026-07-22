"use client";

import { cn } from "@/lib/utils";

type WorkOrderStatus = "open" | "new" | "assigned" | "in_progress" | "completed" | "cancelled" | "on_hold";

const STATUS_CLASSES: Record<string, string> = {
  new: "bg-amber-50 text-amber-800 border border-amber-100",
  open: "bg-amber-50 text-amber-800 border border-amber-100",
  assigned: "bg-sky-50 text-sky-800 border border-sky-100",
  in_progress: "bg-blue-50 text-blue-800 border border-blue-100",
  completed: "bg-emerald-50 text-emerald-800 border border-emerald-100",
  cancelled: "bg-slate-100 text-slate-700 border border-slate-200",
  on_hold: "bg-rose-50 text-rose-800 border border-rose-100",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_CLASSES[status] ?? "bg-gray-100 text-gray-800";
  return (
    <span className={cn("text-xs font-medium px-2 py-1 rounded-full", cls)}>
      {status.replaceAll("_", " ").toUpperCase()}
    </span>
  );
}
