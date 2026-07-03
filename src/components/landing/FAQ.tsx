"use client";

import { useState } from "react";
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
    <section className="px-6 py-24 md:px-10 md:py-32" style={{ background: "#F1F3F9" }}>
      <div className="mx-auto max-w-[720px]">
        <Reveal>
          <div className="mb-12 text-center">
            <div className="mb-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
              FAQ
            </div>
            <h2
              className="font-extrabold text-ink"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
              }}
            >
              Common questions.
            </h2>
          </div>
        </Reveal>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <Reveal key={i} delay={i * 60}>
              <div
                className="rounded-xl border border-[rgba(17,24,39,0.06)] bg-white overflow-hidden"
                style={{ boxShadow: "0 1px 2px rgba(17,24,39,0.03)" }}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left bg-transparent border-none cursor-pointer"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="text-[15px] font-semibold text-ink pr-6">{faq.q}</span>
                  <span
                    className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                      background: open === i ? "var(--accent)" : "rgba(17,24,39,0.05)",
                      color: open === i ? "#fff" : "rgba(17,24,39,0.4)",
                      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                      transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
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
                    <div className="px-6 pb-5 text-[15px] leading-relaxed text-[rgba(17,24,39,0.55)]">
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
