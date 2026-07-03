"use client";

import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { dot: string; label?: string }> = {
  new: { dot: "bg-blue-500", label: "NEW" },
  open: { dot: "bg-blue-500", label: "OPEN" },
  assigned: { dot: "bg-indigo-500", label: "ASSIGNED" },
  in_progress: { dot: "bg-amber-500", label: "IN PROGRESS" },
  completed: { dot: "bg-green-500", label: "COMPLETED" },
  cancelled: { dot: "bg-gray-400", label: "CANCELLED" },
  on_hold: { dot: "bg-gray-400", label: "ON HOLD" },
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { dot: "bg-gray-400" };
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
      <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", style.dot)} />
      {style.label ?? status.replaceAll("_", " ").toUpperCase()}
    </span>
  );
}
