"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ title: string; type: string }>;
};

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

      if (data.ok && data.answer) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.answer,
          sources: data.sources
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Sorry, I couldn't find an answer. Please ask your manager."
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Network error. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-2xl h-[85vh] rounded-3xl bg-black/40 border border-white/10 shadow-2xl flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl">
              🤖
            </div>
            <div>
              <h1 className="text-white text-2xl font-semibold">Sidekick Assistant</h1>
              <p className="text-white/70 text-sm">Ask me anything about work</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i}>
              <div
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-emerald-500/25 border border-emerald-400/30 text-white"
                      : "bg-blue-500/20 border border-blue-400/25 text-white"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex justify-start mt-2">
                  <div className="max-w-[80%] text-xs text-white/50 px-4">
                    📚 Sources: {msg.sources.map(s => s.title).join(", ")}
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-blue-500/20 border border-blue-400/25 rounded-2xl px-4 py-3 text-white/70">
                Thinking...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-6 border-t border-white/10">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
              placeholder="Type your question..."
              disabled={loading}
              className="flex-1 rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/40 disabled:opacity-50"
            />
            <button
              onClick={sendQuestion}
              disabled={loading}
              className="rounded-2xl px-6 py-3 bg-emerald-500/80 hover:bg-emerald-500 text-white font-semibold disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
