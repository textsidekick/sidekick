"use client";

import { useState } from "react";
import { Eyebrow } from "@/components/landing/Brand";
import { ArrowIcon } from "@/components/landing/icons";

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
      className="px-14 py-24 border-t border-ink/10 scroll-mt-24"
    >
      <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-20 items-start">
        <div>
          <Eyebrow>Get in touch</Eyebrow>
          <h2
            className="font-serif font-normal mt-3 mb-6"
            style={{
              fontSize: 56,
              lineHeight: 1,
              letterSpacing: "-0.025em",
              textWrap: "balance" as React.CSSProperties["textWrap"],
            }}
          >
            Talk to a real human about <em className="italic text-accent">your</em> floor.
          </h2>
          <p className="text-base leading-[1.55] text-ink/70 m-0 mb-9 max-w-[460px]">
            Tell us a little about your operation and we&apos;ll set up a short call — no pitch deck, just a conversation about whether Sidekick makes sense for you.
          </p>
          <div className="flex flex-col gap-[18px]">
            {[
              { l: "Email", v: "justin@textsidekick.com" },
              { l: "Phone", v: "+1 (628) 555-0119" },
              { l: "Office", v: "San Francisco, CA · Mon–Fri 8a–6p PT" },
            ].map((c) => (
              <div key={c.l} className="flex gap-6 items-baseline">
                <div className="text-[11px] uppercase tracking-widest text-ink/50 w-16 flex-shrink-0">
                  {c.l}
                </div>
                <div className="text-[15px] text-ink font-medium">{c.v}</div>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-cream2 border border-ink/10 rounded-[20px] p-9 flex flex-col gap-[18px]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Field name="name" label="Your name" placeholder="Jordan Halverson" required />
            <Field name="email" type="email" label="Work email" placeholder="jordan@halversonmfg.com" required />
            <Field name="company" label="Company" placeholder="Halverson Manufacturing" />
            <Field name="size" label="Workforce size" placeholder="80 frontline workers" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-ink/60 font-medium">
              What&apos;s the most chaotic part of your operation right now?
            </label>
            <textarea
              name="message"
              rows={4}
              placeholder="Onboarding takes forever, SOPs are everywhere, half the team texts me at 6am…"
              className="border border-ink/15 bg-white rounded-lg px-3.5 py-3 text-sm text-ink outline-none resize-y focus:border-accent/50"
            />
          </div>
          <div className="flex items-center justify-between gap-4 mt-1.5">
            <div className="text-xs text-ink/50 max-w-[260px] leading-[1.4]">
              {state.kind === "success"
                ? "Thanks — we'll be in touch within one business day."
                : state.kind === "error"
                ? <span className="text-red-600">Something went wrong: {state.message}</span>
                : "We'll never share your info. Reply within one business day."}
            </div>
            <button
              type="submit"
              disabled={state.kind === "submitting"}
              className="inline-flex items-center gap-2.5 bg-ink text-cream px-[22px] py-3 rounded-full text-sm font-medium flex-shrink-0 disabled:opacity-60"
            >
              {state.kind === "submitting" ? "Sending…" : "Send message"}{" "}
              <ArrowIcon size={14} />
            </button>
          </div>
        </form>
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
      <label className="text-xs text-ink/60 font-medium" htmlFor={name}>
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="border border-ink/15 bg-white rounded-lg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent/50"
      />
    </div>
  );
}
