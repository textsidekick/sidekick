"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import PhoneFrame from "./PhoneFrame";
import { Eyebrow, HeadlineWithSidekick, YCBadge } from "./Brand";

const SidekickChat = dynamic(() => import("./SidekickChat"), { ssr: false });

const PROOF = [
  "Works in 100+ languages over plain SMS",
  "Trained on your SOPs, schedules, and policies",
  "No app, no login, no training",
];

export default function Hero() {
  return (
    <section className="relative px-6 pt-16 pb-24 overflow-hidden">
      {/* Soft warm wash behind hero */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[700px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 70% 0%, rgba(196,87,52,0.08), transparent 60%)",
        }}
      />
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-16 items-center">
        <div>
          <Eyebrow>For frontline teams</Eyebrow>
          <h1
            className="font-serif font-normal mt-5 text-[64px] lg:text-[76px] leading-[1.02] tracking-[-0.02em]"
          >
            <HeadlineWithSidekick text="Sidekick: frontline answers, by text." />
          </h1>
          <p className="mt-6 text-[19px] leading-[1.55] text-ink/70 max-w-[560px]">
            Workers text any question — shift times, SOPs, safety steps, payroll —
            and get an instant answer in their language. Sidekick reads your binders,
            schedules, and policies so your supervisors don't have to.
          </p>

          <ul className="mt-8 space-y-2.5">
            {PROOF.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[15px] text-ink/75">
                <span className="mt-[3px] flex-shrink-0 w-[18px] h-[18px] rounded-full bg-accent/15 flex items-center justify-center">
                  <Check className="w-3 h-3 text-accent" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-ink text-cream hover:bg-ink/90 h-12 px-6 text-[15px]"
            >
              <a href="#contact">Book a demo →</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-ink/15 bg-transparent hover:bg-ink/5 h-12 px-6 text-[15px]"
            >
              <a href="#product">See how it works</a>
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-5">
            <YCBadge height={20} />
          </div>
        </div>

        {/* Phone */}
        <div className="relative flex justify-center lg:justify-end">
          <div
            aria-hidden
            className="absolute -inset-12 -z-10 rounded-full blur-3xl opacity-50"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(196,87,52,0.18), transparent 60%)",
            }}
          />
          <PhoneFrame scale={0.85} time="4:17">
            <SidekickChat />
          </PhoneFrame>
        </div>
      </div>
    </section>
  );
}
