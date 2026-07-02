"use client";

import { useState } from "react";
import { Eyebrow } from "@/components/landing/Brand";

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
    <section className="px-14 py-24 border-t border-ink/10">
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
