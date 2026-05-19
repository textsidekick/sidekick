"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

interface Message {
  role: "worker" | "sidekick";
  text: string;
}

const SUGGESTIONS = [
  "What's the PTO policy?",
  "How do I clock in?",
  "Who's my supervisor?",
  "What's the dress code?",
  "Where do I park?",
];

interface Props { companyId: string; }

export default function SMSSimulator({ companyId }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "sidekick", text: "Hey! I'm Sidekick, your company's AI assistant. Ask me anything about your workplace." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const question = text.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "worker", text: question }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, question }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "sidekick", text: data.answer || data.response || data.message || "I couldn't find an answer to that. Try uploading more company documents." }]);
    } catch {
      setMessages(prev => [...prev, { role: "sidekick", text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Phone frame */}
      <div className="w-[340px] bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
        {/* Notch */}
        <div className="flex justify-center mb-1">
          <div className="w-28 h-6 bg-gray-900 rounded-b-2xl relative -mt-0.5">
            <div className="absolute inset-x-0 top-1 flex justify-center">
              <div className="w-16 h-4 bg-black rounded-full" />
            </div>
          </div>
        </div>

        {/* Screen */}
        <div className="bg-white rounded-[2rem] overflow-hidden flex flex-col" style={{ height: 520 }}>
          {/* Header */}
          <div className="bg-[#C96442] px-4 py-3 text-center">
            <p className="text-white text-sm font-semibold">Sidekick</p>
            <p className="text-white/70 text-[10px]">Text-based AI assistant</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "worker" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "worker"
                    ? "bg-blue-500 text-white rounded-br-md"
                    : "bg-white text-gray-900 border border-gray-200 rounded-bl-md shadow-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-3 py-2 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && !loading && (
            <div className="px-3 py-2 flex gap-1.5 overflow-x-auto border-t border-gray-100">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="flex-shrink-0 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-[11px] font-medium hover:bg-gray-200 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-2 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                placeholder="Type a question..."
                className="flex-1 px-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#C96442]"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="p-2 bg-[#C96442] text-white rounded-full hover:bg-[#b5573a] disabled:opacity-40 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
