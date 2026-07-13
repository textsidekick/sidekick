import { Eyebrow } from "@/components/landing/Brand";

const STEPS = [
  {
    n: "01",
    title: "A worker reports a problem or asks a question",
    body: "The floor uses the behavior it already has: text. No app install, no new login, no separate training workflow.",
    tag: "SMS intake",
  },
  {
    n: "02",
    title: "Sidekick identifies what matters",
    body: "It matches the asset, tags the category, asks for missing context when needed, and turns an ambiguous message into something operationally useful.",
    tag: "Asset + context",
  },
  {
    n: "03",
    title: "The right person gets routed into the work",
    body: "Issues become structured records with ownership, urgency, and timestamps instead of hallway conversations or memory-based follow-up.",
    tag: "Routing + ownership",
  },
  {
    n: "04",
    title: "The resolution becomes future history",
    body: "The next person can ask what worked last time and get a grounded answer tied to the asset, the issue, and the previous fix.",
    tag: "Recorded resolution",
  },
];

export default function HowItWorks() {
  return (
    <section id="workflow" className="bg-[#F3F4F1] px-5 py-20 md:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-[1280px]">
        <div className="max-w-[760px]">
          <Eyebrow>The complete loop</Eyebrow>
          <h2
            className="mt-5 text-[#171A1D]"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.2rem)", lineHeight: 0.98, letterSpacing: "-0.03em", fontWeight: 650 }}
          >
            One text becomes tracked work, then reusable knowledge.
          </h2>
          <p className="mt-5 max-w-[680px] text-[18px] leading-[1.65] text-[#4E5760]">
            Sidekick should not feel like a chatbot bolted onto operations. It should feel like the cleanest path from a frontline signal to a resolved, searchable record.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4">
            {STEPS.map((step) => (
              <div key={step.n} className="grid gap-4 rounded-[14px] border border-black/8 bg-white p-5 md:grid-cols-[84px_1fr_auto] md:items-start md:gap-6 md:p-6">
                <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#F05A28]">Step {step.n}</div>
                <div>
                  <h3 className="text-[24px] font-semibold tracking-[-0.02em] text-[#171A1D]">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-[1.65] text-[#53606C]">{step.body}</p>
                </div>
                <div className="inline-flex w-fit items-center rounded-[999px] border border-black/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#69727B]">
                  {step.tag}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[16px] border border-black/8 bg-[#171C22] p-5 text-white md:p-6">
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/45">Example record</div>
            <div className="mt-4 rounded-[12px] border border-white/8 bg-white/4 p-4">
              <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-4">
                <div>
                  <div className="text-[18px] font-semibold">WO-4521 · Press 4 hydraulic leak</div>
                  <div className="mt-1 text-[13px] text-white/55">Created from worker SMS · Rear seal area · Shift B</div>
                </div>
                <span className="rounded-[8px] bg-[#F05A28] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]">High</span>
              </div>
              <div className="mt-4 grid gap-3 text-[14px] text-white/78">
                <Line label="Owner" value="Miguel A." />
                <Line label="Status" value="In progress -> resolved" />
                <Line label="Parts" value="Seal kit HK-42" />
                <Line label="Captured fix" value="Seal replaced, pressure reset, tested after restart" />
                <Line label="Result" value="Saved as searchable history for future incidents" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-3 last:border-0 last:pb-0">
      <span className="text-white/50">{label}</span>
      <span className="max-w-[240px] text-right font-medium text-white/92">{value}</span>
    </div>
  );
}
