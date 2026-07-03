"use client";

import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-amber-600 text-white",
  medium: "bg-yellow-500 text-white",
  low: "bg-gray-500 text-white",
};

export function PriorityBadge({ priority }: { priority: string }) {
  const cls = PRIORITY_STYLES[priority] ?? "bg-gray-500 text-white";
  return (
    <span className={cn("text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-md", cls)}>
      {priority.toUpperCase()}
    </span>
  );
}
