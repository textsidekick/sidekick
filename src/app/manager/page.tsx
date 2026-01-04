"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Upload, FileText, Trash2, BarChart3, Building2, Users, Phone, MapPin, Globe } from "lucide-react";

interface Document {
  id: string;
  name: string;
  uploadedAt: string;
  chunksCount?: number;
  classification?: { type: string; title: string; confidence: number };
}

interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface Company {
  id: string;
  name: string;
  locations: Location[];
}

interface Worker {
  phone: string;
  companyId: string;
  locationId: string;
  registeredAt: string;
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
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("eds");
  const [selectedScope, setSelectedScope] = useState<string>("company-wide"); // "company-wide" or locationId
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [uploading, setUploading] = useState(false);

  const currentCompany = companies.find(c => c.id === selectedCompany);

  useEffect(() => {
    fetch("/api/companies").then(r => r.json()).then(d => {
      setCompanies(d.companies || []);
      if (d.workers) setWorkers(d.workers);
    });
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      // Fetch docs based on scope
      const docKey = selectedScope === "company-wide" ? selectedCompany : selectedScope;
      fetch(`/api/documents?companyId=${docKey}`)
        .then(r => r.json())
        .then(d => setDocuments(d.documents || []));
    }
  }, [selectedCompany, selectedScope]);

  useEffect(() => {
    if (activeTab === "analytics") {
      fetch("/api/analytics/stats").then(r => r.json()).then(setStats);
    }
    if (activeTab === "workers") {
      fetch("/api/companies").then(r => r.json()).then(d => {
        if (d.workers) setWorkers(d.workers);
      });
    }
  }, [activeTab]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    // Use location ID for location-specific, company ID for company-wide
    const docKey = selectedScope === "company-wide" ? selectedCompany : selectedScope;
    formData.append("companyId", docKey);

    const res = await fetch("/api/documents", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setDocuments(prev => [...prev, { ...data.document, chunksCount: data.chunksCount, classification: data.classification }]);
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (id: string) => {
    const docKey = selectedScope === "company-wide" ? selectedCompany : selectedScope;
    await fetch(`/api/documents?id=${id}&companyId=${docKey}`, { method: "DELETE" });
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Filter workers for current company
  const companyWorkers = workers.filter(w => w.companyId === selectedCompany);

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
              onChange={(e) => {
                setSelectedCompany(e.target.value);
                setSelectedScope("company-wide");
              }}
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
            {/* Scope Selector */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500 mb-3">Upload documents for:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedScope("company-wide")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedScope === "company-wide"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  All Locations (Company-wide)
                </button>
                {currentCompany?.locations.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedScope(loc.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedScope === loc.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    {loc.city}, {loc.state}
                  </button>
                ))}
              </div>
            </div>

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
                <p className="text-sm text-slate-400">
                  {selectedScope === "company-wide" 
                    ? `Documents will apply to ALL ${currentCompany?.name} locations`
                    : `Documents will only apply to ${currentCompany?.locations.find(l => l.id === selectedScope)?.city}`
                  }
                </p>
              </label>
            </div>

            {/* Document List */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="font-medium text-slate-900">
                  {selectedScope === "company-wide" 
                    ? `${currentCompany?.name} - Company-wide Documents`
                    : `${currentCompany?.name} - ${currentCompany?.locations.find(l => l.id === selectedScope)?.city} Documents`
                  }
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {documents.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    No documents uploaded yet
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
              <h3 className="font-semibold text-slate-900 mb-2">Worker Self-Registration</h3>
              <p className="text-sm text-slate-500 mb-4">
                Workers can register themselves via SMS by texting:<br/>
                <code className="bg-slate-100 px-2 py-1 rounded text-blue-600">JOIN {currentCompany?.name} [city]</code>
              </p>
              
              <div className="border-t border-slate-100 pt-4 mt-4">
                <p className="text-sm font-medium text-slate-700 mb-3">
                  {companyWorkers.length} workers registered at {currentCompany?.name}
                </p>
                
                {currentCompany?.locations.map(loc => {
                  const locationWorkers = companyWorkers.filter(w => w.locationId === loc.id);
                  return (
                    <div key={loc.id} className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">
                          {loc.city}, {loc.state}
                        </span>
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                          {locationWorkers.length} workers
                        </span>
                      </div>
                      {locationWorkers.length > 0 && (
                        <div className="ml-6 space-y-1">
                          {locationWorkers.map((worker, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {worker.phone}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
