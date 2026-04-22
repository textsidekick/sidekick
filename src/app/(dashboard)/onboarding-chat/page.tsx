"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Send, Home, Loader2, Lock, Smartphone, CheckCircle2, Copy, Pencil, Mic, MicOff, Paperclip, X, FileText, Link as LinkIcon } from "lucide-react";
import { formatPhoneForDisplay, formatPhoneUnformatted, createSmsLink } from "@/lib/phone";

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
        "Company/Organization or Event? (1 or 2)",
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
      if (data.message.includes("Perfect! I have everything I need")) {
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
            "Sorry, I hit a snag. Could you try that again? 😅",
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
        throw new Error("Failed to complete onboarding");
      }

      const data = await response.json();

      // Upload any attached files
      if (uploadedFiles.length > 0 && data.companyId) {
        await uploadFiles(data.companyId);
        setUploadedFiles([]);
      }

      setOnboardingResult(data);
    } catch (error) {
      console.error("Completion error:", error);
      setCompletionError(
        error instanceof Error ? error.message : "Failed to save onboarding data"
      );
      setIsComplete(false);
    } finally {
      setLoading(false);
    }
  };

  // Show success screen
  if (onboardingResult && onboardingResult.success) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
        }}
      >
        <header
          style={{
            position: "sticky",
            top: 0,
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(59, 130, 246, 0.2)",
            padding: "16px 16px",
            zIndex: 40,
            marginLeft: "-16px",
            marginRight: "-16px",
            marginTop: "-24px",
            paddingLeft: "16px",
            paddingRight: "16px",
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
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
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
            <Link
              href="/"
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                background: "rgba(59, 130, 246, 0.1)",
                color: "#60a5fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              <Home size={20} />
            </Link>
          </div>
        </header>

        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "672px",
            margin: "0 auto",
            width: "100%",
            paddingTop: "32px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "48px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(34, 197, 94, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                border: "1px solid rgba(34, 197, 94, 0.3)",
              }}
            >
              <CheckCircle2 size={48} color="#22c55e" />
            </div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#f8fafc",
                marginBottom: "12px",
              }}
            >
              You're all set! 🎉
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "#94a3b8",
              }}
            >
              {onboardingResult.companyName} is ready to go.
            </p>
          </div>

          <div
            style={{
              background: "rgba(59, 130, 246, 0.1)",
              borderRadius: "16px",
              padding: "24px",
              textAlign: "left",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              marginBottom: "24px",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <p
                style={{
                  fontWeight: 600,
                  color: "#60a5fa",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Lock size={20} />
                Your Company Access Code
              </p>
              {!editingCode && (
                <button
                  onClick={() => {
                    setEditingCode(true);
                    setCustomCode(onboardingResult.accessCode);
                  }}
                  style={{
                    background: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    color: "#60a5fa",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  <Pencil size={14} />
                  Customize
                </button>
              )}
            </div>
            {editingCode ? (
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  borderRadius: "12px",
                  padding: "20px",
                  border: "2px solid #3b82f6",
                }}
              >
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                  <input
                    type="text"
                    value={customCode}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                      setCustomCode(val);
                      setCodeError(null);
                      setCodeSuggestions([]);
                    }}
                    placeholder="Enter custom code"
                    maxLength={12}
                    style={{
                      flex: 1,
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "2px solid rgba(59, 130, 246, 0.3)",
                      fontSize: "18px",
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      letterSpacing: "4px",
                      textAlign: "center",
                      outline: "none",
                      color: "#f8fafc",
                      background: "rgba(30, 41, 59, 0.6)",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                  <button
                    onClick={() => handleCheckCode(customCode)}
                    disabled={!customCode.trim() || customCode.length < 2}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      background: "rgba(59, 130, 246, 0.2)",
                      color: "#60a5fa",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      cursor: customCode.trim() && customCode.length >= 2 ? "pointer" : "not-allowed",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    Check Availability
                  </button>
                  <button
                    onClick={() => handleSaveCode(customCode)}
                    disabled={savingCode || !customCode.trim() || customCode.length < 2 || !!codeError}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      background: !savingCode && customCode.trim() && customCode.length >= 2 && !codeError
                        ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                        : "rgba(59, 130, 246, 0.1)",
                      color: "white",
                      border: "none",
                      cursor: !savingCode && customCode.trim() && !codeError ? "pointer" : "not-allowed",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    {savingCode ? "Saving..." : "Save Code"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingCode(false);
                      setCustomCode("");
                      setCodeError(null);
                      setCodeSuggestions([]);
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      background: "transparent",
                      color: "#94a3b8",
                      border: "1px solid rgba(148, 163, 184, 0.3)",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    Cancel
                  </button>
                </div>
                {codeError && (
                  <p style={{ color: "#f87171", fontSize: "13px", marginTop: "12px", textAlign: "center" }}>
                    {codeError}
                  </p>
                )}
                {codeSuggestions.length > 0 && (
                  <div style={{ marginTop: "12px", textAlign: "center" }}>
                    <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>
                      Try one of these:
                    </p>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                      {codeSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setCustomCode(suggestion);
                            setCodeError(null);
                            setCodeSuggestions([]);
                          }}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "8px",
                            background: "rgba(59, 130, 246, 0.15)",
                            color: "#60a5fa",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            cursor: "pointer",
                            fontFamily: "monospace",
                            fontWeight: 600,
                            fontSize: "14px",
                            letterSpacing: "2px",
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  borderRadius: "12px",
                  padding: "20px",
                  textAlign: "center",
                  border: "2px solid #3b82f6",
                }}
              >
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "bold",
                    color: "#60a5fa",
                    fontFamily: "monospace",
                    letterSpacing: "8px",
                  }}
                >
                  {onboardingResult.accessCode}
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#94a3b8",
                    marginTop: "12px",
                  }}
                >
                  Share this code with your workers to join
                </p>
              </div>
            )}
          </div>

          <div
            style={{
              background: "rgba(30, 41, 59, 0.6)",
              borderRadius: "16px",
              padding: "24px",
              textAlign: "left",
              width: "100%",
              marginBottom: "24px",
              border: "1px solid rgba(59, 130, 246, 0.1)",
            }}
          >
            <p
              style={{
                fontWeight: 600,
                color: "#f8fafc",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Smartphone size={20} />
              How workers join
            </p>
            <div
              style={{
                background: "rgba(15, 23, 42, 0.6)",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: "#94a3b8",
                  marginBottom: "12px",
                }}
              >
                Workers text this to your Sidekick number:
              </p>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#60a5fa",
                  fontFamily: "monospace",
                  background: "rgba(59, 130, 246, 0.1)",
                  borderRadius: "8px",
                  padding: "12px",
                  textAlign: "center",
                  marginBottom: "16px",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                }}
              >
                {onboardingResult.joinCommand}
              </div>
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.6)",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "12px",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  Sidekick number:
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#94a3b8",
                        marginBottom: "4px",
                      }}
                    >
                      Formatted:
                    </p>
                    <a
                      href={createSmsLink(onboardingResult.twilioNumber)}
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#60a5fa",
                        textDecoration: "none",
                        fontFamily: "monospace",
                      }}
                    >
                      {formatPhoneForDisplay(onboardingResult.twilioNumber)}
                    </a>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#94a3b8",
                        marginBottom: "4px",
                      }}
                    >
                      Simple:
                    </p>
                    <p
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#f8fafc",
                        fontFamily: "monospace",
                      }}
                    >
                      {formatPhoneUnformatted(onboardingResult.twilioNumber)}
                    </p>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    marginTop: "8px",
                  }}
                >
                  📱 Tap formatted number on mobile to text directly
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/manager"
            style={{
              display: "block",
              width: "100%",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "white",
              padding: "16px",
              borderRadius: "14px",
              fontWeight: 600,
              fontSize: "18px",
              textDecoration: "none",
              textAlign: "center",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              boxShadow: "0 8px 16px rgba(59, 130, 246, 0.3)",
            }}
          >
            Go to Dashboard →
          </Link>
        </main>
      </div>
    );
  }

  // Show error state
  if (completionError) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
        }}
      >
        <header
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(59, 130, 246, 0.2)",
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
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
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
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(59, 130, 246, 0.2)",
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
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
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
          <Link
            href="/"
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              background: "rgba(59, 130, 246, 0.1)",
              color: "#60a5fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(59, 130, 246, 0.2)",
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
                      ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                      : "rgba(255, 255, 255, 0.95)",
                  color:
                    msg.role === "user"
                      ? "white"
                      : "#1e293b",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  border:
                    msg.role === "user"
                      ? "none"
                      : "1px solid rgba(59, 130, 246, 0.1)",
                  boxShadow:
                    msg.role === "user"
                      ? "0 8px 16px rgba(59, 130, 246, 0.3)"
                      : "0 4px 12px rgba(0, 0, 0, 0.08)",
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
                  background: "rgba(255, 255, 255, 0.95)",
                  color: "#64748b",
                  border: "1px solid rgba(59, 130, 246, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
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

      {/* Input */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.8)",
          borderTop: "1px solid rgba(59, 130, 246, 0.2)",
          padding: "16px 16px 20px",
          position: "sticky",
          bottom: 0,
          backdropFilter: "blur(12px)",
        }}
      >
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
              borderRadius: "12px",
              background: "rgba(59, 130, 246, 0.1)",
              color: "#60a5fa",
              border: "1px solid rgba(59, 130, 246, 0.2)",
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
                ? "rgba(239, 68, 68, 0.2)"
                : "rgba(59, 130, 246, 0.1)",
              color: isRecording ? "#f87171" : "#60a5fa",
              border: isRecording
                ? "1px solid rgba(239, 68, 68, 0.4)"
                : "1px solid rgba(59, 130, 246, 0.2)",
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
                ? "2px solid rgba(239, 68, 68, 0.4)"
                : "2px solid rgba(59, 130, 246, 0.3)",
              fontSize: "15px",
              outline: "none",
              color: "#f8fafc",
              background: loading ? "rgba(30, 41, 59, 0.8)" : "rgba(30, 41, 59, 0.6)",
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
                  ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                  : "rgba(59, 130, 246, 0.2)",
              color:
                !loading && input.trim() && !isComplete ? "white" : "#60a5fa",
              border: "1px solid rgba(59, 130, 246, 0.2)",
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
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            🎙️ Voice &bull; 📎 Upload docs &bull; Type to reply
          </span>
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
