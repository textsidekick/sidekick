import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function formatChipLabel(value: React.ReactNode) {
  if (typeof value !== "string") return value;
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function HotelPageHeader({ eyebrow, title, body, action }: { eyebrow?: string; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <div className="text-sm font-medium text-[#0060F0]">{eyebrow}</div> : null}
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-[#17202B]">{title}</h1>
        {body ? <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{body}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function HotelMetric({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#17202B]">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </div>
  );
}

export function HotelQueueCard({ href, icon: Icon, title, count, detail }: { href: string; icon: any; title: string; count: string | number; detail: string }) {
  return (
    <Link href={href} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <Icon className="h-5 w-5 flex-shrink-0 text-slate-600" />
        <div className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
          Open <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="mt-5 text-lg font-semibold text-[#17202B]">{title}</div>
      <div className="mt-1 text-3xl font-bold tracking-[-0.03em] text-[#17202B]">{count}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </Link>
  );
}

export function HotelStatusPill({ tone, children }: { tone: "urgent" | "high" | "normal" | "resolved" | "queued"; children: React.ReactNode }) {
  const styles = {
    urgent: "bg-white text-slate-700 border border-slate-200",
    high: "bg-white text-slate-700 border border-slate-200",
    normal: "bg-white text-slate-700 border border-slate-200",
    resolved: "bg-white text-slate-700 border border-slate-200",
    queued: "bg-white text-slate-700 border border-slate-200",
  } as const;

  const dots = {
    urgent: "bg-red-500",
    high: "bg-amber-500",
    normal: "bg-slate-400",
    resolved: "bg-emerald-500",
    queued: "bg-blue-500",
  } as const;

  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", styles[tone])}>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dots[tone])} />
      {formatChipLabel(children)}
    </div>
  );
}
