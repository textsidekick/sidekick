"use client";
import { useState } from "react";

interface SalesforceIntegrationProps {
  companyId: string;
  darkMode?: boolean;
  onDocumentImported?: (doc: any) => void;
}

export default function SalesforceIntegration({ companyId, darkMode = false, onDocumentImported }: SalesforceIntegrationProps) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations/salesforce/connect", {
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
    <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid rgba(28,26,22,0.1)", background: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <div style={{ width: 24, height: 24, borderRadius: 4, background: "#00A1E0", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, fontWeight: 700 }}>SF</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: "14px", color: "#1C1A16" }}>Salesforce</div>
          <div style={{ fontSize: "12px", color: "rgba(28,26,22,0.5)" }}>Import knowledge articles & docs</div>
        </div>
      </div>
      {!connected ? (
        <div>
          <button onClick={handleConnect} disabled={loading} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", background: "#00A1E0", color: "white", border: "none", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
            {loading ? "Connecting..." : "Connect Salesforce"}
          </button>
        </div>
      ) : (
        <div style={{ fontSize: "12px", color: "#0a7", fontWeight: 500 }}> Connected</div>
      )}
    </div>
  );
}
