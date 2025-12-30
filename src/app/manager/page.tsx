"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Document = {
  id: string;
  filename: string;
  type: string;
  title: string;
  uploadedAt: number;
  pageCount?: number;
  extractedData?: any;
};

export default function ManagerDashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [grouped, setGrouped] = useState<Record<string, Document[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  useEffect(() => {
    fetch("/api/documents/list?companyId=demo")
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setDocuments(data.documents);
          setGrouped(data.grouped);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const typeLabels: Record<string, string> = {
    handbook: "📘 Employee Handbooks",
    safety_manual: "⚠️ Safety Manuals",
    shift_schedule: "📅 Shift Schedules",
    payroll_info: "💰 Payroll Information",
    training_material: "📚 Training Materials",
    equipment_manual: "🔧 Equipment Manuals",
    emergency_procedures: "🚨 Emergency Procedures",
    inventory_manifest: "📦 Inventory",
    commission_sheet: "💵 Commission Sheets",
    repair_order: "🔨 Repair Orders",
    vehicle_inventory: "🚗 Vehicle Inventory",
    supplier_invoice: "📄 Supplier Invoices",
    other: "📄 Other Documents",
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
        <div className="text-center text-white text-xl">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Manager Dashboard</h1>
            <p className="text-white/70">
              {documents.length} document{documents.length !== 1 ? 's' : ''} • 
              {Object.values(grouped).some(docs => docs.some(d => d.extractedData)) && (
                <span className="text-emerald-400 ml-2">✨ Smart data extraction enabled</span>
              )}
            </p>
          </div>
          <Link 
            href="/manager/upload"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition"
          >
            + Upload Documents
          </Link>
        </div>

        {documents.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📁</div>
            <h2 className="text-2xl font-semibold text-white mb-2">No documents yet</h2>
            <p className="text-white/70 mb-6">Upload your first company document to get started</p>
            <Link 
              href="/manager/upload"
              className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition"
            >
              Upload Documents
            </Link>
          </div>
        )}

        {Object.entries(grouped).map(([type, docs]) => (
          <div key={type} className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              {typeLabels[type] || "📄 " + type}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {docs.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition cursor-pointer"
                >
                  <h3 className="text-white font-semibold mb-2 line-clamp-2">
                    {doc.title}
                  </h3>
                  <p className="text-white/50 text-sm mb-3">{doc.filename}</p>
                  {doc.extractedData && Object.keys(doc.extractedData).length > 0 && (
                    <div className="mb-3">
                      <span className="text-emerald-400 text-xs">
                        ✨ {Object.keys(doc.extractedData)[0]} extracted
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>{doc.pageCount ? `${doc.pageCount} pages` : "PDF"}</span>
                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {documents.length > 0 && (
          <div className="mt-12 bg-white/5 border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Link
                href="/qa"
                className="p-6 bg-blue-500/20 border border-blue-400/25 rounded-xl hover:bg-blue-500/30 transition"
              >
                <div className="text-3xl mb-2">💬</div>
                <h3 className="text-white font-semibold mb-1">Test Q&A Interface</h3>
                <p className="text-white/70 text-sm">See how workers will ask questions</p>
              </Link>
              <Link
                href="/manager/upload"
                className="p-6 bg-emerald-500/20 border border-emerald-400/25 rounded-xl hover:bg-emerald-500/30 transition"
              >
                <div className="text-3xl mb-2">📄</div>
                <h3 className="text-white font-semibold mb-1">Upload More Documents</h3>
                <p className="text-white/70 text-sm">Add handbooks, schedules, manuals</p>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Document detail modal */}
      {selectedDoc && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-8 z-50"
          onClick={() => setSelectedDoc(null)}
        >
          <div 
            className="bg-slate-900 border border-white/20 rounded-2xl p-8 max-w-3xl max-h-[80vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">{selectedDoc.title}</h2>
            <p className="text-white/70 mb-6">{selectedDoc.filename}</p>
            
            {selectedDoc.extractedData && Object.keys(selectedDoc.extractedData).length > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-xl p-6 mb-6">
                <h3 className="text-emerald-400 font-semibold mb-3">✨ Extracted Data</h3>
                <pre className="text-white/80 text-sm overflow-auto">
                  {JSON.stringify(selectedDoc.extractedData, null, 2)}
                </pre>
              </div>
            )}
            
            <button
              onClick={() => setSelectedDoc(null)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
