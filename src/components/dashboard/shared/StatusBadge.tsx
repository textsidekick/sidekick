"use client";

import { cn } from "@/lib/utils";

type WorkOrderStatus = "open" | "new" | "assigned" | "in_progress" | "completed" | "cancelled" | "on_hold";

const STATUS_CLASSES: Record<string, string> = {
  new: "bg-amber-100 text-gray-700",
  open: "bg-amber-100 text-gray-700",
  assigned: "bg-blue-100 text-gray-700",
  in_progress: "bg-blue-100 text-gray-700",
  completed: "bg-green-100 text-gray-700",
  cancelled: "bg-slate-100 text-gray-500",
  on_hold: "bg-slate-100 text-gray-600",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_CLASSES[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={cn("text-xs font-medium px-2 py-1 rounded-full", cls)}>
      {status.replaceAll("_", " ").toUpperCase()}
    </span>
  );
}
