import { cn } from "@/lib/utils";

interface SkeletonProps {
  variant?: "row" | "card" | "text";
  className?: string;
  rows?: number;
}

export function Skeleton({ variant = "text", className, rows = 1 }: SkeletonProps) {
  if (variant === "row") {
    return (
      <div className={cn("animate-pulse flex items-center gap-4 py-3", className)}>
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-4 bg-gray-200 rounded w-12" />
        <div className="h-4 bg-gray-200 rounded flex-1" />
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-16 hidden md:block" />
        <div className="h-4 bg-gray-200 rounded w-16 hidden md:block" />
        <div className="h-8 bg-gray-200 rounded w-24" />
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("animate-pulse rounded-2xl bg-white border border-black/5 p-5", className)}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-3 bg-gray-200 rounded w-full mb-2" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
    );
  }

  return (
    <div className={cn("animate-pulse space-y-2", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${70 + (i % 3) * 10}%` }} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="row" />
      ))}
    </div>
  );
}

export function SkeletonGrid({ cols = 3, rows = 2 }: { cols?: number; rows?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-${cols} gap-4`}>
      {Array.from({ length: cols * rows }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  );
}
