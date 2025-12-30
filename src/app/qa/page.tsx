"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  image?: string;
  sources?: Array<{ id: string; title: string; type: string }>;
};

export default function QAPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm Sidekick. Ask me anything about your new job! You can also upload photos." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function sendQuestion() {
    if ((!input.trim() && !selectedImage) || loading) return;
    
    const question = input.trim();
    const imageData = selectedImage;
    const startTime = Date.now();
    
    setInput("");
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    setMessages(prev => [...prev, { 
      role: "user", 
      content: question || "What is this?",
      image: imageData || undefined
    }]);
    setLoading(true);

    try {
      const res = await fetch("/api/handbook/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: question || "What is this? Please describe what you see.",
          image: imageData 
        })
      });

      const data = await res.json();
      const responseTime = Date.now() - startTime;

      if (data.ok && data.answer) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.answer,
          sources: data.sources || []
        }]);

        // Log analytics
        fetch("/api/analytics/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyId: "demo",
            question: question || "[Photo Question]",
            answer: data.answer,
            sources: data.sources || [],
            method: "web",
            responseTime,
            hasImage: !!imageData
          })
        }).catch(err => console.error("Analytics log failed:", err));
      } else {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Sorry, I couldn't analyze that. Please ask your manager."
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
              <p className="text-white/70 text-sm">Ask questions or upload photos</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i}>
              <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%]`}>
                  {msg.image && (
                    <div className="mb-2">
                      <img 
                        src={msg.image} 
                        alt="Uploaded" 
                        className="rounded-xl max-w-full max-h-64 object-contain border border-white/20"
                      />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-emerald-500/25 border border-emerald-400/30 text-white"
                        : "bg-blue-500/20 border border-blue-400/25 text-white"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex justify-start mt-2">
                  <div className="flex gap-2 flex-wrap">
                    {msg.sources.map((source, idx) => (
                      <div
                        key={idx}
                        className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/60"
                      >
                        📄 {source.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-blue-500/20 border border-blue-400/25 rounded-2xl px-4 py-3 text-white/70">
                Analyzing...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-6 border-t border-white/10">
          {selectedImage && (
            <div className="mb-3 relative inline-block">
              <img 
                src={selectedImage} 
                alt="Selected" 
                className="h-20 rounded-lg border border-emerald-400/30"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          )}
          
          <div className="flex gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="rounded-2xl px-4 py-3 bg-purple-500/80 hover:bg-purple-500 text-white font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              📷
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
              placeholder="Type your question or upload a photo..."
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
