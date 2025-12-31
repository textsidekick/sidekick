"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

type Document = { id: string; filename: string; type: string; title: string; uploadedAt: number };

export default function ManagerPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/documents/list?companyId=demo")
      .then(res => res.json())
      .then(data => { setDocuments(data.documents || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const typeColors: Record<string, string> = {
    handbook: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    safety_manual: "bg-red-500/20 text-red-300 border-red-500/30",
    training_material: "bg-green-500/20 text-green-300 border-green-500/30",
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900">
      <nav className="px-6 md:px-24 py-4 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo size={32} />
          <span className="text-white text-xl font-bold">Sidekick</span>
        </Link>
        <Link href="/qa" className="text-white/70 text-sm hover:text-white transition-colors">Test Q&A →</Link>
      </nav>

      <div className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Manager Dashboard</h1>
            <p className="text-sky-200">Manage your company documents and monitor usage</p>
          </div>
          <Link href="/manager/upload" className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/25 hover:shadow-xl flex items-center gap-2">
            <span className="text-xl">+</span> Upload Documents
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Documents", value: documents.length, icon: "📄" },
            { label: "Questions Today", value: "—", icon: "💬" },
            { label: "Accuracy Rate", value: "95%", icon: "✅" },
            { label: "Time Saved", value: "12h", icon: "⏱️" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sky-200 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Uploaded Documents</h2>
          {loading ? (
            <div className="text-center py-12 text-white/60">Loading...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-white mb-2">No documents yet</h3>
              <p className="text-white/60 mb-6">Upload your first handbook to get started</p>
              <Link href="/manager/upload" className="inline-block px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-all">Upload Documents</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center text-2xl">📄</div>
                    <div>
                      <h3 className="text-white font-medium">{doc.title || doc.filename}</h3>
                      <p className="text-white/60 text-sm">{doc.filename}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs border ${typeColors[doc.type] || "bg-gray-500/20 text-gray-300 border-gray-500/30"}`}>{doc.type.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
