"use client";

import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<string, { dot: string; label?: string }> = {
  critical: { dot: "bg-red-500", label: "CRITICAL" },
  high: { dot: "bg-amber-500", label: "HIGH" },
  medium: { dot: "bg-yellow-400", label: "MEDIUM" },
  low: { dot: "bg-green-500", label: "LOW" },
};

export function PriorityBadge({ priority }: { priority: string }) {
  const style = PRIORITY_STYLES[priority] ?? { dot: "bg-gray-400" };
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
      <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", style.dot)} />
      {style.label ?? priority.toUpperCase()}
    </span>
  );
}
