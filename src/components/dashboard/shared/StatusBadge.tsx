"use client";

import { cn } from "@/lib/utils";

type WorkOrderStatus = "open" | "new" | "assigned" | "in_progress" | "completed" | "cancelled" | "on_hold";

const STATUS_CLASSES: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  open: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  assigned: "bg-purple-100 text-purple-700 ring-1 ring-purple-200",
  in_progress: "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
  completed: "bg-green-100 text-green-700 ring-1 ring-green-200",
  cancelled: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
  on_hold: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_CLASSES[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={cn("text-xs font-medium px-2 py-1 rounded-full", cls)}>
      {status.replaceAll("_", " ").toUpperCase()}
    </span>
  );
}
