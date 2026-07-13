"use client";

import { useState } from "react";
import { Eyebrow } from "@/components/landing/Brand";

const FAQS = [
  {
    q: "Do workers need to download an app or learn a new system?",
    a: "No. Workers use text. Managers get structured records, routing, and history without forcing the floor into another login.",
  },
  {
    q: "What does pricing look like?",
    a: "We price by site, not by seat, so you can roll it out across the floor without getting punished for adoption.",
  },
  {
    q: "What if workers are not allowed to install apps or use complex tools?",
    a: "That is exactly the point. Sidekick works over familiar channels like SMS, so adoption is much easier than a traditional CMMS workflow.",
  },
  {
    q: "Can I use it alongside my current systems?",
    a: "Yes. Sidekick can stand alone or act as the intake and knowledge layer on top of your existing processes and systems.",
  },
  {
    q: "What happens when the AI gets something wrong?",
    a: "Managers stay in control. Sidekick can be corrected, and every correction improves the quality of future routing and answers.",
  },
  {
    q: "Where does the knowledge go?",
    a: "Into a searchable company memory tied to the issue, asset, and resolution — so critical know-how does not disappear when a shift ends or someone leaves.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="px-6 md:px-10 lg:px-14 py-24 border-t border-ink/10">
      <div className="max-w-[720px] mx-auto">
        <Eyebrow>FAQ</Eyebrow>
        <h2
          className="font-serif font-normal mt-5 mb-12"
          style={{ fontSize: 48, lineHeight: 1.05, letterSpacing: "-0.02em" }}
        >
          Common questions.
        </h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-[16px] border border-ink/[0.07] overflow-hidden"
              style={{ boxShadow: "0 1px 0 rgba(28,26,22,0.04)" }}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-[16px] font-medium text-ink">{faq.q}</span>
                <span
                  className="ml-4 flex-shrink-0 text-accent text-xl leading-none transition-transform"
                  style={{ transform: open === i ? "rotate(45deg)" : "rotate(0deg)" }}
                >
                  +
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-[15px] text-ink/65 leading-relaxed border-t border-ink/[0.06] pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
