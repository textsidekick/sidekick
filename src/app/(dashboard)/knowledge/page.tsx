"use client";

import React, { useEffect, useState, useRef } from "react";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Wrench, Clock, Hash, ChevronDown, ChevronUp, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentsTable } from "@/components/dashboard/documents/DocumentsTable";
import KnowledgeBaseViewer from "@/components/dashboard/documents/KnowledgeBaseViewer";
import GeneratedReports from "@/components/dashboard/documents/GeneratedReports";
import GoogleDriveIntegration from "@/components/GoogleDriveIntegration";
import DropboxIntegration from "@/components/DropboxIntegration";
import GustoIntegration from "@/components/GustoIntegration";
import MicrosoftTeamsIntegration from "@/components/MicrosoftTeamsIntegration";

interface KnowledgeArticle {
  id: string;
  title: string;
  problem: string;
  symptoms: string;
  solution: string;
  equipment_type: string;
  asset_name: string;
  parts_used: string[];
  tags: string[];
  time_estimate_minutes: number;
  times_referenced: number;
  source_work_order_id: string;
  created_at: string;
}

interface Document {
  id: string;
  name: string;
  uploadedAt: string;
  chunksCount?: number;
  classification?: { type: string; title: string; confidence: number };
}

type TabId = "articles" | "documents" | "integrations";

const TABS: { id: TabId; label: string }[] = [
  { id: "articles", label: "Articles" },
  { id: "documents", label: "Documents" },
  { id: "integrations", label: "Integrations" },
];

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<TabId>("articles");

  // Articles state
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showReviewOnly, setShowReviewOnly] = useState(false);

  // Documents state
  const [companyId, setCompanyId] = useState<string>("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load company from localStorage
  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
      if (auth.companyId) setCompanyId(auth.companyId);
    } catch {}
    const handleStorage = () => {
      try {
        const auth = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
        if (auth.companyId) setCompanyId(auth.companyId);
      } catch {}
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Load articles
  useEffect(() => {
    fetch("/api/knowledge")
      .then(r => r.json())
      .then(d => setArticles(d.articles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load documents when company is known
  useEffect(() => {
    if (companyId) {
      fetch(`/api/documents?companyId=${companyId}`)
        .then(r => r.json())
        .then(d => setDocuments(d.documents || []))
        .catch(() => {});
    }
  }, [companyId]);

  async function handleDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (companyId) fd.append("companyId", companyId);
      const res = await fetch("/api/documents", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setDocuments(prev => [...prev, { ...json.document, chunksCount: json.chunksCount, classification: json.classification }]);
      setUploadMsg(`Uploaded: ${file.name}`);
    } catch (err: unknown) {
      setUploadMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDeleteDocument(id: string) {
    await fetch(`/api/documents?id=${id}&companyId=${companyId}`, { method: "DELETE" });
    setDocuments(prev => prev.filter(d => d.id !== id));
  }

  const needsReview = articles.filter(a => !!a.source_work_order_id);
  const filtered = (showReviewOnly ? needsReview : articles).filter(a =>
    search.trim()
      ? a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.problem?.toLowerCase().includes(search.toLowerCase()) ||
        a.solution?.toLowerCase().includes(search.toLowerCase()) ||
        a.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      : true
  );

  const mappedDocuments = documents.map(d => ({
    id: d.id,
    name: d.name,
    type: d.classification?.type || "PDF",
    size: d.chunksCount ? `${d.chunksCount} chunks` : "—",
    uploadDate: d.uploadedAt ? d.uploadedAt.split("T")[0] : new Date().toISOString().split("T")[0],
  }));

  return (
    <>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Tab bar */}
          <div className="flex gap-1 border-b border-gray-200 mb-6">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                  activeTab === tab.id
                    ? "border-[#C96442] text-[#C96442]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── ARTICLES TAB ─────────────────────────────────────────────────── */}
          {activeTab === "articles" && (
            <>
              <div className="flex items-start justify-between">
                <SectionHeader title="Knowledge Base" subtitle="Auto-captured operational intelligence from resolved work orders" />
              </div>

              <div className="mt-6 flex items-center gap-4 flex-wrap">
                <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#C96442] flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{articles.length}</div>
                    <div className="text-sm text-gray-500">Knowledge articles captured</div>
                  </div>
                </div>
                {needsReview.length > 0 && (
                  <button
                    onClick={() => setShowReviewOnly(v => !v)}
                    className={`rounded-xl border px-6 py-4 flex items-center gap-4 transition text-left ${showReviewOnly ? "border-[#C96442] bg-[#C96442]/10" : "border-gray-200 bg-amber-50 hover:bg-gray-50"}`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-600">{needsReview.length}</div>
                      <div className="text-sm text-gray-600">Needs Review (auto-generated)</div>
                    </div>
                  </button>
                )}
              </div>

              <div className="mt-6 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search knowledge base — e.g. 'spindle vibration', 'hydraulic leak', 'conveyor belt'..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C96442]/30 focus:border-[#C96442]"
                />
              </div>

              <div className="mt-6 space-y-3">
                {loading ? (
                  <div className="text-center py-12 text-gray-400">Loading knowledge base...</div>
                ) : filtered.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No knowledge articles yet</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Knowledge articles are automatically created when work orders are resolved. Complete some work orders and check back!
                    </p>
                  </div>
                ) : (
                  filtered.map(article => (
                    <div key={article.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => setExpanded(expanded === article.id ? null : article.id)}
                        className="w-full px-5 py-4 flex items-start justify-between text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 text-sm">{article.title}</span>
                            {article.equipment_type && <Badge variant="outline" className="text-xs">{article.equipment_type}</Badge>}
                          </div>
                          <p className="text-sm text-gray-500 mt-1 truncate">{article.problem}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            {article.asset_name && <span className="flex items-center gap-1"><Wrench className="w-3 h-3" />{article.asset_name}</span>}
                            {article.time_estimate_minutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.time_estimate_minutes}m</span>}
                            <span className="flex items-center gap-1"><Hash className="w-3 h-3" />Referenced {article.times_referenced || 0}x</span>
                            {article.source_work_order_id && (
                              <>
                                <span className="inline-flex items-center gap-1 text-gray-600 font-medium">Needs Review</span>
                                <a href={`/work-orders?id=${article.source_work_order_id}`} className="text-[#C96442] underline hover:text-[#B0532F]" onClick={e => e.stopPropagation()}>View source WO</a>
                              </>
                            )}
                          </div>
                          {article.tags?.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {article.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{t}</span>)}
                            </div>
                          )}
                        </div>
                        {expanded === article.id ? <ChevronUp className="w-5 h-5 text-gray-400 mt-1" /> : <ChevronDown className="w-5 h-5 text-gray-400 mt-1" />}
                      </button>

                      {expanded === article.id && (
                        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
                          {article.symptoms && (
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Symptoms</div>
                              <p className="text-sm text-gray-700">{article.symptoms}</p>
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Solution</div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{article.solution}</p>
                          </div>
                          {article.parts_used?.length > 0 && (
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Parts Used</div>
                              <div className="flex gap-2 flex-wrap">
                                {article.parts_used.map(p => <span key={p} className="text-xs px-2 py-1 bg-orange-50 text-[#C96442] rounded">{p}</span>)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* ── DOCUMENTS TAB ────────────────────────────────────────────────── */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              <SectionHeader title="Documents" subtitle="Upload and manage company documents for Sidekick's knowledge base" />

              <div
                className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-8 text-center hover:border-[#C96442] transition-colors cursor-pointer"
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" className="hidden" accept=".pdf,.txt,.doc,.docx,.xlsx,.csv" onChange={handleDocUpload} disabled={uploading} />
                <div className="flex flex-col items-center gap-3">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{uploading ? "Uploading..." : "Drop files here or click to upload"}</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, or text files</p>
                  </div>
                </div>
                {uploadMsg && <p className="text-xs mt-3 text-gray-500">{uploadMsg}</p>}
              </div>

              <DocumentsTable documents={mappedDocuments} />
              <GeneratedReports companyId={companyId} />
              <KnowledgeBaseViewer companyId={companyId} />
            </div>
          )}

          {/* ── INTEGRATIONS TAB ─────────────────────────────────────────────── */}
          {activeTab === "integrations" && (
            <div className="space-y-6">
              <SectionHeader title="Integrations" subtitle="Connect external services to import documents and employee data" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GoogleDriveIntegration
                  companyId={companyId}
                  darkMode={false}
                  onDocumentImported={doc => setDocuments(prev => [...prev, { ...doc, name: doc.filename, classification: { type: doc.type, title: doc.title, confidence: 1 } }])}
                />
                <DropboxIntegration
                  companyId={companyId}
                  darkMode={false}
                  onDocumentImported={doc => setDocuments(prev => [...prev, { ...doc, name: doc.filename, classification: { type: doc.type, title: doc.title, confidence: 1 } }])}
                />
                <MicrosoftTeamsIntegration companyId={companyId} darkMode={false} />
                <GustoIntegration
                  companyId={companyId}
                  darkMode={false}
                  onEmployeesImported={count => console.log("Imported employees:", count)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
