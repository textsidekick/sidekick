"use client";

import { cn } from "@/lib/utils";

const PRIORITY_CLASSES: Record<string, string> = {
  critical: "bg-[#C0392B] text-white",
  high: "bg-[#D4781C] text-white",
  medium: "bg-[#2E86AB] text-white",
  low: "bg-[#7F8C8D] text-white",
};

export function PriorityBadge({ priority }: { priority: string }) {
  const cls = PRIORITY_CLASSES[priority] ?? "bg-[#7F8C8D] text-white";
  return (
    <span className={cn("text-xs font-medium px-2 py-1 rounded-full", cls)}>
      {priority.toUpperCase()}
    </span>
  );
}
