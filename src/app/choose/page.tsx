"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, MessageCircle, Globe } from "lucide-react";

export default function ChoosePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
      if (!auth.loggedIn) { router.push("/login"); return; }
      setUsername(auth.phone || "");
    } catch { router.push("/login"); }
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#F7F3EC", fontFamily: "'Inter', system-ui, sans-serif", padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 480, textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, margin: "0 auto 24px",
          background: "#C96442", borderRadius: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Image src="/images/logo/newsidekicklogo.png" alt="Sidekick" width={36} height={36}
            style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: "#1C1A16", marginBottom: 8, letterSpacing: "-0.02em" }}>
          Welcome back
        </h1>
        <p style={{ color: "rgba(28,26,22,0.5)", fontSize: 15, marginBottom: 36 }}>
          What would you like to do?
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={() => router.push("/manager")}
            style={{
              display: "flex", alignItems: "center", gap: 16, padding: "20px 24px",
              background: "#ffffff", border: "1px solid rgba(28,26,22,0.08)", borderRadius: 16,
              cursor: "pointer", textAlign: "left", width: "100%",
              boxShadow: "0 2px 8px rgba(28,26,22,0.04)",
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: "rgba(201,100,66,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <LayoutDashboard size={22} style={{ color: "#C96442" }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#1C1A16" }}>Existing Company / Event</div>
              <div style={{ fontSize: 13, color: "rgba(28,26,22,0.5)", marginTop: 2 }}>Go to your dashboard, manage workers, and view analytics</div>
            </div>
          </button>

          <button
            onClick={() => router.push("/onboarding-chat")}
            style={{
              display: "flex", alignItems: "center", gap: 16, padding: "20px 24px",
              background: "#ffffff", border: "1px solid rgba(28,26,22,0.08)", borderRadius: 16,
              cursor: "pointer", textAlign: "left", width: "100%",
              boxShadow: "0 2px 8px rgba(28,26,22,0.04)",
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: "rgba(201,100,66,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <MessageCircle size={22} style={{ color: "#C96442" }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#1C1A16" }}>New Company / Event</div>
              <div style={{ fontSize: 13, color: "rgba(28,26,22,0.5)", marginTop: 2 }}>Set up a new team or event with Sidekick</div>
            </div>
          </button>

          <button
            onClick={() => router.push("/")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "14px 24px", background: "transparent", border: "none",
              cursor: "pointer", color: "rgba(28,26,22,0.4)", fontSize: 14, marginTop: 4,
            }}
          >
            <Globe size={16} />
            Back to website
          </button>
        </div>
      </div>
    </div>
  );
}
