"use client";
import React, { useState, useRef } from "react";
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

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const smsLink = `sms:${onboardingResult.twilioNumber.replace(/[^0-9]/g, '')}?body=${encodeURIComponent(onboardingResult.joinCommand)}`;

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header
        style={{
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "16px 24px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/images/logo/sidekick-logo-blue.png" alt="Sidekick" style={{ width: "32px", height: "32px" }} />
            <span style={{ fontWeight: 700, fontSize: "18px", color: "#111827" }}>Sidekick</span>
          </div>
          <Link
            href="/"
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "#f3f4f6",
              color: "#374151",
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
                background: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <CheckCircle2 size={48} color="#1e40af" />
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#111827", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>You're all set <Sparkles size={28} color="#3b82f6" /></h1>
            <p style={{ fontSize: "16px", color: "#6b7280" }}>{onboardingResult.companyName} is ready to go.</p>
          </div>

          {/* Access Code Card */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "32px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <label style={{ fontWeight: 600, color: "#111827", fontSize: "14px" }}>
                <Lock size={16} style={{ display: "inline", marginRight: "6px" }} />
                Your Access Code
              </label>
              {!editingCode && (
                <button
                  onClick={() => {
                    setEditingCode(true);
                    setCustomCode(onboardingResult.accessCode);
                  }}
                  style={{
                    background: "#f3f4f6",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    color: "#374151",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Pencil size={14} />
                  Customize
                </button>
              )}
            </div>

            {!editingCode ? (
              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: "8px",
                  padding: "20px",
                  textAlign: "center",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ fontSize: "36px", fontWeight: "bold", color: "#1f2937", fontFamily: "monospace", letterSpacing: "4px", marginBottom: "16px" }}>
                  {onboardingResult.accessCode}
                </div>
                <button
                  onClick={() => handleCopy(onboardingResult.accessCode, "code")}
                  style={{
                    background: "#dbeafe",
                    border: "1px solid #bfdbfe",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    color: "#1e40af",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    margin: "0 auto",
                  }}
                >
                  {copiedField === "code" ? <Check size={14} /> : <Copy size={14} />}
                  {copiedField === "code" ? "Copied!" : "Copy"}
                </button>
              </div>
            ) : (
              <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "16px", border: "1px solid #e5e7eb" }}>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => {
                    setCustomCode(e.target.value.toUpperCase());
                    setCodeError(null);
                  }}
                  maxLength={12}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    fontSize: "18px",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    letterSpacing: "4px",
                    textAlign: "center",
                    marginBottom: "12px",
                  }}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleCopy(customCode, "custom")}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "6px",
                      background: "#dbeafe",
                      color: "#1e40af",
                      border: "1px solid #bfdbfe",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingCode(false);
                      setCustomCode("");
                      setCodeError(null);
                    }}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "6px",
                      background: "#f3f4f6",
                      color: "#374151",
                      border: "1px solid #e5e7eb",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* QR Code */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "32px", marginBottom: "24px", textAlign: "center" }}>
            <h3 style={{ fontWeight: 600, color: "#111827", fontSize: "16px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <QrCode size={18} />
              Scan to Join
            </h3>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>Workers scan this QR code to send the JOIN text automatically.</p>
            <div style={{ display: "inline-block", padding: "16px", background: "white", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <QRCodeSVG value={smsLink} size={200} level="M" />
            </div>
            <div style={{ marginTop: "12px" }}>
              <a
                href={smsLink}
                style={{ fontSize: "13px", color: "#3b82f6", textDecoration: "none" }}
              >
                Or tap here to send via SMS →
              </a>
            </div>
          </div>

          {/* Worker Join Instructions */}
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "32px", marginBottom: "24px" }}>
            <h3 style={{ fontWeight: 600, color: "#111827", fontSize: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Smartphone size={18} />
              Workers: Text to Join
            </h3>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "12px" }}>Workers text this command to {formatPhoneForDisplay(onboardingResult.twilioNumber)}:</p>

            <div
              style={{
                background: "#f9fafb",
                borderRadius: "8px",
                padding: "16px",
                border: "1px solid #e5e7eb",
                marginBottom: "16px",
              }}
            >
              <div style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: "bold", color: "#1f2937", textAlign: "center" }}>
                {onboardingResult.joinCommand}
              </div>
            </div>

            <a
              href={smsLink}
              style={{
                display: "block",
                width: "100%",
                background: "#1e40af",
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

          {/* Manager Credentials */}
          {managerCredentials && (
            <div style={{ background: "#ecfdf5", border: "1px solid #86efac", borderRadius: "12px", padding: "32px" }}>
              <h3 style={{ fontWeight: 600, color: "#15803d", fontSize: "16px", marginBottom: "16px" }}>Your Manager Login</h3>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "6px" }}>Username</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={managerCredentials.username}
                    readOnly
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      background: "white",
                      fontSize: "14px",
                      fontFamily: "monospace",
                    }}
                  />
                  <button
                    onClick={() => handleCopy(managerCredentials.username, "username")}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      background: "white",
                      border: "1px solid #d1d5db",
                      cursor: "pointer",
                    }}
                  >
                    {copiedField === "username" ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", color: "#6b7280", display: "block", marginBottom: "6px" }}>Password</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="password"
                    value={managerCredentials.password}
                    readOnly
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      background: "white",
                      fontSize: "14px",
                      fontFamily: "monospace",
                    }}
                  />
                  <button
                    onClick={() => handleCopy(managerCredentials.password, "password")}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      background: "white",
                      border: "1px solid #d1d5db",
                      cursor: "pointer",
                    }}
                  >
                    {copiedField === "password" ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <Link
                href="/login"
                style={{
                  display: "block",
                  background: "#15803d",
                  color: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "14px",
                  textDecoration: "none",
                  textAlign: "center",
                  marginTop: "16px",
                }}
              >
                Go to Dashboard
              </Link>
            </div>
          )}

          {generatingCredentials && (
            <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "12px", padding: "16px", textAlign: "center", color: "#92400e", fontSize: "14px" }}>
              Setting up your manager account...
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
