"use client";
import { useState } from "react";

interface SlackIntegrationProps {
  companyId: string;
  darkMode?: boolean;
  onDocumentImported?: (doc: any) => void;
}

export default function SlackIntegration({ companyId }: SlackIntegrationProps) {
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    const clientId = "1163953391843.10968520902291";
    const redirectUri = encodeURIComponent("https://app.textsidekick.com/api/integrations/slack/callback");
    const scopes = encodeURIComponent("channels:read,channels:history,files:read,users:read");
    const state = encodeURIComponent(companyId);
    window.location.href = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;
  };

  return (
    <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid rgba(28,26,22,0.1)", background: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <div style={{ width: 24, height: 24, borderRadius: 4, background: "#4A154B", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700 }}>S</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: "14px", color: "#1C1A16" }}>Slack</div>
          <div style={{ fontSize: "12px", color: "rgba(28,26,22,0.5)" }}>Import knowledge from Slack channels</div>
        </div>
      </div>
      {!connected ? (
        <button onClick={handleConnect} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", background: "#4A154B", color: "white", border: "none", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
          Connect Slack
        </button>
      ) : (
        <div style={{ fontSize: "12px", color: "#0a7", fontWeight: 500 }}>✓ Connected</div>
      )}
    </div>
  );
}
