"use client";

import { cn } from "@/lib/utils";

type WorkOrderStatus = "open" | "new" | "assigned" | "in_progress" | "completed" | "cancelled" | "on_hold";

const STATUS_CLASSES: Record<string, string> = {
  new: "bg-[#2980B9] text-white",
  open: "bg-[#2980B9] text-white",
  assigned: "bg-[#6C5CE7] text-white",
  in_progress: "bg-[#2563EB] text-white",
  completed: "bg-[#27AE60] text-white",
  cancelled: "bg-[#7F8C8D] text-white",
  on_hold: "bg-[#7F8C8D] text-white",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_CLASSES[status] ?? "bg-[#7F8C8D] text-white";
  return (
    <span className={cn("text-xs font-medium px-2 py-1 rounded-full", cls)}>
      {status.replaceAll("_", " ").toUpperCase()}
    </span>
  );
}
