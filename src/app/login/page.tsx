"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits }),
      });
      const data = await res.json();
      if (data.success) {
        setNormalizedPhone(data.phone);
        if (data.bypass) {
          // Auto-verify bypass phones with code 000000
          setCode("000000");
          const verifyRes = await fetch("/api/auth/verify-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: data.phone, code: "000000" }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            document.cookie = "sidekick_auth=true; path=/; max-age=604800";
            localStorage.setItem("sidekick_auth", JSON.stringify(verifyData));
            window.location.href = verifyData.companyId ? "/manager" : "/choose";
            return;
          }
        }
        setStep("code");
      } else {
        setError(data.error || "Failed to send code.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setIsLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone, code }),
      });
      const data = await res.json();
      if (data.success) {
        document.cookie = "sidekick_auth=true; path=/; max-age=604800";
        localStorage.setItem("sidekick_auth", JSON.stringify({
          phone: normalizedPhone,
          accountId: data.accountId,
          companyId: data.companyId,
          token: data.token,
          plan: data.plan,
          isNewUser: data.isNewUser,
          loggedIn: true,
        }));
        if (data.isNewUser) {
          router.push("/choose");
        } else if (data.trialExpired || data.questionsExhausted) {
          router.push("/choose");
        } else {
          router.push("/choose");
        }
      } else {
        setError(data.error || "Invalid code.");
      }
    } catch {
      setError("Verification failed. Please try again.");
    }
    setIsLoading(false);
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderColor: "rgba(28,26,22,0.15)",
    border: "1.5px solid rgba(28,26,22,0.15)",
    borderRadius: 12,
    fontSize: 16,
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "'Inter', system-ui, sans-serif",
    backgroundColor: "#ffffff",
    color: "#1C1A16",
    transition: "border-color 0.2s, box-shadow 0.2s",
    letterSpacing: step === "code" ? "0.3em" : "normal",
    textAlign: step === "code" ? "center" as const : "left" as const,
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#F7F3EC",
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: 20,
    }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif&display=swap');
      `}</style>
      
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "#ffffff",
        borderRadius: 20,
        padding: "48px 40px",
        boxShadow: "0 4px 24px -4px rgba(28,26,22,0.08), 0 2px 8px -2px rgba(28,26,22,0.04)",
        border: "1px solid rgba(28,26,22,0.06)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, margin: "0 auto 20px",
            background: "#C96442", borderRadius: 14,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 10,
          }}>
            <Image src="/images/logo/newsidekicklogo.png" alt="Sidekick" width={36} height={36} style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 600, color: "#1C1A16", marginBottom: 8,
            letterSpacing: "-0.02em",
          }}>
            {step === "phone" ? "Welcome to Sidekick" : "Enter your code"}
          </h1>
          <p style={{ color: "rgba(28,26,22,0.5)", fontSize: 15 }}>
            {step === "phone"
              ? "Enter your phone number to get started"
              : `We sent a 6-digit code to ${phone}`}
          </p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendCode}>
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: "block", fontSize: 13, fontWeight: 500,
                color: "#1C1A16", marginBottom: 8, letterSpacing: "0.01em",
              }}>Phone number</label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                  color: "rgba(28,26,22,0.4)", fontSize: 15, fontWeight: 500,
                }}>+1</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(555) 123-4567"
                  required
                  style={{ ...inputStyle, paddingLeft: 44 }}
                  onFocus={(e) => { e.target.style.borderColor = "#C96442"; e.target.style.boxShadow = "0 0 0 3px rgba(201,100,66,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(28,26,22,0.15)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {error && (
              <div style={{
                padding: "12px 16px", background: "rgba(201,100,66,0.08)",
                border: "1px solid rgba(201,100,66,0.2)", borderRadius: 10,
                color: "#A74D30", fontSize: 14, marginBottom: 20, textAlign: "center",
              }}>{error}</div>
            )}

            <button type="submit" disabled={isLoading} style={{
              width: "100%", padding: "14px", background: isLoading ? "rgba(28,26,22,0.4)" : "#1C1A16",
              color: "#F7F3EC", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer", letterSpacing: "-0.01em",
            }}>
              {isLoading ? "Sending..." : "Send verification code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: "block", fontSize: 13, fontWeight: 500,
                color: "#1C1A16", marginBottom: 8, letterSpacing: "0.01em",
              }}>Verification code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                required
                maxLength={6}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#C96442"; e.target.style.boxShadow = "0 0 0 3px rgba(201,100,66,0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(28,26,22,0.15)"; e.target.style.boxShadow = "none"; }}
                autoFocus
              />
            </div>

            {error && (
              <div style={{
                padding: "12px 16px", background: "rgba(201,100,66,0.08)",
                border: "1px solid rgba(201,100,66,0.2)", borderRadius: 10,
                color: "#A74D30", fontSize: 14, marginBottom: 20, textAlign: "center",
              }}>{error}</div>
            )}

            <button type="submit" disabled={isLoading || code.length < 6} style={{
              width: "100%", padding: "14px",
              background: (isLoading || code.length < 6) ? "rgba(28,26,22,0.4)" : "#1C1A16",
              color: "#F7F3EC", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600,
              cursor: (isLoading || code.length < 6) ? "not-allowed" : "pointer", letterSpacing: "-0.01em",
            }}>
              {isLoading ? "Verifying..." : "Verify & sign in"}
            </button>

            <button
              type="button"
              onClick={() => { setStep("phone"); setCode(""); setError(""); }}
              style={{
                width: "100%", padding: "12px", background: "transparent",
                color: "rgba(28,26,22,0.5)", border: "none", fontSize: 14,
                cursor: "pointer", marginTop: 12,
              }}
            >
              ← Use a different number
            </button>
          </form>
        )}

        <p style={{
          textAlign: "center", marginTop: 24, fontSize: 13,
          color: "rgba(28,26,22,0.4)",
        }}>
          {step === "phone" && (
            <>
              Free trial: 50 questions in 7 days.{" "}
              <a href="https://textsidekick.com/#contact" style={{ color: "#C96442", textDecoration: "none", fontWeight: 500 }}>
                Book a demo
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
