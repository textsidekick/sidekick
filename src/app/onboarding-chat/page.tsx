"use client";
import IntegrationSelector from "@/components/IntegrationSelector";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Send, Home, Loader2, Lock, Smartphone, CheckCircle2, Copy, Pencil, Mic, MicOff, Paperclip, X, FileText, Link as LinkIcon, KeyRound } from "lucide-react";
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

export default function OnboardingChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey! Let's get Sidekick set up for your team. What's your company name?",
    },
  ]);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      alert("Microphone access is required for voice input.");
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
      const res = await fetch("/api/onboarding/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.text) {
        setInput(data.text);
      }
    } catch {
      alert("Failed to transcribe audio. Please type your answer instead.");
    } finally {
      setLoading(false);
    }
  };

  // File upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
    // Reset input so the same file can be selected again
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
      await fetch("/api/onboarding/upload", {
        method: "POST",
        body: formData,
      });
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/onboarding/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };
      setMessages([...newMessages, assistantMessage]);

      // Check if interview is complete
      const isComplete = 
        data.message.includes("All set! Setting up your account now") ||
        data.message.includes("All set") && data.message.includes("setting up") ||
        data.message.includes("Perfect! I have everything I need");
      
      if (isComplete) {
        setIsComplete(true);
        handleCompleteInterview([...newMessages, assistantMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Sorry, I hit a snag. Could you try that again? ",
        },
      ]);
    } finally {
      setLoading(false);
    }
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
        body: JSON.stringify({
          messages: finalMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[Completion Error]", errorData);
        setCompletionError(errorData.error || "Failed to complete onboarding");
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Upload any attached files
      if (uploadedFiles.length > 0 && data.companyId) {
        await uploadFiles(data.companyId);
        setUploadedFiles([]);
      }

      setOnboardingResult(data);
      setLoading(false);

      // Generate manager credentials in background (non-blocking)
      if (data.companyId) {
        setGeneratingCredentials(true);
        fetch("/api/auth/generate-credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId: data.companyId }),
        })
          .then(res => res.json())
          .then(credData => {
            if (credData.success) {
              setManagerCredentials({ username: credData.username, password: credData.password });
            }
            setGeneratingCredentials(false);
          })
          .catch(e => {
            console.error("Failed to generate credentials:", e);
            setGeneratingCredentials(false);
          });
      }
    } catch (error) {
      console.error("Completion error:", error);
      setCompletionError(
        error instanceof Error ? error.message : "Failed to save onboarding data"
      );
      setIsComplete(false);
      setLoading(false);
    }
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
      <div
        style={{
          minHeight: "100vh",
          background: "#F7F3EC",
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
        }}
      >
        <header
          style={{
            background: "white",
            borderBottom: "1px solid rgba(28,26,22,0.1)",
            padding: "16px 16px",
            zIndex: 40,
            marginLeft: "-16px",
            marginRight: "-16px",
            marginTop: "-24px",
          }}
        >
          <div
            style={{
              maxWidth: "672px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Link
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "linear-gradient(135deg, #C96442, #A74D30)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src="/images/logo/sidekick-logo-blue.png"
                    alt="Sidekick"
                    style={{ width: "24px", height: "24px", filter: "brightness(2)" }}
                  />
                </div>
                <span style={{ fontWeight: 700, color: "#f8fafc", fontSize: "18px" }}>
                  Sidekick
                </span>
              </Link>
            </div>
          </div>
        </header>
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            maxWidth: "672px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "12px",
              padding: "24px",
              textAlign: "center",
            }}
          >
            <h2 style={{ color: "#f87171", marginBottom: "8px" }}>
              Oops! Something went wrong
            </h2>
            <p style={{ color: "#fca5a5", marginBottom: "24px" }}>
              {completionError}
            </p>
            <button
              onClick={() => {
                setCompletionError(null);
                setIsComplete(false);
              }}
              style={{
                background: "#dc2626",
                color: "white",
                padding: "12px 24px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F7F3EC",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          background: "white",
          borderBottom: "1px solid rgba(28,26,22,0.1)",
          padding: "16px 16px",
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: "672px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#C96442",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="/images/logo/sidekick-logo-blue.png"
                  alt="Sidekick"
                  style={{ width: "24px", height: "24px", filter: "brightness(0) invert(1)" }}
                />
              </div>
              <span style={{ fontWeight: 700, color: "#1C1A16", fontSize: "18px" }}>
                Sidekick
              </span>
            </Link>
          </div>
          <Link
            href="/choose"
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "#F0EBE3",
              color: "#1C1A16",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(28,26,22,0.1)",
              textDecoration: "none",
            }}
          >
            <Home size={20} />
          </Link>
        </div>
      </header>

      {/* Chat Container */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "32px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        <div style={{ maxWidth: "672px", margin: "0 auto", width: "100%" }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent:
                  msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: "16px",
                gap: "12px",
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  padding: msg.role === "user" ? "12px 18px" : "14px 18px",
                  borderRadius:
                    msg.role === "user"
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                  background:
                    msg.role === "user"
                      ? "#C96442"
                      : "white",
                  color:
                    msg.role === "user"
                      ? "white"
                      : "#1C1A16",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  border:
                    msg.role === "user"
                      ? "none"
                      : "1px solid rgba(28,26,22,0.1)",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: "18px 18px 18px 4px",
                  background: "white",
                  color: "rgba(28,26,22,0.5)",
                  border: "1px solid rgba(28,26,22,0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                }}
              >
                <Loader2
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Integration Panel */}
      <div style={{ maxWidth: 672, margin: "0 auto", width: "100%", padding: "0 16px 12px" }}>
        <details style={{ background: "white", borderRadius: 12, border: "1px solid rgba(28,26,22,0.08)" }}>
          <summary style={{ padding: "12px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#1C1A16" }}>
            {"️ Connect Your Tools — pull docs from Google Drive, Slack, Notion & more"}
          </summary>
          <div style={{ padding: "0 8px 8px" }}>
            <IntegrationSelector companyId={sessionId} />
          </div>
        </details>
      </div>

      {/* Input */}
      <div
        style={{
          background: "white",
          borderTop: "1px solid rgba(28,26,22,0.1)",
          padding: "16px 16px 20px",
          position: "sticky",
          bottom: 0,
        }}
      >
        {/* Integrations panel */}
        {showIntegrations && onboardingResult && (
          <div
            style={{
              maxWidth: "672px",
              margin: "0 auto 12px",
              background: "rgba(30, 41, 59, 0.6)",
              borderRadius: "12px",
              padding: "16px",
              border: "1px solid rgba(59, 130, 246, 0.2)",
            }}
          >
            <p style={{ color: "#f8fafc", fontWeight: 600, marginBottom: "12px", fontSize: "14px" }}>
              Connect your tools
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <a
                href={`/api/auth/google?companyId=${onboardingResult.companyId}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#f8fafc",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google Drive
              </a>
              <a
                href={`/api/auth/dropbox?companyId=${onboardingResult.companyId}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#f8fafc",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0061FF"><path d="M6 2l6 3.75L6 9.5 0 5.75zM18 2l6 3.75-6 3.75-6-3.75zM0 13.25L6 9.5l6 3.75L6 17zM18 9.5l6 3.75L18 17l-6-3.75zM6 18.25l6-3.75 6 3.75-6 3.75z"/></svg>
                Dropbox
              </a>
            </div>
            <button
              onClick={() => setShowIntegrations(false)}
              style={{
                marginTop: "10px",
                background: "none",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Close
            </button>
          </div>
        )}

        {/* File preview bar */}
        {uploadedFiles.length > 0 && (
          <div
            style={{
              maxWidth: "672px",
              margin: "0 auto 10px",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {uploadedFiles.map((file, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(59, 130, 246, 0.15)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "13px",
                  color: "#60a5fa",
                }}
              >
                <FileText size={14} />
                <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {file.name}
                </span>
                <button
                  onClick={() => removeFile(i)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: "2px",
                    display: "flex",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            maxWidth: "672px",
            margin: "0 auto",
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />

          {/* Attachment button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || isComplete}
            title="Upload documents"
            style={{
              padding: "12px",
              borderRadius: "8px",
              background: "#F0EBE3",
              color: "#1C1A16",
              border: "1px solid rgba(28,26,22,0.1)",
              cursor: loading || isComplete ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Paperclip size={20} />
          </button>

          {/* Mic button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={loading || isComplete}
            title={isRecording ? "Stop recording" : "Voice input"}
            style={{
              padding: "12px",
              borderRadius: "12px",
              background: isRecording
                ? "#fef2f2"
                : "#F0EBE3",
              color: isRecording ? "#ef4444" : "#1C1A16",
              border: isRecording
                ? "1px solid #fecaca"
                : "1px solid rgba(28,26,22,0.1)",
              cursor: loading || isComplete ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              animation: isRecording ? "pulse 1.5s ease-in-out infinite" : "none",
            }}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Text input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? "Listening..." : "Type or speak your answer..."}
            disabled={loading || isRecording}
            style={{
              flex: 1,
              padding: "14px 18px",
              borderRadius: "14px",
              border: isRecording
                ? "2px solid #ef4444"
                : "1px solid rgba(28,26,22,0.15)",
              fontSize: "15px",
              outline: "none",
              color: "#1C1A16",
              background: loading ? "#F0EBE3" : "white",
              cursor: loading || isRecording ? "not-allowed" : "text",
            }}
          />

          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim() || isComplete}
            style={{
              padding: "14px 22px",
              borderRadius: "14px",
              background:
                !loading && input.trim() && !isComplete
                  ? "#C96442"
                  : "#F0EBE3",
              color:
                !loading && input.trim() && !isComplete ? "white" : "rgba(28,26,22,0.35)",
              border: "1px solid rgba(28,26,22,0.1)",
              cursor:
                !loading && input.trim() && !isComplete ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {loading || isComplete ? (
              <Loader2
                size={20}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>

        {/* Quick action hint */}
        <div
          style={{
            maxWidth: "672px",
            margin: "8px auto 0",
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "12px", color: "rgba(28,26,22,0.35)" }}>
            Voice input &bull; Upload docs &bull; Type to reply
          </span>
          {onboardingResult && (
            <button
              onClick={() => setShowIntegrations(!showIntegrations)}
              style={{
                fontSize: "12px",
                color: "#60a5fa",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <LinkIcon size={12} />
              Connect apps
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
