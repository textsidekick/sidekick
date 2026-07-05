"use client";

import { cn } from "@/lib/utils";

const PRIORITY_CLASSES: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-slate-100 text-slate-600",
};

export function PriorityBadge({ priority }: { priority: string }) {
  const cls = PRIORITY_CLASSES[priority] ?? "bg-slate-100 text-gray-600";
  return (
    <span className={cn("text-xs font-medium px-2 py-1 rounded-md", cls)}>
      {priority.toUpperCase()}
    </span>
  );
}
