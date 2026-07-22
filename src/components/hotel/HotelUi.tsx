import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function formatChipLabel(value: React.ReactNode) {
  if (typeof value !== "string") return value;
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function HotelPageHeader({ eyebrow, title, body, meta, action }: { eyebrow?: string; title: string; body?: string; meta?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <div className="text-sm font-medium text-[#3976A8]">{eyebrow}</div> : null}
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-[#18222C]">{title}</h1>
        {body ? <p className="mt-3 max-w-3xl text-base leading-7 text-[#5C6975]">{body}</p> : null}
        {meta ? <div className="mt-2 text-sm text-[#5C6975]">{meta}</div> : null}
      </div>
      {action}
    </div>
  );
}

export function HotelMetric({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="rounded-xl border border-[#E1E5E2] bg-white p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C6975]">{label}</div>
      <div className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#18222C]">{value}</div>
      <div className="mt-1 text-xs text-[#5C6975]">{sub}</div>
    </div>
  );
}

export function HotelQueueCard({ href, icon: Icon, title, count, detail }: { href: string; icon: any; title: string; count: string | number; detail: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-[#E1E5E2] bg-white p-6 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <Icon className="h-5 w-5 flex-shrink-0 text-[#5C6975]" />
        <div className="inline-flex items-center gap-1 rounded-[10px] border border-[#E1E5E2] bg-white px-2.5 py-1 text-xs font-semibold text-[#5C6975]">
          Open <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="mt-5 text-lg font-semibold text-[#18222C]">{title}</div>
      <div className="mt-1 text-3xl font-bold tracking-[-0.03em] text-[#18222C]">{count}</div>
      <p className="mt-2 text-sm leading-6 text-[#5C6975]">{detail}</p>
    </Link>
  );
}

export function HotelStatusPill({ tone, children }: { tone: "urgent" | "high" | "normal" | "resolved" | "queued"; children: React.ReactNode }) {
  const styles = {
    urgent: "border-[#F1D1D1] bg-[#FFF4F4] text-[#A33C3C]",
    high: "border-[#F4E0BF] bg-[#FFF7EC] text-[#9A6520]",
    normal: "border-[#D6E4F0] bg-[#F3F8FC] text-[#3976A8]",
    resolved: "border-[#CFE4DB] bg-[#F1F8F5] text-[#287A65]",
    queued: "border-[#F4E0BF] bg-[#FFF7EC] text-[#9A6520]",
  } as const;

  const dots = {
    urgent: "bg-[#C84B4B]",
    high: "bg-[#D78B28]",
    normal: "bg-[#3976A8]",
    resolved: "bg-[#287A65]",
    queued: "bg-[#D78B28]",
  } as const;

  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold", styles[tone])}>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dots[tone])} />
      {formatChipLabel(children)}
    </div>
  );
}

export function HotelSourcePill({ children }: { children: React.ReactNode }) {
  return <div className="inline-flex items-center rounded-full border border-[#E1E5E2] bg-white px-3 py-1 text-xs font-medium text-[#5C6975]">{children}</div>;
}
