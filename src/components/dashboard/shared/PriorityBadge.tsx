"use client";

import { cn } from "@/lib/utils";

const PRIORITY_CLASSES: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border border-red-200",
  high: "bg-amber-50 text-amber-700",
  medium: "bg-gray-100 text-gray-700",
  low: "bg-gray-50 text-gray-500",
};

export function PriorityBadge({ priority }: { priority: string }) {
  const cls = PRIORITY_CLASSES[priority] ?? "bg-slate-100 text-gray-600";
  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded", cls)}>
      {priority.toUpperCase()}
    </span>
  );
}
