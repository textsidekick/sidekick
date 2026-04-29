"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eyebrow } from "./Brand";
import { Mail, MapPin, Phone } from "lucide-react";

type Status = "idle" | "submitting" | "ok" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Submission failed");
      }
      setStatus("ok");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <section id="contact" className="px-6 py-28 bg-cream2/40 border-t border-ink/6">
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16">
        <div>
          <Eyebrow>Get in touch</Eyebrow>
          <h2 className="font-serif font-normal mt-4 text-[44px] lg:text-[56px] leading-[1.05] tracking-[-0.02em]">
            Talk to a human.
          </h2>
          <p className="mt-5 text-[17px] leading-[1.55] text-ink/65 max-w-[460px]">
            Tell us about your floor — how many workers, what languages, where
            the binders live today. We'll set up a demo with your real docs.
          </p>

          <ul className="mt-10 space-y-4 text-[15px] text-ink/75">
            <li className="flex items-start gap-3">
              <Mail className="w-4 h-4 mt-1 text-accent" strokeWidth={2} />
              <a href="mailto:hello@textsidekick.com" className="hover:text-ink">
                hello@textsidekick.com
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="w-4 h-4 mt-1 text-accent" strokeWidth={2} />
              <a href="tel:+14158438174" className="hover:text-ink">
                +1 (415) 843-8174
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-1 text-accent" strokeWidth={2} />
              <span>1011 Washington Street<br/>San Francisco, CA</span>
            </li>
          </ul>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-ink/8 bg-cream p-7 lg:p-9 space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[13px] text-ink/70">Name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Marcus Reyes"
                className="bg-cream2/60 border-ink/10 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-[13px] text-ink/70">Company</Label>
              <Input
                id="company"
                name="company"
                required
                placeholder="EDS Manufacturing"
                className="bg-cream2/60 border-ink/10 h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[13px] text-ink/70">Work email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="marcus@eds.com"
              className="bg-cream2/60 border-ink/10 h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="text-[13px] text-ink/70">
              Tell us about your floor
            </Label>
            <Textarea
              id="message"
              name="message"
              required
              rows={5}
              placeholder="~140 frontline workers across 2 shifts, mostly Spanish + English. Our SOP binder lives in a shared Google Drive and a few three-ring folders on the floor…"
              className="bg-cream2/60 border-ink/10 resize-none"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={status === "submitting"}
              className="rounded-full bg-ink text-cream hover:bg-ink/90 h-12 px-7 text-[15px] disabled:opacity-60"
            >
              {status === "submitting" ? "Sending…" : "Request a demo →"}
            </Button>
            {status === "ok" && (
              <span className="text-[14px] text-emerald-700">
                Got it — we'll reply within a business day.
              </span>
            )}
            {status === "error" && (
              <span className="text-[14px] text-red-700">
                {errorMsg || "Something went wrong. Try emailing us directly."}
              </span>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
