"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Message = { role: "user" | "assistant"; content: string; sources?: string[] };

function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8 Q4 4 8 4 L40 4 Q44 4 44 8 L44 32 Q44 36 40 36 L16 36 L8 44 L8 36 Q4 36 4 32 Z" fill="#0ea5e9"/>
      <rect x="20" y="16" width="8" height="3" rx="1.5" fill="white"/>
      <circle cx="15" cy="17" r="7" stroke="white" strokeWidth="3" fill="none"/>
      <circle cx="33" cy="17" r="7" stroke="white" strokeWidth="3" fill="none"/>
      <circle cx="15" cy="16" r="2.5" fill="#1e293b"/>
      <circle cx="33" cy="16" r="2.5" fill="#1e293b"/>
      <path d="M19 28 Q24 31 29 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export default function QAPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm Sidekick. Ask me anything about your new job!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendQuestion() {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const res = await fetch("/api/handbook/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.ok && data.answer ? data.answer : data.error || "Sorry, I couldn't find an answer.",
        sources: data.sources?.map((s: { title?: string }) => s.title || "Document") || []
      }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900">
      <nav className="px-6 md:px-24 py-4 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo size={32} />
          <span className="text-white text-xl font-bold">Sidekick</span>
        </Link>
        <Link href="/manager" className="text-white/70 text-sm hover:text-white transition-colors">Manager Dashboard →</Link>
      </nav>

      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-sky-500/20 to-transparent">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/25">
                <Logo size={36} />
              </div>
              <div>
                <h1 className="text-white text-2xl font-bold">Sidekick Assistant</h1>
                <p className="text-sky-200 text-sm">Ask me anything about your job</p>
              </div>
            </div>
          </div>

          <div className="h-[500px] overflow-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.role === "user" ? "bg-sky-500 text-white" : "bg-white/10 border border-white/20 text-white"}`}>
                  <p>{msg.content}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <p className="text-sky-200 text-xs mt-2 pt-2 border-t border-white/10">Source: {msg.sources.join(", ")}</p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-6 border-t border-white/10 bg-white/5">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
                placeholder="Type your question..."
                disabled={loading}
                className="flex-1 rounded-xl bg-white/10 border border-white/20 px-5 py-4 text-white placeholder:text-white/50 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 disabled:opacity-50 transition-all"
              />
              <button onClick={sendQuestion} disabled={loading} className="rounded-xl px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold disabled:opacity-50 transition-all shadow-lg shadow-sky-500/25 hover:shadow-xl">Send</button>
            </div>
            <p className="text-white/40 text-xs text-center mt-4">Try: "Where do I park?" • "What are the work hours?" • "What safety gear do I need?"</p>
          </div>
        </div>
      </div>
    </main>
  );
}
