"use client";
import { useState } from "react";

interface SharePointIntegrationProps {
  companyId: string;
  darkMode?: boolean;
  onDocumentImported?: (doc: any) => void;
}

export default function SharePointIntegration({ companyId }: SharePointIntegrationProps) {
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || "YOUR_MS_CLIENT_ID";
    const redirectUri = encodeURIComponent("https://app.textsidekick.com/api/integrations/sharepoint/callback");
    const scope = encodeURIComponent("Files.Read.All Sites.Read.All offline_access");
    const state = encodeURIComponent(companyId);
    window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
  };

  return (
    <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid rgba(28,26,22,0.1)", background: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <div style={{ width: 24, height: 24, borderRadius: 4, background: "#0078D4", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700 }}>SP</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: "14px", color: "#1C1A16" }}>SharePoint / OneDrive</div>
          <div style={{ fontSize: "12px", color: "rgba(28,26,22,0.5)" }}>Import docs from Microsoft 365</div>
        </div>
      </div>
      {!connected ? (
        <button onClick={handleConnect} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", background: "#0078D4", color: "white", border: "none", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
          Connect SharePoint
        </button>
      ) : (
        <div style={{ fontSize: "12px", color: "#0a7", fontWeight: 500 }}>✓ Connected</div>
      )}
    </div>
  );
}
