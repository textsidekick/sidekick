"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ id: string; title: string; type: string }>;
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
          sources: data.sources || []
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.error || "Sorry, I couldn't find an answer. Please ask your manager."
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
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl">🤖</div>
            <span className="text-xl font-semibold text-gray-900">Sidekick</span>
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition text-sm">
            ← Back to home
          </Link>
        </div>
      </nav>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-[calc(100vh-12rem)] flex flex-col">
          
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                🤖
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Sidekick Assistant</h1>
                <p className="text-sm text-gray-600">Ask me anything about work</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[80%]">
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {msg.content}
                  </div>
                  
                  {/* Show sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      📄 Sources: {msg.sources.map(s => s.title).join(", ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 text-gray-600">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
                placeholder="Type your question..."
                disabled={loading}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
              />
              <button
                onClick={sendQuestion}
                disabled={loading}
                className="rounded-xl px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
