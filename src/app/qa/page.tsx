"use client";

import { useState, useEffect } from "react";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  chunks: string[];
}

interface Classification {
  type: string;
  title: string;
  confidence: number;
}

interface UploadedDoc {
  document: Document;
  classification?: Classification;
  extractedData?: any;
  summary?: string;
  chunksCount: number;
}

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
  supplier_invoice: "Supplier Invoice",
  other: "Document",
};

export default function QAPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadedDoc | null>(null);
  const [sources, setSources] = useState(0);
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (data.success) {
        setUploadResult(data);
        fetchDocuments();
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      fetchDocuments();
      setUploadResult(null);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setAnswer(data.answer || "No answer found");
      setSources(data.sources || 0);
      setConfidence(data.confidence || 0);
    } catch (error) {
      console.error("Ask failed:", error);
      setAnswer("Failed to get answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderExtractedData = (data: any, type: string) => {
    if (!data) return null;

    const items: string[] = [];

    if (data.policies?.length) {
      items.push(`📋 ${data.policies.length} policies extracted`);
    }
    if (data.requirements?.length) {
      const req = data.requirements[0];
      if (req.ppe?.length) {
        items.push(`🥽 PPE: ${req.ppe.join(", ")}`);
      }
      if (req.emergencyContacts?.length) {
        items.push(`📞 ${req.emergencyContacts.length} emergency contacts`);
      }
    }
    if (data.shifts?.length) {
      items.push(`📅 ${data.shifts.length} shift entries`);
    }
    if (data.vehicles?.length) {
      items.push(`🚗 ${data.vehicles.length} vehicles`);
    }
    if (data.invoices?.length) {
      items.push(`🧾 ${data.invoices.length} invoices`);
    }
    if (data.commissions?.length) {
      items.push(`💵 ${data.commissions.length} commission records`);
    }

    if (items.length === 0) return null;

    return (
      <div className="mt-2 text-sm text-gray-600">
        {items.map((item, i) => (
          <div key={i}>{item}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sidekick AI Q&A</h1>
        <p className="text-gray-600 mb-8">Upload company documents and ask questions</p>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">📁 Documents</h2>
          
          <label className="block">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Analyzing document...</span>
                </div>
              ) : (
                <>
                  <div className="text-4xl mb-2">📄</div>
                  <p className="text-gray-600">Click to upload PDF, TXT, or DOCX</p>
                  <p className="text-sm text-gray-400 mt-1">Our AI will automatically classify and extract key information</p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.txt,.docx"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>

          {/* Upload Result with Classification */}
          {uploadResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div className="flex-1">
                  <p className="font-medium text-green-800">
                    Uploaded "{uploadResult.document.name}"
                  </p>
                  
                  {uploadResult.classification && (
                    <div className="mt-2 p-3 bg-white rounded-lg border border-green-100">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {typeIcons[uploadResult.classification.type] || "📄"}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {typeLabels[uploadResult.classification.type] || "Document"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {uploadResult.classification.title}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            uploadResult.classification.confidence > 0.8 
                              ? "bg-green-100 text-green-700"
                              : uploadResult.classification.confidence > 0.5
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {Math.round(uploadResult.classification.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                      
                      {renderExtractedData(uploadResult.extractedData, uploadResult.classification.type)}
                    </div>
                  )}
                  
                  <p className="text-sm text-green-600 mt-2">
                    {uploadResult.chunksCount} sections processed
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Document List */}
          {documents.length > 0 && (
            <div className="mt-4 space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <div>
                      <p className="font-medium text-gray-800">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        {doc.chunks?.length || 0} sections
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Q&A Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">💬 Ask a Question</h2>

          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Ask a question about your documents..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={handleAsk}
              disabled={loading || !question.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>

          {/* Quick Questions */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {["Where do I park?", "What PPE do I need?", "What are break times?", "Who do I call for emergencies?"].map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuestion(q);
                  setTimeout(handleAsk, 100);
                }}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Answer */}
          {answer && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="prose prose-sm max-w-none">
                {answer.split("\n").map((line, i) => (
                  <p key={i} className={line.startsWith("**") ? "font-semibold" : ""}>
                    {line.replace(/\*\*/g, "")}
                  </p>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  📚 {sources} sources
                </span>
                <span className={`text-sm ${confidence >= 80 ? "text-green-600" : confidence >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                  {confidence}% confidence
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-8">
          Powered by Sidekick AI • Document Intelligence
        </p>
      </div>
    </div>
  );
}
