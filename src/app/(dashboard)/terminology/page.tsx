"use client";

import React, { useEffect, useState, useCallback } from "react";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { readDashboardScope } from "@/lib/dashboard-scope";
import { BookOpen, Plus, Search, X, Loader2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface Term {
  id: string;
  term: string;
  synonyms: string[];
  definition: string;
  language: string;
  department_id: string | null;
  created_by: string;
}

function TermForm({ companyId, onSave, onClose }: {
  companyId: string;
  onSave: () => void;
  onClose: () => void;
}) {
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [synonymsRaw, setSynonymsRaw] = useState("");
  const [language, setLanguage] = useState("ko");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) { setError("Term is required."); return; }
    setSaving(true);
    setError("");
    try {
      const synonyms = synonymsRaw
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
      const res = await fetch("/api/terminology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ term: term.trim(), definition, synonyms, language }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Save failed");
      }
      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1C1A16]">Add New Term</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Term *</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/40"
              value={term}
              onChange={e => setTerm(e.target.value)}
              placeholder="예: 매트리스 스프링"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">정의 (Definition)</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/40 min-h-[80px]"
              value={definition}
              onChange={e => setDefinition(e.target.value)}
              placeholder="Enter a definition for this term..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">동의어 (Synonyms) — 쉼표로 구분</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/40"
              value={synonymsRaw}
              onChange={e => setSynonymsRaw(e.target.value)}
              placeholder="spring, coil spring"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">언어 (Language)</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/40"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              <option value="ko">한국어 (Korean)</option>
              <option value="en">English</option>
              <option value="both">Both / 이중언어</option>
            </select>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 rounded-lg bg-[#C96442] text-white text-sm font-medium hover:bg-[#b05538] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="h-3 w-3 animate-spin" />}
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TermCard({ t }: { t: Term }) {
  return (
    <div className="bg-white rounded-2xl border border-[rgba(28,26,22,0.08)] p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold text-[#1C1A16] leading-tight">{t.term}</h3>
        {t.language && (
          <span className="text-[10px] font-semibold uppercase tracking-wide bg-[#F7F3EC] text-[#C96442] rounded px-2 py-0.5 flex-shrink-0">
            {t.language}
          </span>
        )}
      </div>
      {t.definition && (
        <p className="text-sm text-gray-600 leading-relaxed">{t.definition}</p>
      )}
      {t.synonyms && t.synonyms.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {t.synonyms.map((s, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-[#F7F3EC] text-[#1C1A16] text-[11px] font-medium rounded-full px-2.5 py-0.5"
            >
              <Tag className="h-2.5 w-2.5 text-[#C96442]" />
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TerminologyPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [companyId, setCompanyId] = useState("");

  const fetchTerms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/terminology", { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        setTerms(d.terms || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const scope = readDashboardScope();
    setCompanyId(scope.companyId);
    fetchTerms();
  }, [fetchTerms]);

  const filtered = terms.filter(t => {
    const q = search.toLowerCase();
    return (
      !q ||
      t.term.toLowerCase().includes(q) ||
      t.definition?.toLowerCase().includes(q) ||
      t.synonyms?.some(s => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 min-h-screen bg-[#F7F3EC]">
      <SectionHeader
        title="Terminology"
        subtitle={`Terminology · ${terms.length} terms`}
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#C96442] text-white text-sm font-medium rounded-lg hover:bg-[#b05538] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Term
          </button>
        }
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 bg-white border border-[rgba(28,26,22,0.08)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/30"
            placeholder="Search terms..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearch("")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#C96442]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <BookOpen className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500 font-medium">
              {search ? `"${search}" — no results found` : "No terms added yet."}
            </p>
            {!search && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-2 px-4 py-2 bg-[#C96442] text-white text-sm font-medium rounded-lg hover:bg-[#b05538]"
              >
                Add your first term
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(t => <TermCard key={t.id} t={t} />)}
          </div>
        )}
      </div>

      {showForm && (
        <TermForm
          companyId={companyId}
          onSave={() => { setShowForm(false); fetchTerms(); }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
