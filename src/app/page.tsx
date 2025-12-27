"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Msg = { role: "assistant" | "user"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "👋 Hi, and welcome! What’s your preferred first name?" },
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(1); // 1..5
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const stepLabel = useMemo(() => `Step ${step} of 5`, [step]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    if (loading || done) return;
    const answer = input.trim();
    if (!answer) return;

    // add user message immediately
    setMessages((prev) => [...prev, { role: "user", content: answer }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step,
          answer,
          // include chat context if you want later; backend currently ignores it
          messages,
        }),
      });

      const data = await res.json();

      // Always show assistant reply if present
      if (data?.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: String(data.reply) }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry — I didn’t catch that. Could you try again?" },
        ]);
      }

      // CRITICAL: completion only depends on API `done`
      const apiDone = Boolean(data?.done);
      setDone(apiDone);

      // CRITICAL: step only moves if API says so
      const nextStep = Number(data?.nextStep);
      if (Number.isFinite(nextStep) && nextStep >= 1 && nextStep <= 5) {
        setStep(nextStep);
      }
    } catch (e) {
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
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
