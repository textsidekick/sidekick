"use client";
import { useState } from "react";

interface SharePointIntegrationProps {
  companyId: string;
  darkMode?: boolean;
  onDocumentImported?: (doc: any) => void;
}

export default function SharePointIntegration({ companyId, darkMode = false, onDocumentImported }: SharePointIntegrationProps) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [importing, setImporting] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations/sharepoint/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, siteUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setConnected(true);
        setFiles(data.files || []);
      }
    } catch {}
    setLoading(false);
  };

  const handleImport = async (fileId: string, fileName: string) => {
    setImporting(fileId);
    try {
      const res = await fetch("/api/integrations/sharepoint/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, fileId, fileName }),
      });
      const data = await res.json();
      if (data.success && onDocumentImported) {
        onDocumentImported({ filename: fileName, type: "sharepoint", title: fileName });
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
          <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="#0078D4"/>
          <path d="M12 2L2 7l10 5 10-5L12 2z" fill="#50E6FF" opacity="0.4"/>
        </svg>
        <div>
          <div style={{ fontWeight: 600, fontSize: "14px", color: "#1C1A16" }}>SharePoint / OneDrive</div>
          <div style={{ fontSize: "12px", color: "rgba(28,26,22,0.5)" }}>Import docs from Microsoft 365</div>
        </div>
      </div>
      {!connected ? (
        <div>
          <input
            type="text"
            placeholder="SharePoint site URL (optional)"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px", borderRadius: "8px",
              border: "1px solid rgba(28,26,22,0.1)", fontSize: "13px",
              marginBottom: "8px", background: "#F7F3EC",
            }}
          />
          <button
            onClick={handleConnect}
            disabled={loading}
            style={{
              width: "100%", padding: "8px 12px", borderRadius: "8px",
              background: "#0078D4", color: "white", border: "none",
              fontSize: "13px", fontWeight: 500, cursor: "pointer",
            }}
          >
            {loading ? "Connecting..." : "Connect SharePoint"}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: "12px", color: "#0078D4", fontWeight: 500, marginBottom: "8px" }}>✓ Connected</div>
          {files.map((f: any) => (
            <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(28,26,22,0.05)" }}>
              <span style={{ fontSize: "13px" }}>{f.name}</span>
              <button
                onClick={() => handleImport(f.id, f.name)}
                disabled={importing === f.id}
                style={{ fontSize: "12px", color: "#C96442", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
              >
                {importing === f.id ? "Importing..." : "Import"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
