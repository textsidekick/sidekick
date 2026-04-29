import { Eyebrow, HeadlineWithSidekick } from "./Brand";

const STEPS = [
  {
    n: "01",
    title: "Upload your binders",
    body: "SOPs, training PDFs, safety docs, schedules, HR policies — drop them in. Sidekick reads everything and builds a living knowledge base for your team.",
  },
  {
    n: "02",
    title: "Workers text one number",
    body: "No app, no login. Workers text questions in any language and get instant, accurate answers grounded in your documents — 24/7.",
  },
  {
    n: "03",
    title: "Supervisors stay in the loop",
    body: "When Sidekick can't answer or a question needs a human, it routes to the right supervisor and logs the conversation for follow-up.",
  },
];

export default function HowItWorks() {
  return (
    <section id="product" className="px-6 py-28">
      <div className="max-w-[1240px] mx-auto">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="font-serif font-normal mt-4 text-[48px] lg:text-[60px] leading-[1.05] tracking-[-0.02em] max-w-[780px]">
          <HeadlineWithSidekick text="A sidekick for every shift, no app required." />
        </h2>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="relative p-7 rounded-2xl border border-ink/8 bg-cream2/70"
            >
              <div className="font-serif text-accent text-2xl">{s.n}</div>
              <h3 className="mt-3 text-[22px] font-medium tracking-tight">
                {s.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.55] text-ink/65">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
