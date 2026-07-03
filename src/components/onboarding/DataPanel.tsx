"use client";
import React from "react";
import {
  Building2, Wrench, Users, BookOpen, ClipboardList, Plug,
  MapPin, Phone, Mail, Hash, User, Package, FileText,
  Calendar, AlertCircle, CheckCircle2,
} from "lucide-react";

type SectionId = "company" | "assets" | "team" | "knowledge" | "workorders" | "integrations";

export interface CompanyData {
  name?: string;
  industry?: string;
  location?: string;
  phone?: string;
  email?: string;
  employeeCount?: string;
  shifts?: string;
}

export interface Asset {
  name: string;
  type?: string;
  location?: string;
}

export interface TeamMember {
  name: string;
  role?: string;
  phone?: string;
}

export interface KnowledgeDoc {
  name: string;
  type: "sop" | "manual" | "safety" | "other";
}

export interface WorkOrder {
  title: string;
  status: "open" | "in_progress" | "complete";
  priority?: "low" | "medium" | "high";
}

export interface ConnectedIntegration {
  name: string;
  status: "connected" | "pending";
}

export interface SectionData {
  company: CompanyData;
  assets: Asset[];
  team: TeamMember[];
  knowledge: KnowledgeDoc[];
  workorders: WorkOrder[];
  integrations: ConnectedIntegration[];
}

interface DataPanelProps {
  activeSectionId: SectionId;
  data: SectionData;
  sessionId?: string;
  integrationSelector?: React.ReactNode;
}

const SECTION_TITLES: Record<SectionId, string> = {
  company: "Company Details",
  assets: "Equipment & Assets",
  team: "Team Roster",
  knowledge: "Documents",
  workorders: "Work Orders",
  integrations: "Connected Tools",
};

const SECTION_ICONS: Record<SectionId, React.ElementType> = {
  company: Building2,
  assets: Wrench,
  team: Users,
  knowledge: BookOpen,
  workorders: ClipboardList,
  integrations: Plug,
};

function EmptyState({ sectionId }: { sectionId: SectionId }) {
  const hints: Record<SectionId, string> = {
    company: "Tell Sidekick about your company and details will appear here.",
    assets: "Describe your equipment, machines, or production lines.",
    team: "Share info about your team — names, roles, departments.",
    knowledge: "Upload SOPs, manuals, or describe your procedures.",
    workorders: "Import existing work orders or describe your workflow.",
    integrations: "Connect your tools using the options below.",
  };
  return (
    <div style={{
      padding: "32px 16px", textAlign: "center", color: "rgba(28,26,22,0.35)",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: "rgba(201,100,66,0.08)", margin: "0 auto 12px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {React.createElement(SECTION_ICONS[sectionId], { size: 22, color: "rgba(201,100,66,0.4)" })}
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.5, maxWidth: 200, margin: "0 auto" }}>{hints[sectionId]}</p>
    </div>
  );
}

function CompanyPanel({ data }: { data: CompanyData }) {
  const fields = [
    { icon: Building2, label: "Company", value: data.name },
    { icon: Package, label: "Industry", value: data.industry },
    { icon: MapPin, label: "Location", value: data.location },
    { icon: Phone, label: "Phone", value: data.phone },
    { icon: Mail, label: "Email", value: data.email },
    { icon: Users, label: "Employees", value: data.employeeCount },
    { icon: Calendar, label: "Shifts", value: data.shifts },
  ].filter((f) => f.value);

  if (fields.length === 0) return <EmptyState sectionId="company" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {fields.map((f, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 16px", borderRadius: 8,
          background: i % 2 === 0 ? "rgba(28,26,22,0.02)" : "transparent",
        }}>
          <f.icon size={16} style={{ color: "rgba(28,26,22,0.3)", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "rgba(28,26,22,0.45)", width: 72, flexShrink: 0 }}>{f.label}</span>
          <span style={{ fontSize: 14, color: "#111827", fontWeight: 500 }}>{f.value}</span>
        </div>
      ))}
    </div>
  );
}

function AssetPanel({ data }: { data: Asset[] }) {
  if (data.length === 0) return <EmptyState sectionId="assets" />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {data.map((asset, i) => (
        <div key={i} style={{
          padding: "10px 16px", borderRadius: 10,
          background: "white", border: "1px solid rgba(28,26,22,0.08)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(201,100,66,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Wrench size={16} style={{ color: "#0060F0" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{asset.name}</div>
            {(asset.type || asset.location) && (
              <div style={{ fontSize: 12, color: "rgba(28,26,22,0.4)", marginTop: 2 }}>
                {[asset.type, asset.location].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
        </div>
      ))}
      <div style={{ fontSize: 12, color: "rgba(28,26,22,0.35)", textAlign: "center", padding: "4px 0" }}>
        {data.length} asset{data.length !== 1 ? "s" : ""} added
      </div>
    </div>
  );
}

function TeamPanel({ data }: { data: TeamMember[] }) {
  if (data.length === 0) return <EmptyState sectionId="team" />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {data.map((member, i) => (
        <div key={i} style={{
          padding: "10px 16px", borderRadius: 10,
          background: "white", border: "1px solid rgba(28,26,22,0.08)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: `hsl(${(i * 47) % 360}, 45%, 65%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 13, fontWeight: 700,
          }}>
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{member.name}</div>
            {member.role && (
              <div style={{ fontSize: 12, color: "rgba(28,26,22,0.4)", marginTop: 2 }}>{member.role}</div>
            )}
          </div>
          {member.phone && (
            <span style={{ fontSize: 12, color: "rgba(28,26,22,0.3)" }}>{member.phone}</span>
          )}
        </div>
      ))}
      <div style={{ fontSize: 12, color: "rgba(28,26,22,0.35)", textAlign: "center", padding: "4px 0" }}>
        {data.length} member{data.length !== 1 ? "s" : ""} added
      </div>
    </div>
  );
}

function KnowledgePanel({ data }: { data: KnowledgeDoc[] }) {
  if (data.length === 0) return <EmptyState sectionId="knowledge" />;
  const typeColors: Record<string, string> = {
    sop: "#0060F0", manual: "#2563eb", safety: "#dc2626", other: "#6b7280",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {data.map((doc, i) => (
        <div key={i} style={{
          padding: "10px 16px", borderRadius: 10,
          background: "white", border: "1px solid rgba(28,26,22,0.08)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <FileText size={18} style={{ color: typeColors[doc.type] || "#6b7280", flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: "#111827", flex: 1 }}>{doc.name}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, textTransform: "uppercase",
            color: typeColors[doc.type] || "#6b7280",
            background: `${typeColors[doc.type] || "#6b7280"}15`,
            padding: "2px 8px", borderRadius: 4,
          }}>
            {doc.type}
          </span>
        </div>
      ))}
    </div>
  );
}

function WorkOrderPanel({ data }: { data: WorkOrder[] }) {
  if (data.length === 0) return <EmptyState sectionId="workorders" />;
  const statusIcons: Record<string, React.ReactNode> = {
    open: <AlertCircle size={14} style={{ color: "#f59e0b" }} />,
    in_progress: <Hash size={14} style={{ color: "#3b82f6" }} />,
    complete: <CheckCircle2 size={14} style={{ color: "#22c55e" }} />,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {data.map((wo, i) => (
        <div key={i} style={{
          padding: "10px 16px", borderRadius: 10,
          background: "white", border: "1px solid rgba(28,26,22,0.08)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          {statusIcons[wo.status]}
          <span style={{ fontSize: 14, fontWeight: 500, color: "#111827", flex: 1 }}>{wo.title}</span>
          {wo.priority && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: wo.priority === "high" ? "#dc2626" : wo.priority === "medium" ? "#f59e0b" : "#6b7280",
              textTransform: "uppercase",
            }}>
              {wo.priority}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function IntegrationsPanel({ data }: { data: ConnectedIntegration[] }) {
  if (data.length === 0) return <EmptyState sectionId="integrations" />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {data.map((int, i) => (
        <div key={i} style={{
          padding: "10px 16px", borderRadius: 10,
          background: "white", border: "1px solid rgba(28,26,22,0.08)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <Plug size={16} style={{ color: int.status === "connected" ? "#22c55e" : "#f59e0b" }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: "#111827", flex: 1 }}>{int.name}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, textTransform: "uppercase",
            color: int.status === "connected" ? "#22c55e" : "#f59e0b",
          }}>
            {int.status}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DataPanel({ activeSectionId, data, integrationSelector }: DataPanelProps) {
  const Icon = SECTION_ICONS[activeSectionId];
  const itemCount = activeSectionId === "company"
    ? Object.values(data.company).filter(Boolean).length
    : (data[activeSectionId] as unknown[]).length;

  return (
    <div style={{
      width: 400, background: "white",
      borderLeft: "1px solid rgba(28,26,22,0.06)",
      display: "flex", flexDirection: "column",
      position: "fixed", top: 0, bottom: 0, right: 0, zIndex: 50,
    }}>
      {/* Header */}
      <div style={{
        height: 72, display: "flex", alignItems: "center", gap: 12,
        padding: "0 20px", borderBottom: "1px solid rgba(28,26,22,0.06)",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "rgba(201,100,66,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={18} style={{ color: "#0060F0" }} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
            {SECTION_TITLES[activeSectionId]}
          </div>
          {itemCount > 0 && (
            <div style={{ fontSize: 12, color: "rgba(28,26,22,0.4)" }}>
              {itemCount} {activeSectionId === "company" ? "field" : "item"}{itemCount !== 1 ? "s" : ""} collected
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
        {activeSectionId === "company" && <CompanyPanel data={data.company} />}
        {activeSectionId === "assets" && <AssetPanel data={data.assets} />}
        {activeSectionId === "team" && <TeamPanel data={data.team} />}
        {activeSectionId === "knowledge" && <KnowledgePanel data={data.knowledge} />}
        {activeSectionId === "workorders" && <WorkOrderPanel data={data.workorders} />}
        {activeSectionId === "integrations" && (
          <>
            <IntegrationsPanel data={data.integrations} />
            {integrationSelector && (
              <div style={{ marginTop: 16, padding: "0 4px" }}>
                {integrationSelector}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer hint */}
      <div style={{
        padding: "12px 20px", borderTop: "1px solid rgba(28,26,22,0.06)",
        fontSize: 12, color: "rgba(28,26,22,0.3)", textAlign: "center",
      }}>
        Data updates as you chat with Sidekick
      </div>
    </div>
  );
}
