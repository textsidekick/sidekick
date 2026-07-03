"use client";

import { useState } from "react";
import { ArrowIcon } from "@/components/landing/icons";
import Reveal from "@/components/landing/Reveal";

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function Contact() {
  const [state, setState] = useState<FormState>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ kind: "submitting" });
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Failed to send" }));
        throw new Error(error || "Failed to send");
      }
      setState({ kind: "success" });
      form.reset();
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Failed to send",
      });
    }
  }

  return (
    <section id="contact" className="scroll-mt-24 px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-start gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <Reveal>
          <div className="mb-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
            Get in touch
          </div>
          <h2
            className="mb-6 font-extrabold text-ink"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            Talk to a human about your floor.
          </h2>
          <p className="mb-10 max-w-[460px] text-[16px] leading-[1.65] text-[rgba(17,24,39,0.55)]">
            Tell us about your operation and we&apos;ll set up a short call — no pitch deck, just a conversation about whether Sidekick fits.
          </p>
          <div className="flex flex-col gap-5">
            {[
              { l: "Email", v: "hello@textsidekick.com" },
              { l: "Phone", v: "+1 (408) 828-5979" },
              { l: "Office", v: "San Francisco, CA" },
            ].map((c) => (
              <div key={c.l} className="flex gap-6 items-baseline">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(17,24,39,0.35)] w-14 flex-shrink-0">
                  {c.l}
                </div>
                <div className="text-[15px] text-ink font-semibold">{c.v}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-5 rounded-2xl border border-[rgba(17,24,39,0.06)] bg-white p-8 md:p-10"
            style={{ boxShadow: "0 1px 3px rgba(17,24,39,0.04), 0 16px 48px -16px rgba(17,24,39,0.08)" }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field name="name" label="Your name" placeholder="Jordan Halverson" required />
              <Field name="email" type="email" label="Work email" placeholder="jordan@halversonmfg.com" required />
              <Field name="company" label="Company" placeholder="Halverson Manufacturing" />
              <Field name="size" label="Workforce size" placeholder="80 frontline workers" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[rgba(17,24,39,0.5)]">
                What&apos;s most chaotic about your operation right now?
              </label>
              <textarea
                name="message"
                rows={4}
                placeholder="Onboarding takes forever, SOPs are everywhere, half the team texts me at 6am…"
                className="rounded-lg border border-[rgba(17,24,39,0.1)] bg-[rgba(17,24,39,0.02)] px-4 py-3 text-sm text-ink outline-none resize-y focus:border-accent focus:ring-1 focus:ring-accent/20"
                style={{ transition: "border-color 0.2s ease, box-shadow 0.2s ease" }}
              />
            </div>
            <div className="flex items-center justify-between gap-4 mt-2">
              <div className="text-[12px] text-[rgba(17,24,39,0.4)] max-w-[260px] leading-[1.4]">
                {state.kind === "success"
                  ? "Thanks — we'll be in touch within one business day."
                  : state.kind === "error"
                  ? <span className="text-red-600">Something went wrong: {state.message}</span>
                  : "We'll never share your info."}
              </div>
              <button
                type="submit"
                disabled={state.kind === "submitting"}
                className="btn inline-flex items-center gap-2.5 bg-accent text-white px-6 py-3 rounded-lg text-sm font-semibold flex-shrink-0 disabled:opacity-60 hover:bg-[#0052cc]"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
              >
                {state.kind === "submitting" ? "Sending…" : "Send message"}{" "}
                <ArrowIcon size={14} />
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  placeholder,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-[rgba(17,24,39,0.5)]" htmlFor={name}>
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="rounded-lg border border-[rgba(17,24,39,0.1)] bg-[rgba(17,24,39,0.02)] px-4 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
        style={{ transition: "border-color 0.2s ease, box-shadow 0.2s ease" }}
      />
    </div>
  );
}
