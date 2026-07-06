"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, Check, Lock, Smartphone, Home, Pencil, QrCode, Download, Sparkles } from "lucide-react";
import { formatPhoneForDisplay, formatPhoneUnformatted } from "@/lib/phone";
import { QRCodeSVG } from "qrcode.react";

interface SuccessScreenProps {
  onboardingResult: {
    success: boolean;
    companyId: string;
    companyName: string;
    accessCode: string;
    twilioNumber: string;
    joinCommand: string;
  };
  managerCredentials?: { username: string; password: string } | null;
  generatingCredentials?: boolean;
}

export default function SuccessScreen({
  onboardingResult,
  managerCredentials,
  generatingCredentials,
}: SuccessScreenProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState(false);
  const [customCode, setCustomCode] = useState(onboardingResult.accessCode);
  const [savingCode, setSavingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [currentAccessCode, setCurrentAccessCode] = useState(onboardingResult.accessCode);
  const [currentJoinCommand, setCurrentJoinCommand] = useState(onboardingResult.joinCommand);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveCode = async () => {
    if (!customCode.trim()) return;
    setSavingCode(true);
    setCodeError(null);
    try {
      const res = await fetch("/api/onboarding/update-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: onboardingResult.companyId, newCode: customCode }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingCode(false);
        setCurrentAccessCode(data.accessCode);
        setCurrentJoinCommand(data.joinCommand);
      } else {
        setCodeError(data.error || "Failed to update code");
      }
    } catch {
      setCodeError("Failed to save code");
    }
    setSavingCode(false);
  };

  const smsLink = `sms:${onboardingResult.twilioNumber.replace(/[^0-9]/g, "")}?body=${encodeURIComponent("JOIN " + currentAccessCode)}`;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F3EC", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header
        style={{
          background: "white",
          borderBottom: "1px solid rgba(28,26,22,0.1)",
          padding: "16px 24px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/images/logo/sidekick-logo-blue.png" alt="Sidekick" style={{ width: "32px", height: "32px" }} />
            <span style={{ fontWeight: 700, fontSize: "18px", color: "#1C1A16" }}>Sidekick</span>
          </div>
          <Link
            href="/"
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "#F0EBE3",
              color: "#1C1A16",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
            }}
          >
            <Home size={18} />
            Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "48px 24px" }}>
        <div style={{ maxWidth: "600px", width: "100%" }}>
          {/* Success Icon */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(201,100,66,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <CheckCircle2 size={48} color="white" />
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#1C1A16", marginBottom: "12px" }}>You're all set</h1>
            <p style={{ fontSize: "16px", color: "rgba(28,26,22,0.5)" }}>{onboardingResult.companyName}'s operating memory is live. Your crew can start texting questions now.</p>
          </div>



          {/* QR Code */}
          <div style={{ background: "white", border: "1px solid rgba(28,26,22,0.1)", borderRadius: "12px", padding: "32px", marginBottom: "24px", textAlign: "center" }}>
            <h3 style={{ fontWeight: 600, color: "#1C1A16", fontSize: "16px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <QrCode size={18} />
              Scan to Join
            </h3>
            <p style={{ fontSize: "14px", color: "rgba(28,26,22,0.5)", marginBottom: "16px" }}>Workers scan this QR code to send the JOIN text automatically.</p>
            <div style={{ display: "inline-block", padding: "16px", background: "white", borderRadius: "8px", border: "1px solid rgba(28,26,22,0.1)" }}>
              <QRCodeSVG value={smsLink} size={200} level="M" />
            </div>
            <div style={{ marginTop: "12px" }}>
              <a
                href={smsLink}
                style={{ fontSize: "13px", color: "#C96442", textDecoration: "none" }}
              >
                Or tap here to send via SMS →
              </a>
            </div>
          </div>

          {/* Worker Join Instructions */}
          <div style={{ background: "white", border: "1px solid rgba(28,26,22,0.1)", borderRadius: "12px", padding: "32px", marginBottom: "24px" }}>
            <h3 style={{ fontWeight: 600, color: "#1C1A16", fontSize: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Smartphone size={18} />
              Workers: Text to Join
            </h3>
            <p style={{ fontSize: "14px", color: "rgba(28,26,22,0.5)", marginBottom: "12px" }}>Workers text this command to {formatPhoneForDisplay(onboardingResult.twilioNumber)}:</p>

            <div
              style={{
                background: "#F7F3EC",
                borderRadius: "8px",
                padding: "16px",
                border: "1px solid rgba(28,26,22,0.1)",
                marginBottom: "16px",
              }}
            >
              <div style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: "bold", color: "#1C1A16", textAlign: "center" }}>
                {currentJoinCommand}
              </div>
            </div>

            <a
              href={smsLink}
              style={{
                display: "block",
                width: "100%",
                background: "#A74D30",
                color: "white",
                padding: "12px",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                textDecoration: "none",
                textAlign: "center",
                border: "none",
                cursor: "pointer",
              }}
            >
              Send Test Message
            </a>
          </div>

          {/* Go to Dashboard */}
          <div style={{ textAlign: "center", marginTop: "8px" }}>
            <Link
              href="/today"
              style={{
                display: "inline-block",
                background: "#1C1A16",
                color: "#F7F3EC",
                padding: "14px 32px",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "15px",
                textDecoration: "none",
              }}
            >
              Go to Dashboard →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
