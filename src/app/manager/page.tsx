"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Upload, FileText, Trash2, MessageSquare, BarChart3, Building2, Users, Phone } from "lucide-react";

interface Document {
  id: string;
  name: string;
  uploadedAt: string;
  chunksCount?: number;
  classification?: { type: string; title: string; confidence: number };
}

interface Company {
  id: string;
  name: string;
  phoneNumbers: string[];
}

interface Stats {
  totalQuestions: number;
  todayCount: number;
  avgConfidence: number;
  byLanguage: Record<string, number>;
}

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState<"documents" | "analytics" | "workers">("documents");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("eds");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    fetch("/api/companies").then(r => r.json()).then(d => {
      setCompanies(d.companies || []);
    });
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetch(`/api/documents?companyId=${selectedCompany}`)
        .then(r => r.json())
        .then(d => setDocuments(d.documents || []));
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (activeTab === "analytics") {
      fetch("/api/analytics/stats").then(r => r.json()).then(setStats);
    }
  }, [activeTab]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("companyId", selectedCompany);

    const res = await fetch("/api/documents", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setDocuments(prev => [...prev, { ...data.document, chunksCount: data.chunksCount, classification: data.classification }]);
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/documents?id=${id}&companyId=${selectedCompany}`, { method: "DELETE" });
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleAssignPhone = async () => {
    if (!newPhone.trim()) return;
    await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assignPhone", phone: newPhone, companyId: selectedCompany })
    });
    setNewPhone("");
    // Refresh companies
    const res = await fetch("/api/companies");
    const data = await res.json();
    setCompanies(data.companies || []);
  };

  const currentCompany = companies.find(c => c.id === selectedCompany);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-slate-900">Sidekick</span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">Manager Dashboard</span>
          </div>
          
          {/* Company Selector */}
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-slate-400" />
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium bg-white"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-8">
          {[
            { id: "documents", label: "Documents", icon: FileText },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "workers", label: "Workers", icon: Users },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            {/* Upload Area */}
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
              <input
                type="file"
                id="upload"
                className="hidden"
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleUpload}
                disabled={uploading}
              />
              <label htmlFor="upload" className="cursor-pointer">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 mb-1">
                  {uploading ? "Uploading..." : "Drop files here or click to upload"}
                </p>
                <p className="text-sm text-slate-400">PDF, TXT, DOC up to 10MB</p>
              </label>
            </div>

            {/* Document List */}
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
              {documents.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No documents uploaded for {currentCompany?.name || "this company"} yet
                </div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-slate-900">{doc.name}</p>
                        <p className="text-sm text-slate-500">
                          {doc.classification?.title || "Processing..."} • {doc.chunksCount || 0} sections
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <p className="text-sm text-slate-500 mb-1">Total Questions</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalQuestions || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <p className="text-sm text-slate-500 mb-1">Today</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.todayCount || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <p className="text-sm text-slate-500 mb-1">Avg Confidence</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.avgConfidence || 0}%</p>
            </div>
            
            {stats?.byLanguage && Object.keys(stats.byLanguage).length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 md:col-span-3">
                <p className="text-sm text-slate-500 mb-3">Questions by Language</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.byLanguage).map(([lang, count]) => (
                    <span key={lang} className="px-3 py-1 bg-slate-100 rounded-full text-sm">
                      {lang}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Workers Tab */}
        {activeTab === "workers" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Assign Worker Phone Numbers</h3>
              <p className="text-sm text-slate-500 mb-4">
                Workers assigned to {currentCompany?.name} will only see documents from this company when they text questions.
              </p>
              
              <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <button
                  onClick={handleAssignPhone}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Add Worker
                </button>
              </div>

              {/* Current Workers */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-500 mb-3">
                  {currentCompany?.phoneNumbers?.length || 0} workers assigned
                </p>
                {currentCompany?.phoneNumbers?.map((phone, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{phone}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
