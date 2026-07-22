import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function HotelPageHeader({ eyebrow, title, body, action }: { eyebrow?: string; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <div className="text-sm font-medium text-[#C96442]">{eyebrow}</div> : null}
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-[#1C1A16]">{title}</h1>
        {body ? <p className="mt-3 max-w-3xl text-base leading-7 text-black/60">{body}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function HotelMetric({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40">{label}</div>
      <div className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#1C1A16]">{value}</div>
      <div className="mt-1 text-xs text-black/45">{sub}</div>
    </div>
  );
}

export function HotelQueueCard({ href, icon: Icon, title, count, detail }: { href: string; icon: any; title: string; count: string | number; detail: string }) {
  return (
    <Link href={href} className="rounded-3xl border border-black/8 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7f1e8]">
          <Icon className="h-5 w-5 text-[#C96442]" />
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-[#f7f1e8] px-3 py-1 text-xs font-semibold text-black/55">
          Open <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="mt-5 text-lg font-semibold text-[#1C1A16]">{title}</div>
      <div className="mt-1 text-3xl font-bold tracking-[-0.03em] text-[#1C1A16]">{count}</div>
      <p className="mt-2 text-sm leading-6 text-black/55">{detail}</p>
    </Link>
  );
}

export function HotelStatusPill({ tone, children }: { tone: "urgent" | "high" | "normal" | "resolved" | "queued"; children: React.ReactNode }) {
  const styles = {
    urgent: "bg-red-50 text-red-700",
    high: "bg-amber-50 text-amber-700",
    normal: "bg-[#f7f1e8] text-black/60",
    resolved: "bg-emerald-50 text-emerald-700",
    queued: "bg-slate-100 text-slate-700",
  } as const;

  return <div className={cn("rounded-full px-3 py-1 text-xs font-semibold", styles[tone])}>{children}</div>;
}
