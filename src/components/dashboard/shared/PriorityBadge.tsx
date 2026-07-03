"use client";

import { cn } from "@/lib/utils";

const PRIORITY_CLASSES: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  medium: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  low: "bg-slate-50 text-slate-500 ring-1 ring-slate-200",
};

export function PriorityBadge({ priority }: { priority: string }) {
  const cls = PRIORITY_CLASSES[priority] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={cn("text-xs font-medium px-2 py-1 rounded-md", cls)}>
      {priority.toUpperCase()}
    </span>
  );
}
