"use client";
import { useState } from "react";

interface NotionIntegrationProps {
  companyId: string;
  darkMode?: boolean;
  onDocumentImported?: (doc: any) => void;
}

export default function NotionIntegration({ companyId, darkMode = false, onDocumentImported }: NotionIntegrationProps) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [pages, setPages] = useState<any[]>([]);
  const [importing, setImporting] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations/notion/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, apiKey }),
      });
      const data = await res.json();
      if (data.success) {
        setConnected(true);
        setPages(data.pages || []);
      }
    } catch {}
    setLoading(false);
  };

  const handleImport = async (pageId: string, title: string) => {
    setImporting(pageId);
    try {
      const res = await fetch("/api/integrations/notion/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, pageId, title }),
      });
      const data = await res.json();
      if (data.success && onDocumentImported) {
        onDocumentImported({ filename: title, type: "notion", title });
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
          <rect width="24" height="24" rx="4" fill="#000"/>
          <text x="7" y="17" fill="white" fontSize="14" fontWeight="bold">N</text>
        </svg>
        <div>
          <div style={{ fontWeight: 600, fontSize: "14px", color: "#1C1A16" }}>Notion</div>
          <div style={{ fontSize: "12px", color: "rgba(28,26,22,0.5)" }}>Import pages & databases from Notion</div>
        </div>
      </div>
      {!connected ? (
        <div>
          <input
            type="password"
            placeholder="Notion Integration Token"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px", borderRadius: "8px",
              border: "1px solid rgba(28,26,22,0.1)", fontSize: "13px",
              marginBottom: "8px", background: "#F7F3EC",
            }}
          />
          <button
            onClick={handleConnect}
            disabled={loading || !apiKey}
            style={{
              width: "100%", padding: "8px 12px", borderRadius: "8px",
              background: "#000", color: "white", border: "none",
              fontSize: "13px", fontWeight: 500, cursor: "pointer",
            }}
          >
            {loading ? "Connecting..." : "Connect Notion"}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: "12px", color: "#0a7", fontWeight: 500, marginBottom: "8px" }}>✓ Connected</div>
          {pages.map((p: any) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(28,26,22,0.05)" }}>
              <span style={{ fontSize: "13px" }}>{p.title}</span>
              <button
                onClick={() => handleImport(p.id, p.title)}
                disabled={importing === p.id}
                style={{ fontSize: "12px", color: "#C96442", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
              >
                {importing === p.id ? "Importing..." : "Import"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
