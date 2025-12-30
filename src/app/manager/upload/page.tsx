"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DocumentWithStatus = {
  id: string;
  file: File;
  type: string;
  status: "pending" | "uploading" | "success" | "error";
  classification?: {
    type: string;
    title: string;
    confidence: number;
  };
  error?: string;
};

export default function UploadPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newDocs: DocumentWithStatus[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: "auto",
      status: "pending" as const,
    }));
    setDocuments(prev => [...prev, ...newDocs]);
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const updateDocType = (id: string, type: string) => {
    setDocuments(prev => prev.map(d =>
      d.id === id ? { ...d, type } : d
    ));
  };

  const uploadAll = async () => {
    if (documents.length === 0) return;

    setUploading(true);

    for (const doc of documents) {
      if (doc.status !== "pending") continue;

      try {
        setDocuments(prev => prev.map(d =>
          d.id === doc.id ? { ...d, status: "uploading" as const } : d
        ));

        const formData = new FormData();
        formData.append("file", doc.file);
        formData.append("companyId", "demo");
        if (doc.type !== "auto") {
          formData.append("type", doc.type);
        }

        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData
        });

        const data = await res.json();

        if (data.ok) {
          setDocuments(prev => prev.map(d =>
            d.id === doc.id 
              ? { ...d, status: "success" as const, classification: data.classification }
              : d
          ));
        } else {
          setDocuments(prev => prev.map(d =>
            d.id === doc.id 
              ? { ...d, status: "error" as const, error: data.error || "Upload failed" }
              : d
          ));
        }
      } catch (err) {
        setDocuments(prev => prev.map(d =>
          d.id === doc.id 
            ? { ...d, status: "error" as const, error: "Network error" }
            : d
        ));
      }
    }

    setUploading(false);
    
    const allSuccess = documents.every(d => d.status === "success" || d.status === "error");
    const hasSuccess = documents.some(d => d.status === "success");
    
    if (allSuccess && hasSuccess) {
      setTimeout(() => {
        router.push("/manager");
      }, 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-green-400";
      case "error": return "text-red-400";
      case "uploading": return "text-yellow-400";
      default: return "text-white/70";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return "✓";
      case "error": return "✗";
      case "uploading": return "⟳";
      default: return "○";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Upload Company Documents</h1>
          <p className="text-white/70">AI will automatically classify each document type</p>
        </div>

        <div className="mb-8">
          <label className="block w-full p-12 border-2 border-dashed border-white/20 rounded-2xl text-center cursor-pointer hover:border-emerald-500/50 hover:bg-white/5 transition">
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="text-6xl mb-4">📄</div>
            <div className="text-white text-lg font-semibold mb-2">
              Drop PDFs here or click to browse
            </div>
            <div className="text-white/50 text-sm">
              Handbooks, schedules, safety manuals, etc.
            </div>
          </label>
        </div>

        {documents.length > 0 && (
          <div className="mb-8 space-y-4">
            {documents.map(doc => (
              <div
                key={doc.id}
                className="bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-2xl ${getStatusColor(doc.status)}`}>
                        {getStatusIcon(doc.status)}
                      </span>
                      <h3 className="text-white font-semibold">{doc.file.name}</h3>
                    </div>
                    
                    {doc.classification && (
                      <div className="text-emerald-400 text-sm mb-2">
                        AI classified as: <strong>{doc.classification.title}</strong>
                        <span className="text-white/50 ml-2">
                          ({doc.classification.type}, {Math.round(doc.classification.confidence * 100)}% confidence)
                        </span>
                      </div>
                    )}

                    {doc.error && (
                      <div className="text-red-400 text-sm mb-2">
                        Error: {doc.error}
                      </div>
                    )}

                    <div className="text-white/50 text-sm">
                      {(doc.file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>

                  {doc.status === "pending" && (
                    <div className="flex gap-2">
                      <select
                        value={doc.type}
                        onChange={(e) => updateDocType(doc.id, e.target.value)}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                      >
                        <option value="auto">Auto-detect</option>
                        <option value="handbook">Handbook</option>
                        <option value="safety_manual">Safety Manual</option>
                        <option value="shift_schedule">Shift Schedule</option>
                        <option value="payroll_info">Payroll Info</option>
                        <option value="training_material">Training Material</option>
                        <option value="equipment_manual">Equipment Manual</option>
                        <option value="emergency_procedures">Emergency Procedures</option>
                      </select>

                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {documents.length > 0 && documents.some(d => d.status === "pending") && (
          <button
            onClick={uploadAll}
            disabled={uploading}
            className="w-full px-6 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 text-white text-lg font-semibold rounded-xl transition"
          >
            {uploading 
              ? "Uploading & Classifying..." 
              : `Upload ${documents.filter(d => d.status === "pending").length} Document${documents.filter(d => d.status === "pending").length > 1 ? 's' : ''}`
            }
          </button>
        )}

        {documents.length > 0 && documents.every(d => d.status !== "pending") && (
          <div className="text-center">
            <div className="text-green-400 text-xl font-semibold mb-2">
              ✓ Upload complete! {documents.filter(d => d.status === "success").length} successful, {documents.filter(d => d.status === "error").length} failed
            </div>
            {documents.some(d => d.status === "success") && (
              <div className="text-white/70">Redirecting to dashboard...</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
