"use client";

import { useState } from "react";
import { Eyebrow } from "@/components/landing/Brand";
import Reveal from "@/components/landing/Reveal";

const FAQS = [
  {
    q: "Do workers need to download an app?",
    a: "No. They text a phone number. Any phone that can send SMS works.",
  },
  {
    q: "What languages does it support?",
    a: "All of them. Workers can text or send voice notes in any language.",
  },
  {
    q: "What if the AI gets something wrong?",
    a: "Managers can correct any triage with one tap. Sidekick learns from every correction.",
  },
  {
    q: "Can I use it alongside my current CMMS?",
    a: "Yes. Sidekick works as a standalone system or as an intake layer feeding your existing tools.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="border-t border-[rgba(28,26,22,0.07)] px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-[720px]">
        <Reveal>
          <Eyebrow>FAQ</Eyebrow>
          <h2
            className="font-serif font-normal mt-5 mb-12 text-ink"
            style={{
              fontSize: "clamp(2.125rem, 4.5vw, 3.25rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
            }}
          >
            Common questions.
          </h2>
        </Reveal>
        <div className="flex flex-col">
          {FAQS.map((faq, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="border-t border-[rgba(28,26,22,0.07)] last:border-b last:border-b-[rgba(28,26,22,0.07)]">
                <button
                  className="w-full flex items-center justify-between px-0 py-5 text-left bg-transparent border-none cursor-pointer"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="text-[16px] font-medium text-ink pr-6">{faq.q}</span>
                  <span
                    className="flex-shrink-0 text-accent text-xl leading-none"
                    style={{
                      transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                      transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                      display: "block",
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: open === i ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <div className="overflow-hidden">
                    <div className="pb-5 text-[15px] font-light leading-relaxed text-[rgba(28,26,22,0.65)]">
                      {faq.a}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
