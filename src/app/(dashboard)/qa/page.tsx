"use client";
import React from "react";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Upload, 
  FileText, 
  Loader2,
  CheckCircle,
  Globe,
  Sparkles,
  MessageSquare,
  X,
  ChevronRight, Home, BookOpen, Shield, Calendar, DollarSign, GraduationCap, Settings, AlertTriangle, File
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  classification?: {
    type: string;
    title: string;
    confidence: number;
  };
}

interface Message {
  role: "user" | "assistant";
  content: string;
  confidence?: number;
  sources?: number;
  language?: string;
}

export default function QAInterface() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchDocuments = async () => {
    const res = await fetch("/api/documents");
    const data = await res.json();
    setDocuments(data.documents || []);
  };

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      await fetch("/api/documents", { method: "POST", body: formData });
    }
    setUploading(false);
    fetchDocuments();
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage }),
      });

      const data = await res.json();
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.answer,
        confidence: data.confidence,
        sources: data.sources,
        language: data.languageName,
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        confidence: 0,
      }]);
    }

    setLoading(false);
  };

  const typeIcons: Record<string, any> = {
    handbook: BookOpen,
    safety_manual: Shield,
    shift_schedule: Calendar,
    payroll_info: DollarSign,
    training_material: GraduationCap,
    equipment_manual: Settings,
    emergency_procedures: AlertTriangle,
    other: File,
  };

  const suggestedQuestions = [
    "Where do I park?",
    "What are the break times?",
    "What PPE do I need?",
    "Who do I call in an emergency?",
    "How do I request time off?",
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1e293b] flex flex-col">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Navigation */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-center">
        <span className="text-sm text-blue-700">Demo Mode — Testing Sidekick Q&A with sample documents</span>
      </div>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center">
                  <img src="/images/logo/sidekick-logo-blue.png" alt="Sidekick" className="w-8 h-8" />
                </div>
                <span className="font-semibold text-[#1e293b]">Sidekick</span>
              </Link>
              
              <span className="text-[#d9d0c3]">|</span>
              
              <span className="text-sm text-[#64748b]">Q&A Test Interface</span>
            </div>

            <div className="flex items-center gap-2"><Link href="/manager" className="text-sm text-blue-600 hover:text-blue-700">Manager Dashboard</Link><Link href="/" className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"><Home className="w-5 h-5" /></Link></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-6 flex flex-col">
        <div className="grid lg:grid-cols-3 gap-6 flex-1">
          {/* Chat Area - 2 columns */}
          <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl flex flex-col min-h-[600px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-zinc-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-[#1e293b]">Ask Sidekick</h2>
                <p className="text-xs text-[#64748b]">Test your documents with real questions</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-[#1e293b] mb-2">Ready to help!</h3>
                  <p className="text-sm text-[#64748b] max-w-xs mb-6">
                    {documents.length > 0 
                      ? "Ask any question about your uploaded documents."
                      : "Upload some documents first, then ask questions."}
                  </p>
                  
                  {documents.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2">
                      {suggestedQuestions.slice(0, 3).map((q, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(q)}
                          className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-full text-sm text-zinc-700 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-100 text-[#1e293b]"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      
                      {msg.role === "assistant" && msg.confidence !== undefined && (
                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-zinc-200">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            msg.confidence >= 80 
                              ? "bg-green-100 text-green-700" 
                              : msg.confidence >= 50 
                                ? "bg-yellow-100 text-yellow-700" 
                                : "bg-red-100 text-red-700"
                          }`}>
                            {msg.confidence}% confidence
                          </span>
                          {msg.sources && msg.sources > 0 && (
                            <span className="text-xs text-[#64748b]">
                              {msg.sources} source{msg.sources > 1 ? 's' : ''}
                            </span>
                          )}
                          {msg.language && msg.language !== "English" && (
                            <span className="text-xs text-[#64748b] flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {msg.language}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-[#64748b] animate-spin" />
                      <span className="text-sm text-[#64748b]">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-200">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={documents.length > 0 ? "Ask a question..." : "Upload documents first..."}
                  disabled={documents.length === 0}
                  className="flex-1 px-4 py-3 bg-[#fafafa] border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading || documents.length === 0}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upload */}
            <div className="bg-white border border-zinc-200 rounded-2xl">
              <div className="p-4 border-b border-zinc-200">
                <h3 className="font-semibold text-[#1e293b]">Documents</h3>
              </div>
              
              {/* Upload Zone */}
              <div className="p-4">
                <label className="block">
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    uploading 
                      ? "border-blue-300 bg-blue-50" 
                      : "border-zinc-300 hover:border-blue-400 hover:bg-blue-50/50"
                  }`}>
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
                    )}
                    <p className="text-sm text-zinc-600">
                      {uploading ? "Uploading..." : "Drop files or click to upload"}
                    </p>
                    <p className="text-xs text-[#94a3b8] mt-1">PDF, TXT, DOC</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={(e) => e.target.files && handleUpload(e.target.files)}
                  />
                </label>
              </div>

              {/* Document List */}
              <div className="border-t border-zinc-100 divide-y divide-zinc-100 max-h-80 overflow-y-auto">
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <div key={doc.id} className="p-3 hover:bg-[#fafafa] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {React.createElement(typeIcons[doc.classification?.type || "other"], { className: "w-5 h-5 text-blue-500" })}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1e293b] truncate">{doc.name}</p>
                          {doc.classification && (
                            <p className="text-xs text-[#64748b] flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {Math.round(doc.classification.confidence * 100)}% match
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <FileText className="w-8 h-8 text-[#d9d0c3] mx-auto mb-2" />
                    <p className="text-sm text-[#64748b]">No documents yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Suggested Questions */}
            {documents.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-4">
                <h3 className="font-semibold text-[#1e293b] mb-3">Try asking</h3>
                <div className="space-y-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="w-full text-left px-3 py-2 bg-[#fafafa] hover:bg-zinc-100 rounded-lg text-sm text-zinc-700 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Tip: How it works</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>1. Upload your documents (handbooks, manuals)</li>
                <li>2. AI automatically classifies and indexes them</li>
                <li>3. Ask questions in any language</li>
                <li>4. Get instant, accurate answers</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <p className="text-sm text-[#94a3b8] text-center">
            Powered by Sidekick AI • Testing interface for managers
          </p>
        </div>
      </footer>
    </div>
  );
}
