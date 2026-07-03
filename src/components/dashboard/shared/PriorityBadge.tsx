"use client";

import { cn } from "@/lib/utils";

const PRIORITY_CLASSES: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-amber-100 text-gray-700",
  medium: "bg-slate-100 text-gray-700",
  low: "bg-slate-50 text-gray-500",
};

export function PriorityBadge({ priority }: { priority: string }) {
  const cls = PRIORITY_CLASSES[priority] ?? "bg-slate-100 text-gray-600";
  return (
    <span className={cn("text-xs font-medium px-2 py-1 rounded-md", cls)}>
      {priority.toUpperCase()}
    </span>
  );
}
