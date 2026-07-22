"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type PriorityLabels = Record<string, string>;

type SettingsResponse = {
  priorities?: Array<{ name?: string; display_label?: string }>;
};

const PRIORITY_CLASSES: Record<string, string> = {
  critical: "bg-red-600 text-white border border-red-600",
  high: "bg-white text-slate-700 border border-slate-200",
  medium: "bg-white text-slate-700 border border-slate-200",
  low: "bg-slate-100 text-slate-700 border border-slate-200",
};

const PRIORITY_DOT_CLASSES: Record<string, string> = {
  critical: "bg-white/80",
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-slate-400",
};

const DEFAULT_PRIORITY_LABELS: PriorityLabels = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
};

let cachedPriorityLabels: PriorityLabels | null = null;
let pendingPriorityLabels: Promise<PriorityLabels> | null = null;

function fallbackLabel(priority: string): string {
  const normalized = priority.toLowerCase();
  return DEFAULT_PRIORITY_LABELS[normalized] || priority.toUpperCase();
}

function loadPriorityLabelsFromLocalStorage(): PriorityLabels | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("sidekick_priority_labels");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, string>;
    const labels: PriorityLabels = { ...DEFAULT_PRIORITY_LABELS };
    for (const [key, value] of Object.entries(parsed || {})) {
      if (typeof value === "string" && value.trim()) labels[key.toLowerCase()] = value.trim().toUpperCase();
    }
    return labels;
  } catch {
    return null;
  }
}

async function loadPriorityLabels(): Promise<PriorityLabels> {
  const localLabels = loadPriorityLabelsFromLocalStorage();
  if (localLabels) {
    cachedPriorityLabels = localLabels;
    return localLabels;
  }
  if (cachedPriorityLabels) return cachedPriorityLabels;
  if (!pendingPriorityLabels) {
    pendingPriorityLabels = fetch("/api/company-settings", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load priority labels");
        const json = (await res.json()) as SettingsResponse;
        const labels: PriorityLabels = { ...DEFAULT_PRIORITY_LABELS };
        for (const priority of json.priorities || []) {
          const name = typeof priority?.name === "string" ? priority.name.toLowerCase() : "";
          const displayLabel = typeof priority?.display_label === "string" ? priority.display_label.trim() : "";
          if (name && displayLabel) labels[name] = displayLabel.toUpperCase();
        }
        cachedPriorityLabels = labels;
        return labels;
      })
      .catch(() => DEFAULT_PRIORITY_LABELS)
      .finally(() => {
        pendingPriorityLabels = null;
      });
  }
  return pendingPriorityLabels;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const normalizedPriority = priority.toLowerCase();
  const cls = PRIORITY_CLASSES[normalizedPriority] ?? "bg-slate-100 text-gray-800";
  const dotCls = PRIORITY_DOT_CLASSES[normalizedPriority] ?? "bg-slate-400";
  const [label, setLabel] = useState(() => cachedPriorityLabels?.[normalizedPriority] || loadPriorityLabelsFromLocalStorage()?.[normalizedPriority] || fallbackLabel(priority));

  useEffect(() => {
    let cancelled = false;
    loadPriorityLabels().then((labels) => {
      if (!cancelled) setLabel(labels[normalizedPriority] || fallbackLabel(priority));
    });
    return () => {
      cancelled = true;
    };
  }, [normalizedPriority, priority]);

  return (
    <span className={cn("inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-md", cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dotCls)} />
      {label}
    </span>
  );
}
