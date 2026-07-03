import { Eyebrow } from "@/components/landing/Brand";
import { BookIcon, ShieldIcon, HardhatIcon } from "@/components/landing/icons";

const CASES = [
  {
    Icon: BookIcon,
    tag: "SOP LOOKUP",
    title: "Answers from your own docs, not the internet.",
    body: "Workers text questions. Sidekick pulls from the exact SOP, part manual, or safety sheet — and cites the source. Every answer is traceable.",
    example: {
      q: "what PSI do I set the CNC coolant at?",
      a: "85 PSI for the Haas VF-2 (SOP-CNC-07, p3). Check sight-glass daily.",
    },
  },
  {
    Icon: ShieldIcon,
    tag: "SAFETY & INCIDENTS",
    title: "A calm, always-on first responder.",
    body: "In an incident, Sidekick walks workers through the right steps, pages supervisors, and starts the OSHA-compliant paperwork before the worker puts their phone down.",
    example: {
      q: "small chemical spill at station 4",
      a: "Stop work, clear the area. Don't rinse. I've paged Jenna + EHS. Spill kit is in cabinet 4B. What's the substance?",
    },
  },
  {
    Icon: HardhatIcon,
    tag: "TRAINING & CERTS",
    title: "Onboarding from 4 weeks to 9 days.",
    body: "New hires text Sidekick instead of interrupting a line lead. Certifications auto-renew on time. You get a dashboard showing who knows what.",
    example: {
      q: "how do I lock out the conveyor on line B?",
      a: "6 steps — I'll send them one at a time. Reply DONE after each so I can verify. Ready?",
    },
  },
];

export default function UseCases() {
  return (
    <section className="px-14 py-24">
      <div className="max-w-[1180px] mx-auto">
        <Eyebrow>What it&apos;s good for</Eyebrow>
        <h2
          className="font-serif font-normal mt-5 mb-14 max-w-[720px]"
          style={{ fontSize: 56, lineHeight: 1, letterSpacing: "-0.02em" }}
        >
          Built for the moments where a 40-page PDF isn&apos;t the answer.
        </h2>
        <div className="flex flex-col gap-5">
          {CASES.map((c) => {
            const Icon = c.Icon;
            return (
              <div
                key={c.tag}
                className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-12 p-10 rounded-[20px] bg-white border border-ink/[0.06] items-center"
              >
                <div>
                  <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full mb-5 bg-accent/10 text-accent text-[11px] font-semibold tracking-widest">
                    <Icon size={18} />
                    {c.tag}
                  </div>
                  <h3
                    className="font-serif font-normal m-0 mb-4"
                    style={{ fontSize: 36, lineHeight: 1.05, letterSpacing: "-0.02em" }}
                  >
                    {c.title}
                  </h3>
                  <p className="text-base leading-[1.55] text-ink/70 m-0 max-w-[440px]">
                    {c.body}
                  </p>
                </div>
                <div
                  className="bg-cream rounded-[14px] p-4 flex flex-col gap-2"
                  style={{
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  }}
                >
                  <div className="self-end max-w-[82%] px-[13px] py-2.5 bg-[#34C759] text-white rounded-[18px_18px_4px_18px] text-sm leading-[1.35]">
                    {c.example.q}
                  </div>
                  <div className="self-start max-w-[82%] px-[13px] py-2.5 bg-[#E9E9EB] text-black rounded-[18px_18px_18px_4px] text-sm leading-[1.35]">
                    {c.example.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
