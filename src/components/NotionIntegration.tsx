"use client";
import { useState } from "react";

interface NotionIntegrationProps {
  companyId: string;
  darkMode?: boolean;
  onDocumentImported?: (doc: any) => void;
}

export default function NotionIntegration({ companyId }: NotionIntegrationProps) {
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    const clientId = "364d872b-594c-811e-a2e7-003795a92b5e";
    const redirectUri = encodeURIComponent("https://app.textsidekick.com/api/integrations/notion/callback");
    const state = encodeURIComponent(companyId);
    window.location.href = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${redirectUri}&state=${state}`;
  };

  return (
    <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid rgba(28,26,22,0.1)", background: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <div style={{ width: 24, height: 24, borderRadius: 4, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700 }}>N</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: "14px", color: "#1C1A16" }}>Notion</div>
          <div style={{ fontSize: "12px", color: "rgba(28,26,22,0.5)" }}>Import pages & databases from Notion</div>
        </div>
      </div>
      {!connected ? (
        <button onClick={handleConnect} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", background: "#000", color: "white", border: "none", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
          Connect Notion
        </button>
      ) : (
        <div style={{ fontSize: "12px", color: "#0a7", fontWeight: 500 }}>✓ Connected</div>
      )}
    </div>
  );
}
