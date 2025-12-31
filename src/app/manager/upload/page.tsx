"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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

type UploadDoc = { id: string; file: File; status: "pending" | "uploading" | "success" | "error"; result?: string };

export default function UploadPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<UploadDoc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback((files: FileList) => {
    const newDocs = Array.from(files).filter(f => f.type === "application/pdf").map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      status: "pending" as const
    }));
    setDocuments(prev => [...prev, ...newDocs]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const uploadAll = async () => {
    if (documents.length === 0) return;
    setUploading(true);
    for (const doc of documents) {
      if (doc.status !== "pending") continue;
      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: "uploading" } : d));
      try {
        const formData = new FormData();
        formData.append("file", doc.file);
        formData.append("companyId", "demo");
        const res = await fetch("/api/documents/upload", { method: "POST", body: formData });
        const data = await res.json();
        setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: data.ok ? "success" : "error", result: data.classification?.title || data.error } : d));
      } catch {
        setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: "error", result: "Upload failed" } : d));
      }
    }
    setUploading(false);
    setTimeout(() => router.push("/manager"), 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900">
      <nav className="px-6 md:px-24 py-4 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo size={32} />
          <span className="text-white text-xl font-bold">Sidekick</span>
        </Link>
        <Link href="/manager" className="text-white/70 text-sm hover:text-white transition-colors">← Back to Dashboard</Link>
      </nav>

      <div className="max-w-4xl mx-auto p-6 md:p-12">
        <h1 className="text-3xl font-bold text-white mb-2">Upload Documents</h1>
        <p className="text-sky-200 mb-8">Add handbooks, safety manuals, and procedures</p>

        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${dragActive ? "border-sky-500 bg-sky-500/10" : "border-white/20 hover:border-white/40"}`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-white mb-2">Drop PDF files here</h3>
          <p className="text-white/60 mb-4">or click to browse</p>
          <input type="file" accept=".pdf" multiple onChange={(e) => e.target.files && handleFiles(e.target.files)} className="hidden" id="file-input" />
          <label htmlFor="file-input" className="inline-block px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl cursor-pointer transition-all">Select Files</label>
        </div>

        {documents.length > 0 && (
          <div className="mt-8 space-y-3">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{doc.status === "success" ? "✅" : doc.status === "error" ? "❌" : doc.status === "uploading" ? "⏳" : "📄"}</div>
                  <div>
                    <p className="text-white font-medium">{doc.file.name}</p>
                    {doc.result && <p className="text-white/60 text-sm">{doc.result}</p>}
                  </div>
                </div>
                {doc.status === "pending" && (
                  <button onClick={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                )}
              </div>
            ))}
          </div>
        )}

        {documents.some(d => d.status === "pending") && (
          <button onClick={uploadAll} disabled={uploading} className="mt-6 w-full px-6 py-4 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-600 text-white font-semibold rounded-xl transition-all">
            {uploading ? "Uploading..." : `Upload ${documents.filter(d => d.status === "pending").length} Document(s)`}
          </button>
        )}
      </div>
    </main>
  );
}
