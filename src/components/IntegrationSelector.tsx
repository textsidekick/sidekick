"use client";
import { useState } from "react";

interface Integration {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: "available" | "connected" | "coming_soon";
  connectUrl?: string;
}

const INTEGRATIONS: Integration[] = [
  { id: "google-drive", name: "Google Drive", description: "Import docs & sheets", color: "#4285F4", icon: "G", status: "available" },
  { id: "dropbox", name: "Dropbox", description: "Import files & folders", color: "#0061FF", icon: "D", status: "available" },
  { id: "sharepoint", name: "SharePoint", description: "Microsoft 365 docs", color: "#0078D4", icon: "SP", status: "available" },
  { id: "notion", name: "Notion", description: "Pages & databases", color: "#000000", icon: "N", status: "available" },
  { id: "slack", name: "Slack", description: "Channel knowledge", color: "#4A154B", icon: "S", status: "available" },
  { id: "gusto", name: "Gusto", description: "HR & payroll data", color: "#F45D48", icon: "Gu", status: "available" },
  { id: "teams", name: "Microsoft Teams", description: "Team channels & files", color: "#6264A7", icon: "T", status: "available" },
  { id: "confluence", name: "Confluence", description: "Wiki pages & spaces", color: "#0052CC", icon: "C", status: "coming_soon" },
  { id: "zendesk", name: "Zendesk", description: "Help center articles", color: "#03363D", icon: "Z", status: "coming_soon" },
  { id: "salesforce", name: "Salesforce", description: "Knowledge articles", color: "#00A1E0", icon: "SF", status: "coming_soon" },
  { id: "airtable", name: "Airtable", description: "Bases & records", color: "#18BFFF", icon: "AT", status: "coming_soon" },
  { id: "monday", name: "Monday.com", description: "Boards & tasks", color: "#6161FF", icon: "M", status: "coming_soon" },
  { id: "quickbooks", name: "QuickBooks", description: "Employee & payroll", color: "#2CA01C", icon: "QB", status: "coming_soon" },
  { id: "adp", name: "ADP", description: "HR & payroll sync", color: "#D0271D", icon: "ADP", status: "coming_soon" },
  { id: "procore", name: "Procore", description: "Construction docs", color: "#F47E20", icon: "P", status: "coming_soon" },
  { id: "box", name: "Box", description: "Cloud file storage", color: "#0061D5", icon: "B", status: "coming_soon" },
  { id: "whatsapp", name: "WhatsApp", description: "Messaging channel", color: "#25D366", icon: "W", status: "coming_soon" },
  { id: "toast", name: "Toast POS", description: "Restaurant data", color: "#FF4C00", icon: "T", status: "coming_soon" },
];

interface IntegrationSelectorProps {
  companyId: string;
  onConnect?: (integrationId: string) => void;
}

export default function IntegrationSelector({ companyId, onConnect }: IntegrationSelectorProps) {
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "available" | "connected">("all");

  const handleConnect = (integration: Integration) => {
    if (integration.status === "coming_soon") return;
    
    // Build OAuth URL based on integration
    const redirectBase = "https://app.textsidekick.com/api/integrations";
    const state = encodeURIComponent(companyId);
    
    let authUrl = "";
    switch (integration.id) {
      case "slack":
        authUrl = `https://slack.com/oauth/v2/authorize?client_id=1163953391843.10968520902291&scope=${encodeURIComponent("channels:read,channels:history,files:read,users:read")}&redirect_uri=${encodeURIComponent(redirectBase + "/slack/callback")}&state=${state}`;
        break;
      case "notion":
        authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=364d872b-594c-811e-a2e7-003795a92b5e&response_type=code&owner=user&redirect_uri=${encodeURIComponent(redirectBase + "/notion/callback")}&state=${state}`;
        break;
      case "sharepoint":
      case "teams":
        authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${encodeURIComponent()}&response_type=code&redirect_uri=${encodeURIComponent(redirectBase + "/sharepoint/callback")}&scope=${encodeURIComponent("Files.Read.All Sites.Read.All offline_access")}&state=${state}`;
        break;
      default:
        // For Google Drive, Dropbox, Gusto — use existing integration flows
        setConnected(prev => new Set(prev).add(integration.id));
        if (onConnect) onConnect(integration.id);
        return;
    }
    
    if (authUrl) {
      window.open(authUrl, "_blank", "width=600,height=700");
    }
  };

  const filtered = INTEGRATIONS.filter(i => {
    if (filter === "connected") return connected.has(i.id);
    if (filter === "available") return i.status === "available";
    return true;
  });

  return (
    <div style={{ background: "white", border: "1px solid rgba(28,26,22,0.08)", borderRadius: 16, overflow: "hidden", height: "100%" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(28,26,22,0.06)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1C1A16", margin: "0 0 4px" }}>Connect Your Tools</h3>
        <p style={{ fontSize: 13, color: "rgba(28,26,22,0.5)", margin: 0 }}>Pull your company knowledge from anywhere</p>
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          {(["all", "available", "connected"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
              border: "1px solid rgba(28,26,22,0.1)",
              background: filter === f ? "#C96442" : "transparent",
              color: filter === f ? "white" : "rgba(28,26,22,0.6)",
              cursor: "pointer", textTransform: "capitalize",
            }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "12px 16px", maxHeight: 500, overflowY: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {filtered.map(integration => (
            <button
              key={integration.id}
              onClick={() => handleConnect(integration)}
              disabled={integration.status === "coming_soon"}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 10, border: "1px solid rgba(28,26,22,0.08)",
                background: connected.has(integration.id) ? "rgba(201,100,66,0.05)" : "white",
                cursor: integration.status === "coming_soon" ? "default" : "pointer",
                opacity: integration.status === "coming_soon" ? 0.5 : 1,
                textAlign: "left", width: "100%",
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: integration.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: 10, fontWeight: 700, flexShrink: 0,
              }}>
                {integration.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1A16", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {integration.name}
                  {connected.has(integration.id) && " ✓"}
                </div>
                <div style={{ fontSize: 11, color: "rgba(28,26,22,0.4)" }}>
                  {integration.status === "coming_soon" ? "Coming soon" : integration.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(28,26,22,0.06)", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "rgba(28,26,22,0.4)", margin: 0 }}>
          Don't see your tool? Upload documents directly or tell us in the chat.
        </p>
      </div>
    </div>
  );
}
