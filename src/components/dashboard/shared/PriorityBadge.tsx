"use client";

import { cn } from "@/lib/utils";

const PRIORITY_CLASSES: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-blue-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-900",
  low: "bg-green-100 text-green-800",
};

export function PriorityBadge({ priority }: { priority: string }) {
  const cls = PRIORITY_CLASSES[priority] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={cn("text-xs font-medium px-2 py-1 rounded-full", cls)}>
      {priority.toUpperCase()}
    </span>
  );
}
