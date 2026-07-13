"use client";

import { useState } from "react";
import { Eyebrow } from "@/components/landing/Brand";

const FAQS = [
  {
    q: "Does Sidekick replace our CMMS or existing systems?",
    a: "Not necessarily. Sidekick can work as the intake and knowledge layer on top of your current processes, or support a simpler workflow where needed.",
  },
  {
    q: "What happens when Sidekick is uncertain or wrong?",
    a: "Managers stay in control. The goal is a cleaner operational starting point, not blind autonomy. Records can be reviewed, corrected, and routed by the team running the floor.",
  },
  {
    q: "What does rollout require?",
    a: "A short setup around sites, assets, people, and the operating workflow you want Sidekick to support. The main adoption advantage is that the floor already knows how to text.",
  },
  {
    q: "How is plant knowledge handled?",
    a: "Resolutions, answers, and operational context are stored as structured history tied to the work, so the next shift can find what happened instead of starting from memory.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white px-5 py-20 md:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-[480px]">
          <Eyebrow>Questions buyers actually ask</Eyebrow>
          <h2
            className="mt-5 text-[#171A1D]"
            style={{ fontSize: "clamp(2.2rem, 4.2vw, 3.8rem)", lineHeight: 0.98, letterSpacing: "-0.03em", fontWeight: 650 }}
          >
            The adoption and control questions matter more than the AI label.
          </h2>
          <p className="mt-5 text-[17px] leading-[1.65] text-[#4E5760]">
            Sidekick has to work in real operating conditions. That means answering the questions people ask before they trust anything on the floor.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.q} className="rounded-[12px] border border-black/8 bg-[#F8F9F7]">
                <button
                  className="flex w-full items-center justify-between gap-6 px-5 py-4 text-left"
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="text-[17px] font-semibold tracking-[-0.02em] text-[#171A1D]">{faq.q}</span>
                  <span className="text-[22px] leading-none text-[#69727B]">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="border-t border-black/8 px-5 py-4 text-[15px] leading-[1.7] text-[#4E5760]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
