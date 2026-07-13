import { Eyebrow } from "@/components/landing/Brand";

const FLOOR = [
  "No app install or per-worker login ritual",
  "Workers use familiar texting behavior",
  "Useful for issues, questions, and exceptions",
  "Fast enough that people actually use it under pressure",
];

const OPS = [
  "Structured asset, priority, and ownership fields",
  "Timestamps and resolution history stay attached to the record",
  "Managers can review, correct, and follow the thread",
  "Can sit alongside existing systems instead of forcing a rip-and-replace",
];

export default function Comparison() {
  return (
    <section className="bg-white px-5 py-20 md:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-[1280px]">
        <div className="max-w-[760px]">
          <Eyebrow>Built for actual plant conditions</Eyebrow>
          <h2
            className="mt-5 text-[#171A1D]"
            style={{ fontSize: "clamp(2.3rem, 4.5vw, 4rem)", lineHeight: 1, letterSpacing: "-0.03em", fontWeight: 650 }}
          >
            Easy for the floor. Structured for operations.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card title="Easy for the floor" subtitle="Adoption matters more than feature count." items={FLOOR} dark={false} />
          <Card title="Structured for operations" subtitle="Managers should get a usable operational record, not another chat thread." items={OPS} dark={true} />
        </div>
      </div>
    </section>
  );
}

function Card({
  title,
  subtitle,
  items,
  dark,
}: {
  title: string;
  subtitle: string;
  items: string[];
  dark?: boolean;
}) {
  return (
    <div className={`rounded-[16px] border p-6 md:p-7 ${dark ? "border-[#171A1D] bg-[#171A1D] text-white" : "border-black/8 bg-[#F3F4F1] text-[#171A1D]"}`}>
      <div className={`text-[12px] font-semibold uppercase tracking-[0.14em] ${dark ? "text-white/45" : "text-[#6B747C]"}`}>
        {title}
      </div>
      <p className={`mt-3 text-[24px] font-semibold tracking-[-0.02em] ${dark ? "text-white" : "text-[#171A1D]"}`}>{subtitle}</p>
      <div className="mt-6 grid gap-3">
        {items.map((item) => (
          <div key={item} className={`flex items-start gap-3 rounded-[10px] border px-4 py-3 text-[14px] leading-[1.6] ${dark ? "border-white/10 bg-white/4 text-white/85" : "border-black/8 bg-white text-[#49545F]"}`}>
            <span className={`mt-[7px] block h-1.5 w-1.5 rounded-full ${dark ? "bg-[#F05A28]" : "bg-[#245BDB]"}`} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
