"use client";

import { cn } from "@/lib/utils";

const PRIORITY_CLASSES: Record<string, string> = {
  critical: "bg-red-700 text-white",
  high: "bg-orange-600 text-white",
  medium: "bg-yellow-600 text-white",
  low: "bg-green-700 text-white",
};

export function PriorityBadge({ priority }: { priority: string }) {
  const cls = PRIORITY_CLASSES[priority] ?? "bg-gray-500 text-white";
  return (
    <span className={cn("text-xs font-medium px-2 py-1 rounded-full", cls)}>
      {priority.toUpperCase()}
    </span>
  );
}
