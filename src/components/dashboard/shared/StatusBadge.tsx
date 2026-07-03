"use client";

import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-600 text-white",
  open: "bg-blue-600 text-white",
  assigned: "bg-indigo-600 text-white",
  in_progress: "bg-amber-600 text-white",
  completed: "bg-emerald-600 text-white",
  cancelled: "bg-gray-400 text-white",
  on_hold: "bg-gray-500 text-white",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? "bg-gray-500 text-white";
  return (
    <span className={cn("text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-md", cls)}>
      {status.replaceAll("_", " ").toUpperCase()}
    </span>
  );
}
