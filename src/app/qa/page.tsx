"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

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

interface Message {
  id: number;
  type: "user" | "bot";
  text: string;
  sources?: number;
  confidence?: number;
  needsDocuments?: boolean;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  chunks: string[];
}

export default function QAPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "bot",
      text: "👋 Hi! I'm Sidekick, your AI assistant. Upload your company documents (handbooks, SOPs, safety manuals) and I'll answer any questions about them.\n\nTry uploading a document or ask me a question!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (e) {
      console.error("Failed to fetch documents", e);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        
        if (data.success) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: "bot",
              text: `✅ Uploaded "${file.name}" successfully! I've processed ${data.document.chunks.length} sections. You can now ask questions about this document.`,
            },
          ]);
        }
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "bot",
            text: `❌ Failed to upload "${file.name}". Please try again.`,
          },
        ]);
      }
    }

    setUploading(false);
    setShowUpload(false);
    fetchDocuments();
  };

  const deleteDocument = async (id: string) => {
    try {
      await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      fetchDocuments();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          text: "Document removed.",
        },
      ]);
    } catch (e) {
      console.error("Failed to delete document", e);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.text }),
      });
      const data = await res.json();

      const botMessage: Message = {
        id: Date.now() + 1,
        type: "bot",
        text: data.answer,
        sources: data.sources,
        confidence: data.confidence,
        needsDocuments: data.needsDocuments,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          text: "Sorry, something went wrong. Please try again.",
        },
      ]);
    }

    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-gray-900 text-xl font-bold">Sidekick</span>
            <span className="text-gray-400 text-sm ml-2">Q&A Demo</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/manager" className="text-gray-600 hover:text-gray-900 text-sm">
              Manager Dashboard
            </Link>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span>📄</span> Upload Docs
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-5xl mx-auto w-full flex">
        {/* Main Chat */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl px-5 py-4 ${
                    message.type === "user"
                      ? "bg-sky-500 text-white"
                      : "bg-white border border-gray-200 text-gray-800 shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{message.text}</p>
                  {message.type === "bot" && message.sources !== undefined && message.sources > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-sm">
                      <span className="text-gray-500">
                        📚 {message.sources} source{message.sources > 1 ? "s" : ""}
                      </span>
                      <span className="text-green-600 font-medium">
                        {message.confidence}% confidence
                      </span>
                    </div>
                  )}
                  {message.needsDocuments && (
                    <button
                      onClick={() => setShowUpload(true)}
                      className="mt-3 px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Upload Documents →
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-4">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your documents..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-xl font-medium transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar - Documents */}
        {showUpload && (
          <div className="w-80 border-l border-gray-200 bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Documents</h3>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-sky-400 rounded-xl p-6 text-center cursor-pointer transition-colors mb-4"
            >
              <div className="text-3xl mb-2">📄</div>
              <p className="text-sm text-gray-600 font-medium">Click to upload</p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOC, TXT</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </div>

            {uploading && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </div>
            )}

            {/* Document List */}
            <div className="space-y-2">
              {documents.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No documents uploaded yet</p>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 text-xs font-bold">
                          {doc.name.split(".").pop()?.toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-400">{doc.chunks.length} sections</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      🗑
                    </button>
                  </div>
                ))
              )}
            </div>

            {documents.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  ✓ {documents.length} document{documents.length > 1 ? "s" : ""} ready
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Ask questions and I'll search through them
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
