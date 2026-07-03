"use client";

import { useState } from "react";
import { Eyebrow } from "@/components/landing/Brand";
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
    <section
      id="contact"
      className="border-t border-[rgba(28,26,22,0.07)] px-6 py-28 scroll-mt-24 md:px-10 md:py-36"
    >
      <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-start gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <Reveal>
          <Eyebrow>Get in touch</Eyebrow>
          <h2
            className="font-serif font-normal mt-5 mb-6 text-ink"
            style={{
              fontSize: "clamp(2.125rem, 4.5vw, 3.25rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              textWrap: "balance" as React.CSSProperties["textWrap"],
            }}
          >
            Talk to a real human about <em className="italic text-accent">your</em> floor.
          </h2>
          <p className="text-[16px] font-light leading-[1.6] text-[rgba(28,26,22,0.6)] m-0 mb-9 max-w-[460px]">
            Tell us a little about your operation and we&apos;ll set up a short call — no pitch deck, just a conversation about whether Sidekick makes sense for you.
          </p>
          <div className="flex flex-col gap-[18px]">
            {[
              { l: "Email", v: "hello@textsidekick.com" },
              { l: "Phone", v: "+1 (408) 828-5979" },
              { l: "Office", v: "San Francisco, CA" },
            ].map((c) => (
              <div key={c.l} className="flex gap-6 items-baseline">
                <div className="text-[11px] uppercase tracking-widest text-[rgba(28,26,22,0.45)] w-16 flex-shrink-0">
                  {c.l}
                </div>
                <div className="text-[15px] text-ink font-medium">{c.v}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-[18px] rounded-[20px] border border-[rgba(28,26,22,0.08)] p-9"
            style={{ background: "rgba(252,249,243,0.6)" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field name="name" label="Your name" placeholder="Jordan Halverson" required />
              <Field name="email" type="email" label="Work email" placeholder="jordan@halversonmfg.com" required />
              <Field name="company" label="Company" placeholder="Halverson Manufacturing" />
              <Field name="size" label="Workforce size" placeholder="80 frontline workers" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[rgba(28,26,22,0.55)] font-medium">
                What&apos;s the most chaotic part of your operation right now?
              </label>
              <textarea
                name="message"
                rows={4}
                placeholder="Onboarding takes forever, SOPs are everywhere, half the team texts me at 6am…"
                className="border border-[rgba(28,26,22,0.12)] bg-white rounded-lg px-3.5 py-3 text-sm text-ink outline-none resize-y focus:border-[rgba(201,100,66,0.5)]"
                style={{ transition: "border-color 0.2s ease" }}
              />
            </div>
            <div className="flex items-center justify-between gap-4 mt-1.5">
              <div className="text-xs text-[rgba(28,26,22,0.45)] max-w-[260px] leading-[1.4]">
                {state.kind === "success"
                  ? "Thanks — we'll be in touch within one business day."
                  : state.kind === "error"
                  ? <span className="text-red-600">Something went wrong: {state.message}</span>
                  : "We'll never share your info. Reply within one business day."}
              </div>
              <button
                type="submit"
                disabled={state.kind === "submitting"}
                className="btn inline-flex items-center gap-2.5 bg-ink text-cream px-[22px] py-3 rounded-full text-sm font-medium flex-shrink-0 disabled:opacity-60"
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
      <label className="text-xs text-[rgba(28,26,22,0.55)] font-medium" htmlFor={name}>
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="border border-[rgba(28,26,22,0.12)] bg-white rounded-lg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-[rgba(201,100,66,0.5)]"
        style={{ transition: "border-color 0.2s ease" }}
      />
    </div>
  );
}
