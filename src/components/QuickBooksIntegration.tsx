"use client";
import { useState } from "react";

interface QuickBooksIntegrationProps {
  companyId: string;
  darkMode?: boolean;
  onDocumentImported?: (doc: any) => void;
}

export default function QuickBooksIntegration({ companyId, darkMode = false, onDocumentImported }: QuickBooksIntegrationProps) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations/quickbooks/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });
      const data = await res.json();
      if (data.success) setConnected(true);
    } catch {}
    setLoading(false);
  };

  return (
    <div style={{
      padding: "16px", borderRadius: "12px",
      border: "1px solid rgba(28,26,22,0.1)", background: "white",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#2CA01C"/>
          <text x="6" y="17" fill="white" fontSize="13" fontWeight="bold">QB</text>
        </svg>
        <div>
          <div style={{ fontWeight: 600, fontSize: "14px", color: "#1C1A16" }}>QuickBooks</div>
          <div style={{ fontSize: "12px", color: "rgba(28,26,22,0.5)" }}>Sync employee & payroll data</div>
        </div>
      </div>
      {!connected ? (
        <button
          onClick={handleConnect}
          disabled={loading}
          style={{
            width: "100%", padding: "8px 12px", borderRadius: "8px",
            background: "#2CA01C", color: "white", border: "none",
            fontSize: "13px", fontWeight: 500, cursor: "pointer",
          }}
        >
          {loading ? "Connecting..." : "Connect QuickBooks"}
        </button>
      ) : (
        <div style={{ fontSize: "12px", color: "#0a7", fontWeight: 500 }}>✓ Connected — Employee data synced</div>
      )}
    </div>
  );
}
