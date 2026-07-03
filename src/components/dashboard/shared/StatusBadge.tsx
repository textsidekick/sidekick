"use client";

import { cn } from "@/lib/utils";

type WorkOrderStatus = "open" | "new" | "assigned" | "in_progress" | "completed" | "cancelled" | "on_hold";

const STATUS_CLASSES: Record<string, string> = {
  new: "bg-blue-600 text-white",
  open: "bg-blue-600 text-white",
  assigned: "bg-purple-600 text-white",
  in_progress: "bg-yellow-600 text-white",
  completed: "bg-green-700 text-white",
  cancelled: "bg-gray-500 text-white",
  on_hold: "bg-gray-500 text-white",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_CLASSES[status] ?? "bg-gray-500 text-white";
  return (
    <span className={cn("text-xs font-medium px-2 py-1 rounded-full", cls)}>
      {status.replaceAll("_", " ").toUpperCase()}
    </span>
  );
}
