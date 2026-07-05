"use client";
import IntegrationSelector from "@/components/IntegrationSelector";
import DataPanel, { SectionData } from "@/components/onboarding/DataPanel";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Send, Home, Loader2, Lock, Smartphone, CheckCircle2, Copy, Pencil,
  Mic, MicOff, Paperclip, X, FileText, Link as LinkIcon, KeyRound,
  Building2, Wrench, Users, BookOpen, ClipboardList, Plug, LogOut,
  Upload, Circle,
} from "lucide-react";
import { formatPhoneForDisplay, formatPhoneUnformatted, createSmsLink } from "@/lib/phone";
import SuccessScreen from "./success-screen";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface OnboardingResult {
  success: boolean;
  companyId: string;
  companyName: string;
  industry: string;
  accessCode: string;
  twilioNumber: string;
  joinCommand: string;
}

type SectionId = "company" | "assets" | "team" | "knowledge" | "workorders" | "integrations";
type SectionStatus = "not_started" | "in_progress" | "complete";

interface SetupSection {
  id: SectionId;
  label: string;
  description: string;
  icon: React.ElementType;
  status: SectionStatus;
}

const INITIAL_SECTIONS: SetupSection[] = [
  { id: "company", label: "Company Info", description: "Basic details about your facility", icon: Building2, status: "in_progress" },
  { id: "assets", label: "Assets & Equipment", description: "Machines, lines, and tools", icon: Wrench, status: "not_started" },
  { id: "team", label: "Team Members", description: "Operators, technicians, managers", icon: Users, status: "not_started" },
  { id: "knowledge", label: "Knowledge Base", description: "SOPs, manuals, fixes, and tribal knowledge", icon: BookOpen, status: "not_started" },
  { id: "integrations", label: "Knowledge Sources", description: "Drive, Slack, Gusto & more", icon: Plug, status: "not_started" },
  { id: "workorders", label: "Past Work", description: "Maintenance and task history", icon: ClipboardList, status: "not_started" },
];

const SECTION_INTRO: Record<SectionId, string> = {
  company: "Hey! Let's get Sidekick set up for your team. What's your company name?",
  assets: "Let's talk about your equipment. What machines or production lines do you have? You can describe them, upload an asset list, or just tell me about the main ones.",
  team: "Tell me about your team. How many workers do you have? What roles or departments — operators, technicians, supervisors? You can also upload a roster if you have one.",
  knowledge: "Now let's capture your knowledge base. Do you have SOPs, equipment manuals, or safety docs? You can upload them directly, or describe your key procedures and I'll help draft them.",
  integrations: "Let's connect the systems Sidekick should learn from. This is where you can pull together docs, chat history, HR context, and operating knowledge from the tools you already use.",
  workorders: "Do you have existing work orders or maintenance history you'd like to import? You can upload a CSV, describe your workflow, or we can set this up from scratch.",
};

export default function OnboardingChat() {
  const [sections, setSections] = useState<SetupSection[]>(INITIAL_SECTIONS);
  const [activeSectionId, setActiveSectionId] = useState<SectionId>("company");
  const [sectionMessages, setSectionMessages] = useState<Record<SectionId, Message[]>>(() => {
    const initial: Record<string, Message[]> = {};
    for (const key of Object.keys(SECTION_INTRO) as SectionId[]) {
      initial[key] = [{ role: "assistant", content: SECTION_INTRO[key] }];
    }
    return initial as Record<SectionId, Message[]>;
  });
  const messages = sectionMessages[activeSectionId] || [];
  const setMessages = (msgs: Message[] | ((prev: Message[]) => Message[])) => {
    setSectionMessages((prev) => ({
      ...prev,
      [activeSectionId]: typeof msgs === "function" ? msgs(prev[activeSectionId] || []) : msgs,
    }));
  };
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const [isComplete, setIsComplete] = useState(false);
  const [onboardingResult, setOnboardingResult] = useState<OnboardingResult | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState(false);
  const [customCode, setCustomCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSuggestions, setCodeSuggestions] = useState<string[]>([]);
  const [savingCode, setSavingCode] = useState(false);
  const [managerCredentials, setManagerCredentials] = useState<{ username: string; password: string } | null>(null);
  const [generatingCredentials, setGeneratingCredentials] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Right panel data state
  const [sectionData, setSectionData] = useState<SectionData>({
    company: {},
    assets: [],
    team: [],
    knowledge: [],
    workorders: [],
    integrations: [],
  });

  // Parse [suggestions: A | B | C] from message text
  const parseSuggestions = (content: string): { text: string; suggestions: string[] } => {
    const match = content.match(/\[suggestions?:\s*([^\]]+)\]/);
    if (!match) return { text: content, suggestions: [] };
    const text = content.replace(/\[suggestions?:\s*[^\]]+\]/g, '').trim();
    const suggestions = match[1].split('|').map(s => s.trim()).filter(Boolean);
    return { text, suggestions };
  };

  const sendMessage = async (text: string) => {
    const userMessage: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch('/api/onboarding/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, sessionId, section: activeSectionId }),
      });
      if (!response.ok) throw new Error('Failed to get response');
      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.message };
      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      if (data.extractedData) {
        setSectionData(prev => {
          const updated = { ...prev };
          const ed = data.extractedData;
          if (ed.company) updated.company = { ...prev.company, ...ed.company };
          if (ed.assets && ed.assets.length > 0) updated.assets = ed.assets;
          if (ed.team && ed.team.length > 0) updated.team = ed.team;
          if (ed.knowledge && ed.knowledge.length > 0) updated.knowledge = ed.knowledge;
          if (ed.workorders && ed.workorders.length > 0) updated.workorders = ed.workorders;
          if (ed.integrations && ed.integrations.length > 0) updated.integrations = ed.integrations;
          return updated;
        });
      }
      const isDone = data.done ||
        data.message.includes('All set! Setting up your account now') ||
        (data.message.includes('All set') && data.message.includes('setting up')) ||
        data.message.includes('Perfect! I have everything I need');
      if (isDone) { setIsComplete(true); handleCompleteInterview(finalMessages); }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...newMessages, { role: 'assistant', content: "Sorry, I hit a snag. Could you try that again?" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (loading || isComplete) return;
    sendMessage(suggestion);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const completedCount = sections.filter((s) => s.status === "complete").length;
  const progressPct = Math.round((completedCount / sections.length) * 100);

  const handleCheckCode = async (code: string) => {
    if (!code.trim() || !onboardingResult) return;
    setCodeError(null);
    setCodeSuggestions([]);
    try {
      const res = await fetch("/api/onboarding/check-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, companyId: onboardingResult.companyId }),
      });
      const data = await res.json();
      if (data.available) {
        setCodeError(null);
        setCodeSuggestions([]);
      } else if (data.error) {
        setCodeError(data.error);
      } else {
        setCodeError(`"${data.code}" is taken`);
        setCodeSuggestions(data.suggestions || []);
      }
    } catch {
      setCodeError("Failed to check code");
    }
  };

  const handleSaveCode = async (code: string) => {
    if (!onboardingResult) return;
    setSavingCode(true);
    setCodeError(null);
    try {
      const res = await fetch("/api/onboarding/update-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: onboardingResult.companyId, newCode: code }),
      });
      const data = await res.json();
      if (data.success) {
        setOnboardingResult({
          ...onboardingResult,
          accessCode: data.accessCode,
          joinCommand: data.joinCommand,
        });
        setEditingCode(false);
        setCustomCode("");
        setCodeSuggestions([]);
      } else {
        setCodeError(data.error || "Failed to update code");
      }
    } catch {
      setCodeError("Failed to save code");
    } finally {
      setSavingCode(false);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        await transcribeAudio(audioBlob);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Microphone access is required for voice input. Please allow microphone permissions and try again." }]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      const res = await fetch("/api/onboarding/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      if (data.text) setInput(data.text);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Failed to transcribe audio. Please type your answer instead." }]);
    } finally {
      setLoading(false);
    }
  };

  // File upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (companyId: string) => {
    for (const file of uploadedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("companyId", companyId);
      await fetch("/api/onboarding/upload", { method: "POST", body: formData });
    }
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCompleteInterview = async (finalMessages: Message[]) => {
    try {
      setLoading(true);
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: finalMessages }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("[Completion Error]", errorData);
        setCompletionError(errorData.error || "Failed to complete onboarding");
        setLoading(false);
        return;
      }
      const data = await response.json();
      if (uploadedFiles.length > 0 && data.companyId) {
        await uploadFiles(data.companyId);
        setUploadedFiles([]);
      }
      setOnboardingResult(data);
      setLoading(false);
      if (data.companyId) {
        setGeneratingCredentials(true);
        fetch("/api/auth/generate-credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId: data.companyId }),
        })
          .then((res) => res.json())
          .then((credData) => {
            if (credData.success) setManagerCredentials({ username: credData.username, password: credData.password });
            setGeneratingCredentials(false);
          })
          .catch((e) => {
            console.error("Failed to generate credentials:", e);
            setGeneratingCredentials(false);
          });
      }
    } catch (error) {
      console.error("Completion error:", error);
      setCompletionError(error instanceof Error ? error.message : "Failed to save onboarding data");
      setIsComplete(false);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sidekick_auth");
    document.cookie = "sidekick_auth=; path=/; max-age=0";
    window.location.href = "/login";
  };

  // Show success screen
  if (onboardingResult && onboardingResult.success) {
    return (
      <SuccessScreen
        onboardingResult={onboardingResult}
        managerCredentials={managerCredentials}
        generatingCredentials={generatingCredentials}
      />
    );
  }

  // Show error state
  if (completionError) {
    return (
      <div style={{ minHeight: "100vh", background: "#F7F3EC", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "white", borderRadius: 16, border: "1px solid rgba(239,68,68,0.2)", padding: 32, textAlign: "center", maxWidth: 480 }}>
          <h2 style={{ color: "#ef4444", marginBottom: 8, fontSize: 20, fontWeight: 600 }}>Oops! Something went wrong</h2>
          <p style={{ color: "#6b7280", marginBottom: 24, fontSize: 14 }}>{completionError}</p>
          <button
            onClick={() => { setCompletionError(null); setIsComplete(false); }}
            style={{ background: "#C96442", color: "white", padding: "12px 24px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <div style={{ width: 320, background: "white", borderRight: "1px solid rgba(28,26,22,0.06)", display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, zIndex: 50 }}>
        {/* Logo */}
        <div style={{ height: 72, display: "flex", alignItems: "center", gap: 14, padding: "0 24px", borderBottom: "1px solid rgba(28,26,22,0.06)" }}>
          <div style={{ width: 40, height: 40, background: "#C96442", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", padding: 6 }}>
            <Image src="/images/logo/newsidekicklogo.png" alt="Sidekick" width={28} height={28} style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          </div>
          <span style={{ fontSize: 22, fontWeight: 700, color: "#1C1A16", letterSpacing: "-0.02em" }}>Sidekick</span>
        </div>

        {/* Progress */}
        <div style={{ padding: "20px 24px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(28,26,22,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Setup Progress</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#C96442" }}>{completedCount}/{sections.length}</span>
          </div>
          <div style={{ height: 6, background: "rgba(28,26,22,0.06)", borderRadius: 3 }}>
            <div style={{ height: 6, background: "#C96442", borderRadius: 3, width: `${progressPct}%`, transition: "width 0.3s" }} />
          </div>
        </div>

        {/* Setup Sections */}
        <nav style={{ flex: 1, padding: "8px 16px", overflowY: "auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = section.id === activeSectionId;
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSectionId(section.id);
                    if (section.status === "not_started") {
                      setSections((prev) => prev.map((s) => s.id === section.id ? { ...s, status: "in_progress" } : s));
                    }
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 10,
                    background: isActive ? "rgba(201,100,66,0.1)" : "transparent",
                    border: "none", cursor: "pointer", textAlign: "left", width: "100%",
                    transition: "background 0.15s",
                  }}
                >
                  <Icon size={20} style={{ color: isActive ? "#C96442" : "rgba(28,26,22,0.4)", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: isActive ? "#C96442" : "#1C1A16" }}>{section.label}</div>
                    <div style={{ fontSize: 13, color: "rgba(28,26,22,0.35)", marginTop: 2 }}>{section.description}</div>
                  </div>
                  {section.status === "complete" ? (
                    <CheckCircle2 size={18} style={{ color: "#22c55e", flexShrink: 0 }} />
                  ) : section.status === "in_progress" ? (
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#C96442", flexShrink: 0 }} />
                  ) : (
                    <Circle size={18} style={{ color: "rgba(28,26,22,0.15)", flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div style={{ marginTop: 16, padding: "12px 0", borderTop: "1px solid rgba(28,26,22,0.06)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(28,26,22,0.35)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "0 16px", marginBottom: 8 }}>Input Methods</div>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading || isComplete}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "10px 16px", borderRadius: 10,
                background: isRecording ? "rgba(239,68,68,0.1)" : "transparent",
                border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                color: isRecording ? "#ef4444" : "rgba(28,26,22,0.5)", fontSize: 15, fontWeight: 500,
              }}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              {isRecording ? "Stop Recording" : "Voice Input"}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || isComplete}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "10px 16px", borderRadius: 10,
                background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                color: "rgba(28,26,22,0.5)", fontSize: 15, fontWeight: 500,
              }}
            >
              <Upload size={20} />
              Upload Files
            </button>
            <button
              onClick={() => setActiveSectionId("integrations")}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "10px 16px", borderRadius: 10,
                background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                color: "rgba(28,26,22,0.5)", fontSize: 15, fontWeight: 500,
              }}
            >
              <LinkIcon size={20} />
              Connect Knowledge Sources
            </button>
          </div>
        </nav>

        {/* Bottom: Home + Logout */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(28,26,22,0.06)", display: "flex", flexDirection: "column", gap: 6 }}>
          <a
            href="/choose"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 16px", borderRadius: 10, fontSize: 15, fontWeight: 500,
              color: "rgba(28,26,22,0.5)", border: "1px solid rgba(28,26,22,0.08)",
              textDecoration: "none", background: "white", width: "100%",
            }}
          >
            <Home size={18} /> Home
          </a>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 16px", borderRadius: 10, fontSize: 15, fontWeight: 500,
              color: "rgba(28,26,22,0.5)", border: "1px solid rgba(28,26,22,0.08)",
              background: "white", cursor: "pointer", width: "100%",
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────── */}
      <div style={{ marginLeft: 320, marginRight: 400, flex: 1, background: "#F7F3EC", display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Chat area */}
        <div style={{ flex: 1, overflow: "auto", padding: "32px 24px", display: "flex", flexDirection: "column" }}>
          <div style={{ maxWidth: 672, margin: "0 auto", width: "100%" }}>
            {messages.map((msg, idx) => {
              const isLastAssistant = msg.role === 'assistant' && idx === messages.length - 1;
              const { text, suggestions } = msg.role === 'assistant' ? parseSuggestions(msg.content) : { text: msg.content, suggestions: [] };
              return (
              <div key={idx}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: suggestions.length > 0 ? 8 : 16, gap: 12,
                  }}
                >
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: msg.role === "user" ? "12px 18px" : "14px 18px",
                      borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      background: msg.role === "user" ? "#C96442" : "white",
                      color: msg.role === "user" ? "white" : "#1C1A16",
                      fontSize: 15, lineHeight: "1.6",
                      border: msg.role === "user" ? "none" : "1px solid rgba(28,26,22,0.1)",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                    }}
                  >
                    {text}
                  </div>
                </div>
                {suggestions.length > 0 && (
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 8,
                    marginBottom: 16, paddingLeft: 4,
                  }}>
                    {suggestions.map((s, si) => (
                      <button
                        key={si}
                        onClick={() => handleSuggestionClick(s)}
                        disabled={loading || isComplete || !isLastAssistant}
                        style={{
                          padding: '8px 16px', borderRadius: 20,
                          border: '1.5px solid rgba(201,100,66,0.35)',
                          background: 'rgba(201,100,66,0.06)',
                          color: '#C96442', fontSize: 14, fontWeight: 500,
                          cursor: loading || isComplete || !isLastAssistant ? 'default' : 'pointer',
                          opacity: !isLastAssistant ? 0.5 : 1,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { if (isLastAssistant && !loading && !isComplete) { (e.target as HTMLButtonElement).style.background = 'rgba(201,100,66,0.15)'; } }}
                        onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'rgba(201,100,66,0.06)'; }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              );
            })}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 20 }}>
                <div style={{
                  padding: "14px 18px", borderRadius: "18px 18px 18px 4px", background: "white",
                  color: "rgba(28,26,22,0.5)", border: "1px solid rgba(28,26,22,0.1)",
                  display: "flex", alignItems: "center", gap: 10, boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                }}>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* File preview */}
        {uploadedFiles.length > 0 && (
          <div style={{ maxWidth: 672, margin: "0 auto", padding: "0 24px 8px", width: "100%", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {uploadedFiles.map((file, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(201,100,66,0.1)", border: "1px solid rgba(201,100,66,0.2)",
                borderRadius: 8, padding: "4px 10px", fontSize: 13, color: "#C96442",
              }}>
                <FileText size={14} />
                <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                <button onClick={() => removeFile(i)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 2, display: "flex" }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input area */}
        <div style={{ background: "white", borderTop: "1px solid rgba(28,26,22,0.1)", padding: "16px 24px 20px" }}>
          <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls" onChange={handleFileSelect} style={{ display: "none" }} />
          <div style={{ maxWidth: 672, margin: "0 auto", display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isRecording ? "Listening..." : "Type or speak your answer..."}
              disabled={loading || isRecording}
              style={{
                flex: 1, padding: "14px 18px", borderRadius: 14,
                border: isRecording ? "2px solid #ef4444" : "1px solid rgba(28,26,22,0.15)",
                fontSize: 15, outline: "none", color: "#1C1A16",
                background: loading ? "#F0EBE3" : "white",
                cursor: loading || isRecording ? "not-allowed" : "text",
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim() || isComplete}
              style={{
                padding: "14px 22px", borderRadius: 14,
                background: !loading && input.trim() && !isComplete ? "#C96442" : "#F0EBE3",
                color: !loading && input.trim() && !isComplete ? "white" : "rgba(28,26,22,0.35)",
                border: "1px solid rgba(28,26,22,0.1)",
                cursor: !loading && input.trim() && !isComplete ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", gap: 8, fontWeight: 600, flexShrink: 0,
              }}
            >
              {loading || isComplete ? <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Right Panel ──────────────────────────────────── */}
      <DataPanel
        activeSectionId={activeSectionId}
        data={sectionData}
        integrationSelector={<IntegrationSelector companyId={sessionId} compact />}
      />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
