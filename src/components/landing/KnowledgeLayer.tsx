import { Eyebrow } from "@/components/landing/Brand";

const RECORDS = [
  {
    q: "What fixed Press 4 last time?",
    a: "Rear seal replaced. Pressure reset after restart. Resolved by Miguel A. on Mar 18.",
    source: "WO-4412 · maintenance history",
  },
  {
    q: "Where is the HK-42 seal kit stored?",
    a: "Parts cage B, shelf 4. Current count: 3.",
    source: "Inventory record · updated 2 days ago",
  },
  {
    q: "Who handles Dock 2 forklift battery issues on second shift?",
    a: "Carlos R. is current shift lead. Escalate to maintenance if charger bank alarm persists.",
    source: "Shift handoff + SOP reference",
  },
];

export default function KnowledgeLayer() {
  return (
    <section id="knowledge" className="bg-[#EEF1ED] px-5 py-20 md:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="max-w-[560px]">
          <Eyebrow>The knowledge layer</Eyebrow>
          <h2
            className="mt-5 text-[#171A1D]"
            style={{ fontSize: "clamp(2.4rem, 4.7vw, 4.1rem)", lineHeight: 0.98, letterSpacing: "-0.03em", fontWeight: 650 }}
          >
            The next shift should not start from zero.
          </h2>
          <p className="mt-5 text-[18px] leading-[1.65] text-[#4E5760]">
            Sidekick is not just intake. It keeps prior fixes, sourced answers, and operational context attached to the work so the next person can move faster with less guesswork.
          </p>
          <div className="mt-7 grid gap-3 text-[15px] text-[#4E5760]">
            {[
              "Answers can reference prior incidents instead of vague AI guesses",
              "Operational context stays attached to the asset and issue",
              "The fix belongs to the operation, not only the person who remembers it",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-[8px] block h-1.5 w-1.5 rounded-full bg-[#F05A28]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[18px] border border-black/8 bg-white p-5 shadow-[0_12px_32px_rgba(0,0,0,0.06)] md:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-black/8 pb-3">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#69727B]">Searchable history</div>
              <div className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-[#171A1D]">Grounded answers from prior work</div>
            </div>
            <span className="rounded-[8px] border border-black/8 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#69727B]">Recorded</span>
          </div>

          <div className="space-y-3">
            {RECORDS.map((record) => (
              <div key={record.q} className="rounded-[12px] border border-black/8 bg-[#F8F9F7] p-4">
                <div className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#6C737B]">Question</div>
                <div className="mt-1 text-[16px] font-semibold text-[#171A1D]">{record.q}</div>
                <div className="mt-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#6C737B]">Answer</div>
                <div className="mt-1 text-[15px] leading-[1.65] text-[#3E4953]">{record.a}</div>
                <div className="mt-3 inline-flex rounded-[8px] bg-[#171A1D] px-2.5 py-1 text-[11px] font-medium text-white/78">
                  Source: {record.source}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
