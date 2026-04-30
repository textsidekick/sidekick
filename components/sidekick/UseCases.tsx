import { Eyebrow } from "./Brand";
import { BookOpen, ShieldCheck, HardHat, Clock, Users, FileText } from "lucide-react";

const CASES = [
  {
    icon: BookOpen,
    title: "SOP & policy lookup",
    body: "\"What's the lockout procedure for line 3?\" — answered from your SOP binder, in seconds, in their language.",
  },
  {
    icon: ShieldCheck,
    title: "Safety & incidents",
    body: "Walk workers through incident reporting, near-miss logs, and chemical safety steps — without finding a supervisor.",
  },
  {
    icon: HardHat,
    title: "Training & certs",
    body: "Refresher quizzes, cert expirations, and just-in-time training delivered over text on the floor.",
  },
  {
    icon: Clock,
    title: "Shift & schedule questions",
    body: "Shift swaps, time-off, parking, uniform pickup — the questions that flood supervisors every Monday.",
  },
  {
    icon: Users,
    title: "HR & payroll",
    body: "Benefits enrollment, paystub questions, PTO balance — answered privately over SMS, no portal login.",
  },
  {
    icon: FileText,
    title: "Onboarding",
    body: "New hires text JOIN, get walked through paperwork, training, and their first shift — on day one.",
  },
];

export default function UseCases() {
  return (
    <section className="px-6 py-28 bg-cream2/40 border-y border-ink/6">
      <div className="max-w-[1240px] mx-auto">
        <Eyebrow>Use cases</Eyebrow>
        <h2 className="font-serif font-normal mt-4 text-[48px] lg:text-[60px] leading-[1.05] tracking-[-0.02em] max-w-[780px]">
          The questions that pull supervisors off the floor.
        </h2>
        <p className="mt-5 text-[18px] text-ink/65 max-w-[640px]">
          Sidekick handles the repetitive 80% so your supervisors can focus on the
          20% that actually needs them.
        </p>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CASES.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="p-6 rounded-2xl border border-ink/8 bg-cream hover:border-ink/15 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/12 flex items-center justify-center text-accent">
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-[18px] font-medium tracking-tight">
                  {c.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-[1.55] text-ink/65">
                  {c.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
