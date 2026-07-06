"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import IntegrationSelector from "@/components/IntegrationSelector";
import { cn } from "@/lib/utils";
import {
  Upload,
  Mic,
  MicOff,
  Smartphone,
  FileText,
  Loader2,
  CheckCircle2,
  X,
  Plus,
  MessageSquare,
  Send,
  Building2,
  Wrench,
  Users,
  BookOpen,
  Sparkles,
} from "lucide-react";

type CaptureTab = "text" | "voice" | "upload";

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

const UPDATE_CAPABILITIES = [
  {
    key: "company",
    icon: Building2,
    title: "Company details",
    description: "Manager contact, industry, and high-level org context.",
  },
  {
    key: "team",
    icon: Users,
    title: "Team changes",
    description: "New hires, supervisors, technician contacts, and role changes.",
  },
  {
    key: "assets",
    icon: Wrench,
    title: "Assets",
    description: "New machines, location moves, and equipment notes.",
  },
  {
    key: "knowledge",
    icon: BookOpen,
    title: "Knowledge",
    description: "Reusable SOPs, troubleshooting notes, and tribal knowledge.",
  },
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

function TextSidekickCard() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#F7F3EC]">
          <Smartphone className="h-5 w-5 text-gray-700" />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">Text Sidekick from the floor</div>
          <div className="text-xs text-gray-500">Fastest way to capture quick fixes, tribal knowledge, and SOP notes while the work is still fresh.</div>
        </div>
      </div>

      <div className="rounded-xl border border-[#F0E5DC] bg-[#FBF7F1] px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-400">Example</div>
        <div className="mt-1 text-sm font-medium leading-snug text-gray-800">“Packaging line reset is hold start + green button for 3 seconds.”</div>
        <div className="mt-2 text-sm text-gray-500">Use the same Sidekick number your crew already texts.</div>
      </div>
    </div>
  );
}

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
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#F7F3EC]">
            <Upload className="h-5 w-5 text-gray-700" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Upload documents</div>
            <div className="text-xs text-gray-500">PDFs, manuals, SOPs, checklists</div>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.md,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
        />

        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-600 transition-colors hover:border-[#C96442]/40 hover:bg-[#FBF7F1] disabled:opacity-50 sm:w-auto"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Choose file
            </>
          )}
        </button>
      </div>

      {result && (
        <div className={cn("mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs", result.ok ? "bg-green-50 text-gray-700" : "bg-red-50 text-gray-700")}>
          {result.ok ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded {result.name}
            </>
          ) : (
            <>
              <X className="h-3.5 w-3.5" /> {result.error}
            </>
          )}
        </div>
      )}
    </div>
  );
}

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#F7F3EC]">
            <Mic className="h-5 w-5 text-gray-700" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Voice input</div>
            <div className="text-xs text-gray-500">Dictate SOPs, tips, and procedures</div>
          </div>
        </div>

        {processing ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-gray-50 px-4 py-2.5 text-sm text-gray-700 sm:min-w-[210px]">
            <Loader2 className="h-4 w-4 animate-spin" /> Transcribing…
          </div>
        ) : recording ? (
          <button
            onClick={stopRecording}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 sm:min-w-[210px] sm:w-auto"
          >
            <MicOff className="h-4 w-4" /> Stop Recording · {formatTime(seconds)}
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1C1A16] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2c2924] sm:min-w-[210px] sm:w-auto"
          >
            <Mic className="h-4 w-4" /> Start Recording
          </button>
        )}
      </div>

      {result && (
        <div className={cn("mt-3 rounded-lg px-3 py-2 text-xs", result.ok ? "bg-green-50 text-gray-700" : "bg-red-50 text-gray-700")}>
          {result.ok ? (
            <>
              <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
              Saved!{result.preview && <span className="mt-1 block italic text-gray-600">“{result.preview}…”</span>}
            </>
          ) : (
            <>
              <X className="mr-1 inline h-3.5 w-3.5" />
              {result.error}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function UpdatesPage() {
  const [companyId, setCompanyId] = useState("");
  const [updates, setUpdates] = useState<UpdateRecord[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [activeCaptureTab, setActiveCaptureTab] = useState<CaptureTab>("text");
  const [error, setError] = useState<string | null>(null);

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
    fetch("/api/company-updates")
      .then((r) => r.json())
      .then((data) => setUpdates(data.updates || []))
      .catch(() => setUpdates([]))
      .finally(() => setLoadingUpdates(false));
  }, []);

  const suggestions = useMemo(
    () => [
      "Add a new technician: Maria Lopez, +1 415 555 0111, works nights.",
      "We installed a new palletizer on Line 4 in Packaging.",
      "New SOP: before startup, inspect belt tension and confirm guard latch is closed.",
      "Justin is now the main escalation contact at +1 555 010 1000.",
    ],
    [],
  );

  const orderedUpdates = useMemo(() => [...updates].reverse(), [updates]);
  const hasUpdates = updates.length > 0;

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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F3EC]">
              <MessageSquare className="h-5 w-5 text-[#C96442]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Tell Sidekick what changed</h2>
              <p className="mt-1 text-sm text-gray-500">
                Type updates naturally. Sidekick will turn them into structured company, team, asset, and knowledge changes when it can.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            {loadingUpdates ? (
              <div className="py-10 text-center text-sm text-gray-400">Loading recent updates…</div>
            ) : orderedUpdates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5">
                <div className="text-sm font-medium text-gray-900">No updates yet</div>
                <p className="mt-1 text-sm text-gray-500">You can add a contact, asset, SOP, or policy change here.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {UPDATE_CAPABILITIES.map(({ key, icon: Icon, title, description }) => (
                    <div key={key} className="rounded-xl border border-gray-200 bg-[#FCFAF7] p-3">
                      <div className="flex items-start gap-2.5">
                        <Icon className="mt-0.5 h-4 w-4 text-[#C96442]" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{title}</div>
                          <div className="mt-0.5 text-xs leading-5 text-gray-500">{description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              orderedUpdates.slice(-8).map((update) => (
                <div key={update.id} className="space-y-2">
                  <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-[#1C1A16] px-4 py-3 text-sm text-white">
                    {update.message}
                  </div>
                  <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
                    {update.assistant_response}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:border-[#C96442]/30 hover:bg-[#FBF7F1] hover:text-gray-900"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Example: We hired Alex Kim as a daytime supervisor, phone +1 415 555 0119. Also the line reset SOP now requires a 10-second wait before restart."
              className="min-h-[130px] w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-[#C96442] focus:outline-none focus:ring-2 focus:ring-[#C96442]/20"
            />
            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
            <div className="mt-3 flex items-center justify-end">
              <button
                onClick={() => sendUpdate(input)}
                disabled={sending || !input.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#C96442] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#B85736] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Save update
              </button>
            </div>
          </div>
        </section>

        {hasUpdates && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F3EC]">
                  <Sparkles className="h-5 w-5 text-[#C96442]" />
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
                              <span key={chip} className="rounded-full bg-[#F7F3EC] px-2 py-0.5 text-xs text-gray-700">
                                {chip}
                              </span>
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
        <div className="max-w-xl">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#C96442]" />
            <h2 className="text-base font-semibold text-gray-900">Add context in other formats</h2>
          </div>
          <p className="mt-2 text-sm text-gray-500">Use text, voice, or uploads when it’s faster than typing a structured manager update.</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-2">
          {[
            { id: "text", label: "Text", icon: Smartphone },
            { id: "voice", label: "Voice", icon: Mic },
            { id: "upload", label: "Upload", icon: Upload },
          ].map(({ id, label, icon: Icon }) => {
            const active = activeCaptureTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveCaptureTab(id as CaptureTab)}
                className={cn(
                  "flex min-w-[110px] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  active ? "bg-white text-[#1C1A16] shadow-sm ring-1 ring-[#C96442]/20" : "text-gray-600 hover:bg-white hover:text-gray-900",
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "text-[#C96442]" : "text-gray-500")} />
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          {activeCaptureTab === "text" && <TextSidekickCard />}
          {activeCaptureTab === "voice" && <VoiceInputCard companyId={companyId} />}
          {activeCaptureTab === "upload" && <UploadCard companyId={companyId} />}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#C96442]" />
              <h2 className="text-base font-semibold text-gray-900">Connected sources</h2>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Keep every integration together here. This is where Sidekick pulls docs, team context, and operating knowledge from the tools you already use.
            </p>
          </div>
          <a
            href="/review-queue"
            className="shrink-0 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[#1C1A16] hover:bg-black/[0.03]"
          >
            Review generated knowledge
          </a>
        </div>

        <div className="mt-5">
          <IntegrationSelector companyId={companyId} />
        </div>
      </section>
    </div>
  );
}
