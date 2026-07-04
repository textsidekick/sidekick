"use client";

import { cn } from "@/lib/utils";

type WorkOrderStatus = "open" | "new" | "assigned" | "in_progress" | "completed" | "cancelled" | "on_hold";

const STATUS_CLASSES: Record<string, string> = {
  new: "bg-gray-100 text-gray-700",
  open: "bg-gray-100 text-gray-700",
  assigned: "bg-gray-100 text-gray-700",
  in_progress: "bg-amber-50 text-amber-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
  on_hold: "bg-gray-100 text-gray-500",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_CLASSES[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded", cls)}>
      {status.replaceAll("_", " ").toUpperCase()}
    </span>
  );
}
