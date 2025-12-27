"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Msg = { role: "assistant" | "user"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "👋 Hi, and welcome! What’s your preferred first name?" },
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(1); // 1..5
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  // NEW: reliable storage of answers per step
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const endRef = useRef<HTMLDivElement | null>(null);
  const stepLabel = useMemo(() => `Step ${step} of 5`, [step]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {

    if (loading || done) return;

    const answer = input.trim();

    if (!answer) return;

    // Show user message immediately

    setMessages((prev) => [...prev, { role: "user", content: answer }]);

    setInput("");

    setLoading(true);

    try {

      const res = await fetch("/api/chat", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ step, answer }),

      });

      const data = await res.json();

      // Show assistant reply

      if (data?.reply) {

        setMessages((prev) => [

          ...prev,

          { role: "assistant", content: String(data.reply) },

        ]);

      }

      const apiDone = Boolean(data?.done);

      setDone(apiDone);

      // Build answers synchronously (no React timing issues)

      const updatedAnswers = { ...answers, [step]: answer };

      setAnswers(updatedAnswers);

      // Move step only if API says so

      const nextStep = Number(data?.nextStep);

      if (Number.isFinite(nextStep) && nextStep >= 1 && nextStep <= 5) {

        setStep(nextStep);

      }

      // ✅ SAVE TO localStorage ONLY WHEN COMPLETED

      if (apiDone) {

        const record = {

          id: Math.random().toString(36).slice(2),

          name: updatedAnswers[1] ?? "",

          department: updatedAnswers[2] ?? "",

          supervisor: updatedAnswers[3] ?? "",

          email: updatedAnswers[4] ?? "",

          startDate: updatedAnswers[5] ?? "",

          completedAt: new Date().toISOString(),

        };



        const raw = localStorage.getItem("onboardings");

        const list = raw ? JSON.parse(raw) : [];

        const next = Array.isArray(list) ? [...list, record] : [record];

        localStorage.setItem("onboardings", JSON.stringify(next));



        console.log("✅ Saved onboarding", record);

      }

    } catch {

      setMessages((prev) => [

        ...prev,

        { role: "assistant", content: "Network error — please try again." },

      ]);

    } finally {

      setLoading(false);

    }

  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") send();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="w-full max-w-xl rounded-3xl bg-black/40 border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
              💬
            </div>
            <div>
              <h1 className="text-white text-2xl font-semibold">New Hire Onboarding</h1>
              <p className="text-white/70 text-sm">Hourly Employee Welcome Chat</p>
            </div>
            <div className="ml-auto text-white/70 text-sm">{stepLabel}</div>
          </div>

          <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-emerald-400"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>

          <div className="mt-6 space-y-3 max-h-[52vh] overflow-auto pr-1">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-emerald-500/25 border border-emerald-400/30 text-white"
                      : "bg-sky-500/20 border border-sky-400/25 text-white"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-sky-500/20 border border-sky-400/25 text-white/80">
                  Typing…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="mt-6 flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loading || done}
              placeholder={done ? "All set!" : "Type your answer…"}
              className="flex-1 rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/25"
            />
            <button
              onClick={send}
              disabled={loading || done}
              className="rounded-2xl px-5 py-3 bg-emerald-500/70 hover:bg-emerald-500 text-white font-medium disabled:opacity-40"
            >
              Send
            </button>
          </div>

          {done && (
            <div className="mt-6 text-center">
              <div className="text-white text-lg font-semibold">Done! 🚀</div>
              <div className="text-white/70 text-sm">
                If you need more help, ask your manager anytime.
              </div>
              <div className="mt-3">
                <Link
                  href="/manager"
                  className="inline-block rounded-2xl px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm"
                >
                  View Manager Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
