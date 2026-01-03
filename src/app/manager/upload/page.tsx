"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { 
  FileText, 
  Upload, 
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  ChevronRight,
  FileUp,
  Settings
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  chunks?: string[];
  classification?: {
    type: string;
    title: string;
    confidence: number;
  };
}

export default function ManagerUpload() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const res = await fetch("/api/documents");
    const data = await res.json();
    setDocuments(data.documents || []);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = async (files: FileList) => {
    setError(null);
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${file.name}...`);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }

        setUploadProgress(`Processing ${file.name}...`);
        await new Promise(r => setTimeout(r, 500)); // Brief delay to show processing
      } catch (err: any) {
        setError(err.message);
      }
    }

    setUploading(false);
    setUploadProgress(null);
    fetchDocuments();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    
    await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
    fetchDocuments();
  };

  const typeIcons: Record<string, string> = {
    handbook: "📘",
    safety_manual: "🦺",
    shift_schedule: "📅",
    payroll_info: "💰",
    training_material: "🎓",
    equipment_manual: "⚙️",
    emergency_procedures: "🚨",
    inventory_manifest: "📦",
    commission_sheet: "💵",
    repair_order: "🔧",
    vehicle_inventory: "🚗",
    supplier_invoice: "🧾",
    other: "📄",
  };

  const typeLabels: Record<string, string> = {
    handbook: "Employee Handbook",
    safety_manual: "Safety Manual",
    shift_schedule: "Shift Schedule",
    payroll_info: "Payroll Info",
    training_material: "Training Material",
    equipment_manual: "Equipment Manual",
    emergency_procedures: "Emergency Procedures",
    inventory_manifest: "Inventory",
    commission_sheet: "Commission Sheet",
    repair_order: "Repair Order",
    vehicle_inventory: "Vehicle Inventory",
    supplier_invoice: "Invoice",
    other: "Document",
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-semibold text-zinc-900">Sidekick</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-1">
                <Link 
                  href="/manager" 
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/manager/upload" 
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg"
                >
                  Documents
                </Link>
                <Link 
                  href="/manager/analytics" 
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Analytics
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">M</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
            <Link href="/manager" className="hover:text-zinc-600">Dashboard</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-zinc-600">Documents</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Document Management</h1>
          <p className="text-zinc-500 mt-1">Upload employee handbooks, safety manuals, and other documents. Our AI automatically classifies and indexes them.</p>
        </div>

        {/* Upload Zone */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-10 mb-8 transition-all ${
            dragActive 
              ? "border-blue-500 bg-blue-50" 
              : "border-zinc-300 bg-white hover:border-blue-400 hover:bg-blue-50/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            multiple
            accept=".pdf,.txt,.doc,.docx"
          />
          
          <div className="text-center">
            {uploading ? (
              <>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <p className="text-lg font-medium text-zinc-900">{uploadProgress}</p>
                <p className="text-sm text-zinc-500 mt-1">Please wait while we process your document</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileUp className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-lg font-medium text-zinc-900">
                  {dragActive ? "Drop files here" : "Drag and drop files here"}
                </p>
                <p className="text-sm text-zinc-500 mt-1">
                  or <span className="text-blue-600 font-medium">browse</span> to select files
                </p>
                <p className="text-xs text-zinc-400 mt-3">
                  Supports PDF, TXT, DOC, DOCX • Max 10MB per file
                </p>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Documents List */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-zinc-200">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900">
                Uploaded Documents ({documents.length})
              </h2>
            </div>
          </div>

          {documents.length > 0 ? (
            <div className="divide-y divide-zinc-100">
              {documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="p-5 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">
                        {typeIcons[doc.classification?.type || "other"]}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-zinc-900">{doc.name}</p>
                          {doc.classification ? (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-zinc-600">
                                {typeLabels[doc.classification.type] || "Document"}
                              </span>
                              <span className="text-zinc-300">•</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                doc.classification.confidence >= 80 
                                  ? "bg-green-100 text-green-700" 
                                  : doc.classification.confidence >= 50 
                                    ? "bg-yellow-100 text-yellow-700" 
                                    : "bg-zinc-100 text-zinc-600"
                              }`}>
                                {Math.round(doc.classification.confidence * 100)}% match
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mt-1">
                              <Loader2 className="w-3 h-3 text-zinc-400 animate-spin" />
                              <span className="text-sm text-zinc-400">Classifying...</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-zinc-400">
                        <span>{formatSize(doc.size)}</span>
                        <span>•</span>
                        <span>{formatDate(doc.uploadedAt)}</span>
                        {doc.chunks && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {doc.chunks.length} sections indexed
                            </span>
                          </>
                        )}
                      </div>

                      {/* Classification Title */}
                      {doc.classification?.title && (
                        <p className="text-sm text-zinc-500 mt-2 italic">
                          "{doc.classification.title}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="text-zinc-600 font-medium">No documents uploaded yet</p>
              <p className="text-sm text-zinc-400 mt-1">
                Upload your first document to get started
              </p>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for best results</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Upload your complete employee handbook for comprehensive coverage</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Include safety manuals, SOPs, and emergency procedures</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>PDF files with text (not scanned images) work best</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Documents are automatically classified and indexed by our AI</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">© 2026 Sidekick AI</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-zinc-400 hover:text-zinc-600">Privacy</Link>
              <Link href="/terms" className="text-sm text-zinc-400 hover:text-zinc-600">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
