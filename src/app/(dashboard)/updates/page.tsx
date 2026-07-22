"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import IntegrationSelector from "@/components/IntegrationSelector";
import { cn } from "@/lib/utils";
import {
  Upload,
  Mic,
  MicOff,
  FileText,
  Loader2,
  CheckCircle2,
  X,
  MessageSquare,
  Send,
  Sparkles,
  Smartphone,
} from "lucide-react";
import { buildScopedUrl, readDashboardScope } from "@/lib/dashboard-scope";

type UpdateRecord = {
  id: string;
  message: string;
  assistant_response: string;
  summary?: string | null;
  applied_changes?: {
    companyUpdated?: boolean;
    assetsCreated?: number;
    assetsUpdated?: number;
    teamSynced?: number;
    knowledgeAdded?: number;
    notes?: string[];
  };
  created_at: string;
};

const UPDATE_EXAMPLES = [
  "Company details: manager contact, industry, and high-level org context.",
  "Team changes: new hires, supervisors, technician contacts, and role changes.",
  "Assets: new machines, location moves, and equipment notes.",
  "Knowledge: reusable SOPs, troubleshooting notes, and tribal knowledge.",
] as const;

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function UploadInline({ companyId }: { companyId: string }) {
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
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.txt,.md,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Manual upload</div>
          <div className="mt-1 text-sm text-gray-500">Upload PDFs, manuals, SOPs, or checklists.</div>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:border-[#0060F0]/40 hover:bg-[#F8FBFF] disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading…" : "Choose file"}
        </button>
      </div>

      {result && (
        <div className={cn("mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs", result.ok ? "bg-slate-50 text-gray-700" : "bg-slate-50 text-gray-700")}>
          {result.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
          {result.ok ? `Uploaded ${result.name}` : result.error}
        </div>
      )}
    </div>
  );
}

function VoiceInline({ companyId }: { companyId: string }) {
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
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.start(250);
      mediaRecorderRef.current = mr;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setResult({ ok: false, error: "Microphone access denied" });
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) return;
    const mr = mediaRecorderRef.current;
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    await new Promise<void>((resolve) => {
      mr.onstop = () => resolve();
      mr.stop();
    });
    mr.stream.getTracks().forEach((track) => track.stop());

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    if (blob.size < 1000) {
      setResult({ ok: false, error: "Recording too short" });
      return;
    }

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

  const formatTime = (value: number) => `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Voice input</div>
          <div className="mt-1 text-sm text-gray-500">Dictate a quick SOP, operational note, or troubleshooting tip.</div>
        </div>
        {processing ? (
          <div className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
            <Loader2 className="h-4 w-4 animate-spin" /> Transcribing…
          </div>
        ) : recording ? (
          <button
            onClick={stopRecording}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-500 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <MicOff className="h-4 w-4" /> Stop · {formatTime(seconds)}
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#1C1A16] px-3 py-2 text-sm font-medium text-white hover:bg-[#2c2924]"
          >
            <Mic className="h-4 w-4" /> Record
          </button>
        )}
      </div>

      {result && (
        <div className={cn("mt-3 rounded-lg px-3 py-2 text-xs", result.ok ? "bg-slate-50 text-gray-700" : "bg-slate-50 text-gray-700")}>
          {result.ok ? <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> : <X className="mr-1 inline h-3.5 w-3.5" />}
          {result.ok ? "Saved!" : result.error}
          {result.ok && result.preview && <span className="mt-1 block italic text-gray-600">“{result.preview}…”</span>}
        </div>
      )}
    </div>
  );
}

export default function UpdatesPage() {
  const [companyId, setCompanyId] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [updates, setUpdates] = useState<UpdateRecord[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const loadSession = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = await res.json();
        if (!ignore && data?.authenticated) {
          setCompanyId(data.companyId || "");
          setCompanyPhone(data.company?.phone || data.company?.twilio_phone || data.company?.manager_phone || "");
        }
      } catch {}
    };

    loadSession();
    const handleStorage = () => {
      const scope = readDashboardScope();
      if (scope.companyId) setCompanyId(scope.companyId);
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      ignore = true;
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!companyId) return;
    setLoadingUpdates(true);
    fetch(buildScopedUrl("/api/company-updates", { companyId, locationId: "all" }))
      .then((r) => r.json())
      .then((data) => setUpdates(data.updates || []))
      .catch(() => setUpdates([]))
      .finally(() => setLoadingUpdates(false));
  }, [companyId]);

  const sendUpdate = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/company-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save update");
      setUpdates((prev) => [data.update, ...prev]);
      setInput("");
    } catch (e: any) {
      setError(e.message || "Failed to save update");
    } finally {
      setSending(false);
    }
  };

  const hasUpdates = updates.length > 0;
  const totalStructuredWrites = useMemo(
    () =>
      updates.reduce((acc, update) => {
        const changes = update.applied_changes || {};
        return (
          acc +
          Number(changes.assetsCreated || 0) +
          Number(changes.assetsUpdated || 0) +
          Number(changes.teamSynced || 0) +
          Number(changes.knowledgeAdded || 0) +
          Number(changes.companyUpdated ? 1 : 0)
        );
      }, 0),
    [updates],
  );

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <SectionHeader
        title="Updates"
        subtitle="Keep Sidekick current as your operation changes — people, assets, SOPs, and company context all live here."
      />

      <div className={cn("mt-6 grid gap-6", hasUpdates && "xl:grid-cols-[1.5fr_1fr]")}>
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4F7FA]">
              <MessageSquare className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Tell Sidekick what changed</h2>
              <p className="mt-1 text-sm text-gray-500">Type updates naturally. Sidekick will turn them into structured company, team, asset, and knowledge changes when it can.</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Examples</div>
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              {UPDATE_EXAMPLES.map((example) => {
                const [label, detail] = example.split(": ");
                return (
                  <li key={label}>
                    <span className="font-medium text-gray-900">{label}:</span> {detail}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Example: We hired Alex Kim as a daytime supervisor, phone +1 415 555 0119. Also the line reset SOP now requires a 10-second wait before restart."
              className="min-h-[150px] w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-[#0060F0] focus:outline-none focus:ring-2 focus:ring-[#0060F0]/20"
            />
            {error && <div className="mt-2 text-sm text-slate-600">{error}</div>}
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <VoiceInline companyId={companyId} />
              <UploadInline companyId={companyId} />
            </div>
            <div className="mt-4 flex items-center justify-end">
              <button
                onClick={() => sendUpdate(input)}
                disabled={sending || !input.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0060F0] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#004BB8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Save update
              </button>
            </div>
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F4F7FA]">
                  <Smartphone className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">You can also text the Sidekick phone number from your phone to provide company updates.</div>
                  <div className="mt-1 text-sm text-gray-500">
                    {companyPhone
                      ? `Text ${companyPhone} when you want to capture quick fixes, tribal knowledge, and SOP notes while the work is fresh.`
                      : "That’s still the fastest way to capture quick fixes, tribal knowledge, and SOP notes while the work is fresh."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {hasUpdates && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4F7FA]">
                  <Sparkles className="h-5 w-5 text-[#0060F0]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{updates.length}</div>
                  <div className="text-sm text-gray-500">manager updates saved</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
                <div className="text-2xl font-bold text-gray-900">{totalStructuredWrites}</div>
                <div className="text-sm text-gray-500">structured writes applied across company, team, assets, and knowledge</div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">Recent structured changes</h2>
              <div className="mt-4 space-y-3">
                {loadingUpdates ? (
                  <div className="text-sm text-gray-400">Loading…</div>
                ) : (
                  updates.slice(0, 5).map((update) => {
                    const changes = update.applied_changes || {};
                    const chips = [
                      changes.companyUpdated ? "company" : null,
                      Number(changes.teamSynced || 0) > 0 ? `${changes.teamSynced} team` : null,
                      Number(changes.assetsCreated || 0) > 0 ? `${changes.assetsCreated} added asset` : null,
                      Number(changes.assetsUpdated || 0) > 0 ? `${changes.assetsUpdated} updated asset` : null,
                      Number(changes.knowledgeAdded || 0) > 0 ? `${changes.knowledgeAdded} knowledge` : null,
                    ].filter(Boolean) as string[];

                    return (
                      <div key={update.id} className="rounded-xl border border-gray-200 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-gray-900">{update.summary || update.assistant_response}</div>
                          <div className="text-xs text-gray-400">{formatRelative(update.created_at)}</div>
                        </div>
                        {chips.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {chips.map((chip) => (
                              <span key={chip} className="rounded-full bg-[#F4F7FA] px-2 py-0.5 text-xs text-gray-700">{chip}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#0060F0]" />
              <h2 className="text-base font-semibold text-gray-900">Connected sources</h2>
            </div>
            <p className="mt-2 text-sm text-gray-500">Keep every integration together here. This is where Sidekick pulls docs, team context, and operating knowledge from the tools you already use.</p>
          </div>
        </div>

        <div className="mt-5">
          <IntegrationSelector companyId={companyId} />
        </div>
      </section>
    </div>
  );
}
