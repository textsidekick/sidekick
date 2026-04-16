"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Home, Loader2, Lock, Smartphone, CheckCircle2 } from "lucide-react";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          background: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
        }}
      >
        <header
          style={{
            position: "sticky",
            top: 0,
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid #e2e8f0",
            padding: "12px 16px",
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
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  textDecoration: "none",
                }}
              >
                <img
                  src="/images/logo/sidekick-logo-blue.png"
                  alt="Sidekick"
                  style={{ width: "32px", height: "32px" }}
                />
                <span style={{ fontWeight: 600, color: "#1e293b" }}>
                  Sidekick
                </span>
              </Link>
            </div>
            <Link
              href="/"
              style={{
                padding: "8px",
                borderRadius: "8px",
                background: "#f1f5f9",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
                background: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <CheckCircle2 size={48} color="#16a34a" />
            </div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#1e293b",
                marginBottom: "12px",
              }}
            >
              You're all set! 🎉
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "#64748b",
              }}
            >
              {onboardingResult.companyName} is ready to go.
            </p>
          </div>

          <div
            style={{
              background: "linear-gradient(to right, #eff6ff, #f1f5f9)",
              borderRadius: "16px",
              padding: "24px",
              textAlign: "left",
              border: "1px solid #bfdbfe",
              marginBottom: "24px",
              width: "100%",
            }}
          >
            <p
              style={{
                fontWeight: 600,
                color: "#1e40af",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Lock size={20} />
              Your Company Access Code
            </p>
            <div
              style={{
                background: "white",
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
                  color: "#1d4ed8",
                  fontFamily: "monospace",
                  letterSpacing: "8px",
                }}
              >
                {onboardingResult.accessCode}
              </div>
              <p
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                  marginTop: "12px",
                }}
              >
                Share this code with your workers to join
              </p>
            </div>
          </div>

          <div
            style={{
              background: "#eff6ff",
              borderRadius: "16px",
              padding: "24px",
              textAlign: "left",
              width: "100%",
              marginBottom: "24px",
            }}
          >
            <p
              style={{
                fontWeight: 600,
                color: "#1e293b",
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
                background: "white",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: "#475569",
                  marginBottom: "8px",
                }}
              >
                Workers text this to your Sidekick number:
              </p>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#2563eb",
                  fontFamily: "monospace",
                  background: "#eff6ff",
                  borderRadius: "8px",
                  padding: "12px",
                  textAlign: "center",
                  marginBottom: "12px",
                }}
              >
                {onboardingResult.joinCommand}
              </div>
              <p
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                  textAlign: "center",
                }}
              >
                Sidekick number:{" "}
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 500,
                  }}
                >
                  {onboardingResult.twilioNumber}
                </span>
              </p>
            </div>
          </div>

          <Link
            href="/manager"
            style={{
              display: "block",
              width: "100%",
              background: "#2563eb",
              color: "white",
              padding: "16px",
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "18px",
              textDecoration: "none",
              textAlign: "center",
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
          background: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
        }}
      >
        <header
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid #e2e8f0",
            padding: "12px 16px",
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
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  textDecoration: "none",
                }}
              >
                <img
                  src="/images/logo/sidekick-logo-blue.png"
                  alt="Sidekick"
                  style={{ width: "32px", height: "32px" }}
                />
                <span style={{ fontWeight: 600, color: "#1e293b" }}>
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
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "12px",
              padding: "24px",
              textAlign: "center",
            }}
          >
            <h2 style={{ color: "#b91c1c", marginBottom: "8px" }}>
              Oops! Something went wrong
            </h2>
            <p style={{ color: "#7f1d1d", marginBottom: "24px" }}>
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
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
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
        background: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #e2e8f0",
          padding: "12px 16px",
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
              }}
            >
              <img
                src="/images/logo/sidekick-logo-blue.png"
                alt="Sidekick"
                style={{ width: "32px", height: "32px" }}
              />
              <span style={{ fontWeight: 600, color: "#1e293b" }}>
                Sidekick
              </span>
            </Link>
            <span style={{ color: "#cbd5e1" }}>|</span>
            <span style={{ fontSize: "14px", color: "#64748b" }}>
              Quick Setup
            </span>
          </div>
          <Link
            href="/"
            style={{
              padding: "8px",
              borderRadius: "8px",
              background: "#f1f5f9",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
          padding: "24px 16px",
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
                  padding: "12px 16px",
                  borderRadius:
                    msg.role === "user"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                  background:
                    msg.role === "user"
                      ? "#3b82f6"
                      : "#ffffff",
                  color:
                    msg.role === "user"
                      ? "white"
                      : "#1e293b",
                  fontSize: "15px",
                  lineHeight: "1.5",
                  border:
                    msg.role === "user"
                      ? "none"
                      : "1px solid #e2e8f0",
                  boxShadow:
                    msg.role === "user"
                      ? "0 2px 8px rgba(59, 130, 246, 0.2)"
                      : "0 1px 3px rgba(0,0,0,0.1)",
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
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "16px 16px 16px 4px",
                  background: "#ffffff",
                  color: "#64748b",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
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
          background: "white",
          borderTop: "1px solid #e2e8f0",
          padding: "16px",
          position: "sticky",
          bottom: 0,
        }}
      >
        <div
          style={{
            maxWidth: "672px",
            margin: "0 auto",
            display: "flex",
            gap: "12px",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer..."
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "12px",
              border: "2px solid #e2e8f0",
              fontSize: "16px",
              outline: "none",
              color: "#1e293b",
              background: loading ? "#f1f5f9" : "white",
              cursor: loading ? "not-allowed" : "text",
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim() || isComplete}
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              background:
                !loading && input.trim() && !isComplete ? "#3b82f6" : "#e2e8f0",
              color:
                !loading && input.trim() && !isComplete ? "white" : "#94a3b8",
              border: "none",
              cursor:
                !loading && input.trim() && !isComplete ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 500,
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
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
