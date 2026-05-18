"use client";
import { useState } from "react";

interface SlackIntegrationProps {
  companyId: string;
  darkMode?: boolean;
  onDocumentImported?: (doc: any) => void;
}

export default function SlackIntegration({ companyId, darkMode = false, onDocumentImported }: SlackIntegrationProps) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  const [importing, setImporting] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations/slack/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });
      const data = await res.json();
      if (data.success) {
        setConnected(true);
        setChannels(data.channels || []);
      }
    } catch {}
    setLoading(false);
  };

  const handleImport = async (channelId: string, channelName: string) => {
    setImporting(channelId);
    try {
      const res = await fetch("/api/integrations/slack/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, channelId, channelName }),
      });
      const data = await res.json();
      if (data.success && onDocumentImported) {
        onDocumentImported({ filename: `#${channelName}`, type: "slack", title: `Slack #${channelName}` });
      }
    } catch {}
    setImporting(null);
  };

  return (
    <div style={{
      padding: "16px", borderRadius: "12px",
      border: "1px solid rgba(28,26,22,0.1)", background: "white",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#4A154B"/>
          <text x="5" y="17" fill="white" fontSize="13" fontWeight="bold">S</text>
        </svg>
        <div>
          <div style={{ fontWeight: 600, fontSize: "14px", color: "#1C1A16" }}>Slack</div>
          <div style={{ fontSize: "12px", color: "rgba(28,26,22,0.5)" }}>Import knowledge from Slack channels</div>
        </div>
      </div>
      {!connected ? (
        <button
          onClick={handleConnect}
          disabled={loading}
          style={{
            width: "100%", padding: "8px 12px", borderRadius: "8px",
            background: "#4A154B", color: "white", border: "none",
            fontSize: "13px", fontWeight: 500, cursor: "pointer",
          }}
        >
          {loading ? "Connecting..." : "Connect Slack"}
        </button>
      ) : (
        <div>
          <div style={{ fontSize: "12px", color: "#0a7", fontWeight: 500, marginBottom: "8px" }}>✓ Connected</div>
          {channels.map((c: any) => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(28,26,22,0.05)" }}>
              <span style={{ fontSize: "13px" }}>#{c.name}</span>
              <button
                onClick={() => handleImport(c.id, c.name)}
                disabled={importing === c.id}
                style={{ fontSize: "12px", color: "#C96442", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
              >
                {importing === c.id ? "Importing..." : "Import"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
