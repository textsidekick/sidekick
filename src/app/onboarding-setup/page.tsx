"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Building2, Package, Users, Clock, FileText, CheckCircle, ChevronRight, ChevronLeft, Upload, Plus, Trash2, Camera, Mic, Zap, Send } from "lucide-react";
import { INDUSTRY_TEMPLATES } from "@/lib/industry-templates";

const STEPS = [
  { id: 1, title: "Company Details", icon: Building2 },
  { id: 2, title: "Add Assets", icon: Package },
  { id: 3, title: "Your Team", icon: Users },
  { id: 4, title: "Set Shifts", icon: Clock },
  { id: 5, title: "Upload Docs", icon: FileText },
  { id: 6, title: "Go Live!", icon: CheckCircle },
];

interface Asset { name: string; type: string; location: string; tag: string }
interface TeamMember { name: string; phone: string; role: string }
interface Shift { name: string; start: string; end: string }

export default function OnboardingSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [smsNumber] = useState("+1 888 707 4659");

  // Step 1: Company
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [address, setAddress] = useState("");

  // Step 2: Assets
  const [assets, setAssets] = useState<Asset[]>([{ name: "", type: "", location: "", tag: "" }]);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Step 3: Team
  const [team, setTeam] = useState<TeamMember[]>([{ name: "", phone: "", role: "operator" }]);

  // Step 4: Shifts
  const [shifts, setShifts] = useState<Shift[]>([
    { name: "Day Shift", start: "06:00", end: "14:00" },
    { name: "Night Shift", start: "22:00", end: "06:00" },
  ]);

  // Step 5: Docs
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Quick start
  const [quickStartMode, setQuickStartMode] = useState(false);
  const [quickStarting, setQuickStarting] = useState(false);

  // Photo/voice import
  const [photoImporting, setPhotoImporting] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sopPhotoRef = useRef<HTMLInputElement>(null);
  const [sopRecording, setSopRecording] = useState(false);
  const [sopMediaRecorder, setSopMediaRecorder] = useState<MediaRecorder | null>(null);
  const sopAudioChunksRef = useRef<Blob[]>([]);
  const [bulkInviting, setBulkInviting] = useState(false);
  const [bulkInviteResult, setBulkInviteResult] = useState<string | null>(null);

  async function handleQuickStart() {
    if (!companyName.trim()) return alert("Enter a company name first.");
    setQuickStarting(true);
    try {
      const res = await fetch("/api/onboarding/quick-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: companyName, industry }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCompanyId(json.companyId);
      setJoinCode(json.joinCode);
      setStep(6);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setQuickStarting(false);
    }
  }

  async function handlePhotoAssetImport(file: File) {
    setPhotoImporting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/onboarding/photo-asset", { method: "POST", body: fd });
      const json = await res.json();
      if (json.assets?.length > 0) {
        const newAssets = json.assets.map((a: any) => ({
          name: a.name || "", type: a.type || "", location: a.location || "", tag: a.tag || "",
        }));
        setAssets((prev) => [...prev.filter((a) => a.name.trim()), ...newAssets]);
      } else {
        alert("No equipment detected in photo. Try a clearer image.");
      }
    } catch (e: any) {
      alert("Photo import failed: " + e.message);
    } finally {
      setPhotoImporting(false);
    }
  }

  async function startVoiceAssetRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const fd = new FormData();
        fd.append("file", blob, "recording.webm");
        setPhotoImporting(true);
        try {
          const res = await fetch("/api/onboarding/voice-asset", { method: "POST", body: fd });
          const json = await res.json();
          if (json.assets?.length > 0) {
            const newAssets = json.assets.map((a: any) => ({
              name: a.name || "", type: a.type || "", location: a.location || "", tag: a.tag || "",
            }));
            setAssets((prev) => [...prev.filter((a) => a.name.trim()), ...newAssets]);
          } else {
            alert("No equipment detected in recording. Try describing your machines more clearly.");
          }
        } catch (e: any) {
          alert("Voice import failed: " + e.message);
        } finally {
          setPhotoImporting(false);
        }
      };
      recorder.start();
      setMediaRecorder(recorder);
      setVoiceRecording(true);
    } catch {
      alert("Microphone access denied.");
    }
  }

  function stopVoiceAssetRecording() {
    mediaRecorder?.stop();
    setVoiceRecording(false);
    setMediaRecorder(null);
  }

  async function handleSopPhoto(file: File) {
    if (!companyId) return alert("Complete Step 1 first.");
    setUploadStatus("Extracting text from photo...");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("companyId", companyId);
      const res = await fetch("/api/onboarding/photo-sop", { method: "POST", body: fd });
      const json = await res.json();
      if (json.ok) {
        setUploadStatus(`✅ Extracted and saved: ${json.document.name} (${json.chunksCreated} sections indexed)`);
      } else {
        setUploadStatus("❌ " + (json.error || "Failed to extract text"));
      }
    } catch (e: any) {
      setUploadStatus("❌ " + e.message);
    }
  }

  async function startSopRecording() {
    if (!companyId) return alert("Complete Step 1 first.");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      sopAudioChunksRef.current = [];
      recorder.ondataavailable = (e) => sopAudioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(sopAudioChunksRef.current, { type: "audio/webm" });
        const fd = new FormData();
        fd.append("file", blob, "sop-recording.webm");
        fd.append("companyId", companyId!);
        setUploadStatus("Transcribing and formatting SOP...");
        try {
          const res = await fetch("/api/onboarding/voice-sop", { method: "POST", body: fd });
          const json = await res.json();
          if (json.ok) {
            setUploadStatus(`✅ Created SOP: ${json.document.name} (${json.chunksCreated} sections indexed)`);
          } else {
            setUploadStatus("❌ " + (json.error || "Failed"));
          }
        } catch (e: any) {
          setUploadStatus("❌ " + e.message);
        }
      };
      recorder.start();
      setSopMediaRecorder(recorder);
      setSopRecording(true);
    } catch {
      alert("Microphone access denied.");
    }
  }

  function stopSopRecording() {
    sopMediaRecorder?.stop();
    setSopRecording(false);
    setSopMediaRecorder(null);
  }

  async function handleBulkInvite() {
    if (!companyId) return;
    const phones = team.filter((m) => m.phone.trim()).map((m) => m.phone.trim());
    if (phones.length === 0) return alert("Add phone numbers first.");
    setBulkInviting(true);
    try {
      const res = await fetch("/api/onboarding/bulk-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, phones }),
      });
      const json = await res.json();
      setBulkInviteResult(`✅ Sent invite to ${json.sent} workers`);
    } catch (e: any) {
      setBulkInviteResult("❌ " + e.message);
    } finally {
      setBulkInviting(false);
    }
  }

  // Load saved progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("onboarding_progress");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.step) setStep(data.step);
        if (data.companyId) setCompanyId(data.companyId);
        if (data.joinCode) setJoinCode(data.joinCode);
        if (data.companyName) setCompanyName(data.companyName);
        if (data.industry) setIndustry(data.industry);
        if (data.address) setAddress(data.address);
        if (data.assets?.length) setAssets(data.assets);
        if (data.team?.length) setTeam(data.team);
        if (data.shifts?.length) setShifts(data.shifts);
      }
    } catch {}
  }, []);

  function saveProgress(extra: Record<string, unknown> = {}) {
    try {
      const data = {
        step, companyId, joinCode, companyName, industry, address, assets, team, shifts, ...extra,
      };
      localStorage.setItem("onboarding_progress", JSON.stringify(data));
    } catch {}
  }

  async function handleStep1() {
    if (!companyName.trim()) return alert("Please enter your company name.");
    setSaving(true);
    try {
      const res = await fetch("/api/onboarding/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: companyName, industry, address }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save company");
      setCompanyId(json.companyId);
      setJoinCode(json.joinCode);
      saveProgress({ step: 2, companyId: json.companyId, joinCode: json.joinCode });
      setStep(2);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStep2() {
    if (!companyId) return setStep(3);
    setSaving(true);
    try {
      const validAssets = assets.filter((a) => a.name.trim());
      if (validAssets.length > 0) {
        await fetch("/api/onboarding/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId, assets: validAssets }),
        });
      }
      if (csvFile) {
        const fd = new FormData();
        fd.append("file", csvFile);
        await fetch(`/api/assets/import?companyId=${companyId}`, { method: "POST", body: fd });
      }
      saveProgress({ step: 3 });
      setStep(3);
    } finally {
      setSaving(false);
    }
  }

  async function handleStep3() {
    if (!companyId) return setStep(4);
    setSaving(true);
    try {
      const validTeam = team.filter((m) => m.phone.trim());
      if (validTeam.length > 0) {
        await fetch("/api/onboarding/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId, team: validTeam }),
        });
      }
      saveProgress({ step: 4 });
      setStep(4);
    } finally {
      setSaving(false);
    }
  }

  async function handleStep4() {
    if (!companyId) return setStep(5);
    setSaving(true);
    try {
      const validShifts = shifts.filter((s) => s.name.trim());
      if (validShifts.length > 0) {
        await fetch("/api/onboarding/shifts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId, shifts: validShifts }),
        });
      }
      saveProgress({ step: 5 });
      setStep(5);
    } finally {
      setSaving(false);
    }
  }

  async function handleStep5() {
    if (!companyId || docFiles.length === 0) { saveProgress({ step: 6 }); setStep(6); return; }
    setSaving(true);
    setUploadStatus("Uploading...");
    try {
      let uploaded = 0;
      for (const file of docFiles) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("companyId", companyId);
        const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
        if (res.ok) uploaded++;
      }
      setUploadStatus(`Uploaded ${uploaded}/${docFiles.length} files`);
      saveProgress({ step: 6 });
      setStep(6);
    } finally {
      setSaving(false);
    }
  }

  async function handleFinish() {
    localStorage.removeItem("onboarding_progress");
    router.push(companyId ? `/manager?companyId=${companyId}` : "/manager");
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-orange-400">⚡ Sidekick Setup</h1>
          <span className="text-gray-400 text-sm">Step {step} of {STEPS.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-orange-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="max-w-2xl mx-auto px-6 pt-6">
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isDone = s.id < step;
            return (
              <div key={s.id} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  ${isDone ? "bg-orange-500 text-white" : isActive ? "bg-orange-500/20 border border-orange-500 text-orange-400" : "bg-gray-800 text-gray-500"}`}>
                  {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-xs hidden sm:block ${isActive ? "text-orange-400" : isDone ? "text-gray-400" : "text-gray-600"}`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Quick Start Banner */}
        {step === 1 && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-400">⚡ Just want to get started?</p>
              <p className="text-xs text-gray-400">Enter your company name above and go live in 30 seconds</p>
            </div>
            <button
              onClick={handleQuickStart}
              disabled={quickStarting || !companyName.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              {quickStarting ? "Setting up..." : "Quick Start"}
            </button>
          </div>
        )}

        {/* Step content */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Tell us about your company</h2>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Company Name *</label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 outline-none"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Manufacturing"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Industry</label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 outline-none"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <option value="">Select industry...</option>
                  <option>Food & Beverage</option>
                  <option>Automotive</option>
                  <option>Electronics</option>
                  <option>Plastics</option>
                  <option>Metal Fabrication</option>
                  <option>Chemical</option>
                  <option>Pharmaceutical</option>
                  <option>Other Manufacturing</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Plant Address</label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 outline-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Industrial Way, Detroit, MI"
                />
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Add your equipment</h2>
              <p className="text-sm text-gray-400">Add key machines, tools, or assets your team maintains.</p>

              {/* Import options */}
              <div className="flex flex-wrap gap-2">
                <select
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none"
                  defaultValue=""
                  onChange={(e) => {
                    const tmpl = INDUSTRY_TEMPLATES.find((t) => t.id === e.target.value);
                    if (tmpl) {
                      setAssets(tmpl.assets.map((a) => ({ ...a })));
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="" disabled>📋 Use Industry Template...</option>
                  {INDUSTRY_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handlePhotoAssetImport(f);
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoImporting}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white hover:border-orange-500 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" /> {photoImporting ? "Processing..." : "📸 Photo Import"}
                </button>

                {!voiceRecording ? (
                  <button
                    onClick={startVoiceAssetRecording}
                    disabled={photoImporting}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white hover:border-orange-500 disabled:opacity-50"
                  >
                    <Mic className="w-4 h-4" /> 🎤 Voice Import
                  </button>
                ) : (
                  <button
                    onClick={stopVoiceAssetRecording}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-600 border border-red-500 rounded-lg text-sm text-white animate-pulse"
                  >
                    <Mic className="w-4 h-4" /> ⏹ Stop Recording
                  </button>
                )}
              </div>
              {assets.map((a, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none" placeholder="Asset name" value={a.name} onChange={(e) => { const n = [...assets]; n[i].name = e.target.value; setAssets(n); }} />
                    <input className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none" placeholder="Type (e.g. CNC Mill)" value={a.type} onChange={(e) => { const n = [...assets]; n[i].type = e.target.value; setAssets(n); }} />
                    <input className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none" placeholder="Location (e.g. Bldg A)" value={a.location} onChange={(e) => { const n = [...assets]; n[i].location = e.target.value; setAssets(n); }} />
                    <input className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none" placeholder="Asset tag (optional)" value={a.tag} onChange={(e) => { const n = [...assets]; n[i].tag = e.target.value; setAssets(n); }} />
                  </div>
                  <button onClick={() => setAssets(assets.filter((_, j) => j !== i))} className="text-gray-500 hover:text-red-400 mt-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={() => setAssets([...assets, { name: "", type: "", location: "", tag: "" }])} className="flex items-center gap-1 text-orange-400 text-sm hover:text-orange-300">
                <Plus className="w-4 h-4" /> Add another asset
              </button>
              <div className="border-t border-gray-700 pt-4">
                <label className="text-sm text-gray-400 block mb-2">Or upload a CSV (name, type, location, tag)</label>
                <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} className="text-sm text-gray-400" />
                {csvFile && <p className="text-xs text-green-400 mt-1">Selected: {csvFile.name}</p>}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Add your team</h2>
              <p className="text-sm text-gray-400">Workers can text in to join — or add them here manually.</p>
              {team.map((m, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none" placeholder="Name" value={m.name} onChange={(e) => { const n = [...team]; n[i].name = e.target.value; setTeam(n); }} />
                    <input className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none" placeholder="+1 555 0100" value={m.phone} onChange={(e) => { const n = [...team]; n[i].phone = e.target.value; setTeam(n); }} />
                    <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none" value={m.role} onChange={(e) => { const n = [...team]; n[i].role = e.target.value; setTeam(n); }}>
                      <option value="operator">Operator</option>
                      <option value="technician">Technician</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                  <button onClick={() => setTeam(team.filter((_, j) => j !== i))} className="text-gray-500 hover:text-red-400 mt-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <button onClick={() => setTeam([...team, { name: "", phone: "", role: "operator" }])} className="flex items-center gap-1 text-orange-400 text-sm hover:text-orange-300">
                  <Plus className="w-4 h-4" /> Add team member
                </button>
                {companyId && team.some((m) => m.phone.trim()) && (
                  <button
                    onClick={handleBulkInvite}
                    disabled={bulkInviting}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 text-sm hover:bg-orange-500/30 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" /> {bulkInviting ? "Sending..." : "Send Bulk Invite via SMS"}
                  </button>
                )}
              </div>
              {bulkInviteResult && <p className="text-sm text-green-400">{bulkInviteResult}</p>}
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Set your shifts</h2>
              <p className="text-sm text-gray-400">Define your work shifts so Sidekick knows when to escalate issues.</p>
              {shifts.map((s, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none" placeholder="Shift name" value={s.name} onChange={(e) => { const n = [...shifts]; n[i].name = e.target.value; setShifts(n); }} />
                  <input type="time" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none" value={s.start} onChange={(e) => { const n = [...shifts]; n[i].start = e.target.value; setShifts(n); }} />
                  <span className="text-gray-500 text-sm">to</span>
                  <input type="time" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none" value={s.end} onChange={(e) => { const n = [...shifts]; n[i].end = e.target.value; setShifts(n); }} />
                  <button onClick={() => setShifts(shifts.filter((_, j) => j !== i))} className="text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={() => setShifts([...shifts, { name: "", start: "06:00", end: "14:00" }])} className="flex items-center gap-1 text-orange-400 text-sm hover:text-orange-300">
                <Plus className="w-4 h-4" /> Add shift
              </button>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Upload documents (optional)</h2>
              <p className="text-sm text-gray-400">Upload manuals, SOPs, safety procedures — Sidekick will use them to answer worker questions.</p>
              <p className="text-xs text-gray-500 bg-gray-800 rounded-lg p-3">💡 No documents? No problem — Sidekick learns from every question your workers ask and every answer you give. You can always add docs later.</p>

              {/* Photo/Voice SOP options */}
              <div className="flex flex-wrap gap-2">
                <input ref={sopPhotoRef} type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSopPhoto(f); e.target.value = ""; }}
                />
                <button
                  onClick={() => sopPhotoRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white hover:border-orange-500"
                >
                  <Camera className="w-4 h-4" /> 📸 Snap a Photo of a Procedure
                </button>

                {!sopRecording ? (
                  <button
                    onClick={startSopRecording}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white hover:border-orange-500"
                  >
                    <Mic className="w-4 h-4" /> 🎤 Record a Procedure
                  </button>
                ) : (
                  <button
                    onClick={stopSopRecording}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-600 border border-red-500 rounded-lg text-sm text-white animate-pulse"
                  >
                    <Mic className="w-4 h-4" /> ⏹ Stop Recording
                  </button>
                )}
              </div>
              <div
                className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-orange-500 transition-colors cursor-pointer"
                onClick={() => document.getElementById("doc-upload-input")?.click()}
              >
                <Upload className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                <p className="text-gray-400 text-sm">Click to upload PDFs, TXT, or Markdown</p>
                <p className="text-gray-600 text-xs mt-1">Multiple files supported</p>
              </div>
              <input
                id="doc-upload-input"
                type="file"
                accept=".pdf,.txt,.md"
                multiple
                className="hidden"
                onChange={(e) => setDocFiles(Array.from(e.target.files || []))}
              />
              {docFiles.length > 0 && (
                <ul className="space-y-1">
                  {docFiles.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <FileText className="w-4 h-4 text-orange-400" /> {f.name}
                    </li>
                  ))}
                </ul>
              )}
              {uploadStatus && <p className="text-sm text-green-400">{uploadStatus}</p>}
            </div>
          )}

          {/* STEP 6 */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold">You&apos;re ready to go live! 🚀</h2>
                <p className="text-gray-400 mt-2">Share this with your team to get started:</p>
              </div>

              <div className="bg-gray-800 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">SMS Number</p>
                  <p className="text-2xl font-mono font-bold text-orange-400">{smsNumber}</p>
                </div>
                {joinCode && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Join Code</p>
                    <p className="text-2xl font-mono font-bold text-white">JOIN {joinCode}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Workers text <span className="text-orange-400 font-mono">JOIN {joinCode || "YOURCODE"}</span> to <span className="text-orange-400">{smsNumber}</span> to join
                </p>
              </div>

              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-sm font-medium mb-2">📋 QR Code (workers scan to join)</p>
                <div className="bg-white w-32 h-32 rounded flex items-center justify-center mx-auto">
                  <p className="text-gray-400 text-xs text-center px-2">QR code generation coming soon</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pb-8">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < 6 ? (
            <button
              onClick={() => {
                if (step === 1) handleStep1();
                else if (step === 2) handleStep2();
                else if (step === 3) handleStep3();
                else if (step === 4) handleStep4();
                else if (step === 5) handleStep5();
              }}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : step === 5 && docFiles.length === 0 ? "Skip" : "Continue"}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-medium transition-colors"
            >
              Go to Dashboard <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
