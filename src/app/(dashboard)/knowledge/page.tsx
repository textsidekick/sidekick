"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { Badge } from "@/components/ui/badge";
import {
  Search, BookOpen, Wrench, Clock, Hash, ChevronDown, ChevronUp,
  Upload, Mic, MicOff, Smartphone, FileText, Loader2, CheckCircle2, X, Plus, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import KnowledgeBaseViewer from "@/components/dashboard/documents/KnowledgeBaseViewer";
import GeneratedReports from "@/components/dashboard/documents/GeneratedReports";
import IntegrationSelector from "@/components/IntegrationSelector";

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
  metadata?: Record<string, unknown>;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0) return `${days}d ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0) return `${hrs}h ago`;
  return "just now";
}

function ProvenanceBadge({ article }: { article: KnowledgeArticle }) {
  const meta = article.metadata || {};
  const source = article.source_work_order_id ? "auto-extraction" : "manual";
  const status = meta.review_status as string | undefined;

  if (status === "verified") {
    return (
      <div className="flex flex-col">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-50 border border-green-200 text-green-700 text-[10px] font-semibold uppercase tracking-wide">
          <CheckCircle2 className="w-3 h-3" /> Verified
        </span>
        <span className="text-[10px] text-gray-400 mt-0.5">
          Verified by {meta.verified_by as string || "—"} · {meta.verified_at ? timeAgo(meta.verified_at as string) : ""} · from {source}
        </span>
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 border border-red-200 text-red-600 text-[10px] font-semibold uppercase tracking-wide">
        Rejected
      </span>
    );
  }
  if (article.source_work_order_id) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold uppercase tracking-wide">
        Auto-generated · Needs Review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-50 border border-green-200 text-green-700 text-[10px] font-semibold uppercase tracking-wide">
      <CheckCircle2 className="w-3 h-3" /> Verified
    </span>
  );
}

// ─── Upload Card ────────────────────────────────────────────────────────────────
function UploadCard({ companyId }: { companyId: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; name?: string; error?: string } | null>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      if (companyId) form.append("companyId", companyId);
      const res = await fetch("/api/documents/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setResult({ ok: true, name: file.name });
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <Upload className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">Upload documents</div>
          <div className="text-xs text-gray-500">PDFs, manuals, SOPs, checklists</div>
        </div>
      </div>

      <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.doc,.docx" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />

      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-2.5 text-sm text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
      >
        {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Plus className="w-4 h-4" /> Choose file</>}
      </button>

      {result && (
        <div className={cn("text-xs px-3 py-2 rounded-lg flex items-center gap-2", result.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
          {result.ok ? <><CheckCircle2 className="w-3.5 h-3.5" /> Uploaded {result.name}</> : <><X className="w-3.5 h-3.5" /> {result.error}</>}
        </div>
      )}
    </div>
  );
}

// ─── Voice Input Card ───────────────────────────────────────────────────────────
function VoiceInputCard({ companyId }: { companyId: string }) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; preview?: string; error?: string } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(250);
      mediaRecorderRef.current = mr;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch {
      setResult({ ok: false, error: "Microphone access denied" });
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) return;
    const mr = mediaRecorderRef.current;
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    await new Promise<void>((res) => { mr.onstop = () => res(); mr.stop(); });
    mr.stream.getTracks().forEach(t => t.stop());

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    if (blob.size < 1000) { setResult({ ok: false, error: "Recording too short" }); return; }

    setProcessing(true);
    try {
      const form = new FormData();
      form.append("file", blob, "voice-knowledge.webm");
      form.append("companyId", companyId);
      form.append("title", "Voice Knowledge");
      const res = await fetch("/api/onboarding/voice-sop", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult({ ok: true, preview: data.sopPreview || data.transcript?.slice(0, 120) });
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
    } finally {
      setProcessing(false);
    }
  }, [companyId]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <Mic className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">Voice input</div>
          <div className="text-xs text-gray-500">Dictate SOPs, tips, and procedures</div>
        </div>
      </div>

      {processing ? (
        <div className="flex items-center justify-center gap-2 py-3 text-sm text-gray-700"><Loader2 className="w-4 h-4 animate-spin" /> Transcribing &amp; formatting…</div>
      ) : recording ? (
        <button onClick={stopRecording} className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600">
          <MicOff className="w-4 h-4" />
          Stop Recording · {formatTime(seconds)}
        </button>
      ) : (
        <button onClick={startRecording} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1C1A16] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2c2924]">
          <Mic className="w-4 h-4" />
          Start Recording
        </button>
      )}

      {result && (
        <div className={cn("text-xs px-3 py-2 rounded-lg", result.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
          {result.ok ? <><CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />Saved! {result.preview && <span className="block mt-1 text-green-600 italic">"{result.preview}…"</span>}</> : <><X className="w-3.5 h-3.5 inline mr-1" />{result.error}</>}
        </div>
      )}
    </div>
  );
}

// ─── Text Sidekick CTA Card ────────────────────────────────────────────────────
function TextSidekickCard() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 bg-[#FAF6EE] p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#C96442]">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">Text Sidekick from your phone</div>
          <div className="text-xs text-gray-500">Fastest way to capture fixes, tribal knowledge, and quick SOP notes.</div>
        </div>
      </div>

      <div className="rounded-xl border border-[#C96442]/10 bg-white px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-400">Best for</div>
        <div className="mt-1 text-lg font-semibold leading-snug text-[#A95537]">Quick notes from the floor, while the work is still fresh</div>
        <div className="mt-2 text-sm text-gray-500">Use the same Sidekick number your workers already text.</div>
      </div>

      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-1 text-xs font-medium text-[#A95537] hover:underline"
      >
        {expanded ? "Hide examples" : "See examples"} <ChevronDown className={cn("w-3 h-3 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
          <div className="flex items-start gap-2 bg-white rounded-lg p-2.5 border border-gray-100">
            <MessageSquare className="w-3.5 h-3.5 text-[#C96442] mt-0.5 flex-shrink-0" />
            <div><span className="font-medium text-gray-800">Text</span><br /><span className="text-gray-500">"The boiler reset code is 4829"</span></div>
          </div>
          <div className="flex items-start gap-2 bg-white rounded-lg p-2.5 border border-gray-100">
            <Mic className="w-3.5 h-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div><span className="font-medium text-gray-800">Voice memo</span><br /><span className="text-gray-500">Record &amp; send a voice note</span></div>
          </div>
          <div className="flex items-start gap-2 bg-white rounded-lg p-2.5 border border-gray-100">
            <FileText className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div><span className="font-medium text-gray-800">Photos &amp; docs</span><br /><span className="text-gray-500">Snap a label, manual page, etc.</span></div>
          </div>
          <div className="flex items-start gap-2 bg-white rounded-lg p-2.5 border border-gray-100">
            <BookOpen className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
            <div><span className="font-medium text-gray-800">Quick answers</span><br /><span className="text-gray-500">Reply when workers ask Sidekick</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Integrations (collapsed list) ──────────────────────────────────────────────
function IntegrationsCard({ companyId }: { companyId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-3">
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-3 w-full text-left">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <FileText className="w-5 h-5 text-gray-700" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900">Connect tools</div>
          <div className="text-xs text-gray-500">Google Drive, SharePoint, Notion…</div>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="pt-1">
          <IntegrationSelector companyId={companyId} compact />
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function KnowledgePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showReviewOnly, setShowReviewOnly] = useState(false);
  const [companyId, setCompanyId] = useState<string>("");

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

  useEffect(() => {
    fetch("/api/knowledge")
      .then(r => r.json())
      .then(d => setArticles(d.articles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const needsReview = articles.filter(a => !!a.source_work_order_id);
  const filtered = (showReviewOnly ? needsReview : articles).filter(a =>
    search.trim()
      ? a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.problem?.toLowerCase().includes(search.toLowerCase()) ||
        a.solution?.toLowerCase().includes(search.toLowerCase()) ||
        a.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      : true
  );

  return (
    <div className="min-h-screen px-6 py-8 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <SectionHeader title="Ops Knowledge" subtitle="Your crew's operating memory — everything they've learned, documented, and captured" />

      {/* ══════════════════════════════════════════════════════════════════════
          ADD KNOWLEDGE — always visible, top of page, impossible to miss
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#C96442]" />
              <h2 className="text-base font-semibold text-gray-900">Capture Knowledge</h2>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Bring in fixes, SOPs, and field learnings from the fastest source available — text, voice, docs, or connected tools.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-full bg-[#F7F3EC] px-3 py-1 text-xs font-medium text-gray-600">Phone-first</div>
            <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Voice-friendly</div>
            <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Docs + tools</div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_.9fr_.9fr_.9fr]">
          <TextSidekickCard />
          <VoiceInputCard companyId={companyId} />
          <UploadCard companyId={companyId} />
          <IntegrationsCard companyId={companyId} />
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="mt-6 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-6 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F7F3EC]">
            <BookOpen className="w-6 h-6 text-[#C96442]" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{articles.length}</div>
            <div className="text-sm text-gray-500">Procedures & fixes documented</div>
          </div>
        </div>
        {needsReview.length > 0 && (
          <button
            onClick={() => setShowReviewOnly(v => !v)}
            className={`flex items-center gap-4 rounded-xl border px-6 py-4 text-left transition ${showReviewOnly ? "border-[#C96442]/40 bg-[#C96442]/5" : "border-gray-200 bg-white hover:bg-gray-50"}`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F7F3EC]">
              <BookOpen className="w-6 h-6 text-[#C96442]" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{needsReview.length}</div>
              <div className="text-sm text-gray-600">Needs Review <span className="text-xs text-gray-400">(auto-generated from work orders)</span></div>
            </div>
          </button>
        )}
      </div>

      {/* ── Search ── */}
      <div className="mt-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search procedures, fixes, SOPs — e.g. 'spindle vibration', 'hydraulic leak'..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C96442]/30 focus:border-[#C96442]"
        />
      </div>

      {/* ── Articles list ── */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading knowledge base...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <BookOpen className="w-12 h-12 text-[#C96442]/30 mx-auto mb-3" />
            <p className="text-gray-700 font-semibold">No procedures captured yet</p>
            <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
              Text a tip to your Sidekick number, upload an SOP, or record a voice walkthrough above. Knowledge your team captures here becomes instantly searchable for every worker.
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
                    <ProvenanceBadge article={article} />
                    {article.source_work_order_id && (
                      <a href={`/work-orders?id=${article.source_work_order_id}`} className="text-[#C96442] underline hover:text-[#B0532F]" onClick={e => e.stopPropagation()}>Source WO</a>
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

      <GeneratedReports companyId={companyId} />
      <KnowledgeBaseViewer companyId={companyId} />
    </div>
  );
}
