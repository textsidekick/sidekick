"use client";
import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Database, FileText, Clock, ChevronDown, ChevronRight } from "lucide-react";

interface KnowledgeItem {
  id: string;
  name: string;
  source: string;
  type: string;
  size: number;
  importedAt: string;
}

interface KnowledgeSummary {
  totalDocuments: number;
  totalSources: number;
  lastSync: string | null;
}

interface KnowledgeBaseData {
  summary: KnowledgeSummary;
  connections: Record<string, { connected: boolean; connectedAt: string }>;
  sources: Record<string, KnowledgeItem[]>;
}

const SOURCE_LABELS: Record<string, string> = {
  upload: "Direct Upload",
  google_drive: "Google Drive",
  dropbox: "Dropbox",
  sharepoint: "SharePoint",
  onedrive: "OneDrive",
  notion: "Notion",
  slack: "Slack",
  confluence: "Confluence",
  box: "Box",
  zendesk: "Zendesk",
  quickbooks: "QuickBooks",
  gusto: "Gusto",
  teams: "Microsoft Teams",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function formatSize(chars: number): string {
  if (chars < 1000) return `${chars} chars`;
  if (chars < 100000) return `${Math.round(chars / 1000)}k chars`;
  return `${(chars / 1000000).toFixed(1)}M chars`;
}

interface Props {
  companyId: string;
}

export default function KnowledgeBaseViewer({ companyId }: Props) {
  const [data, setData] = useState<KnowledgeBaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/knowledge-base?companyId=${encodeURIComponent(companyId)}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        // Auto-expand sources with items
        const sources = Object.keys(json.sources || {});
        if (sources.length <= 5) {
          setExpandedSources(new Set(sources));
        }
      }
    } catch (e) {
      console.error("Failed to fetch knowledge base:", e);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleSource = (source: string) => {
    setExpandedSources(prev => {
      const next = new Set(prev);
      if (next.has(source)) next.delete(source);
      else next.add(source);
      return next;
    });
  };

  const handleSyncAll = async () => {
    setSyncing("all");
    // Trigger re-fetch after a brief delay (integrations would sync server-side)
    setTimeout(async () => {
      await fetchData();
      setSyncing(null);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">Loading knowledge base...</p>
      </div>
    );
  }

  const summary = data?.summary || { totalDocuments: 0, totalSources: 0, lastSync: null };
  const sources = data?.sources || {};
  const connections = data?.connections || {};

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-gray-500" />
            <h3 className="text-base font-semibold text-gray-900">Knowledge Base</h3>
          </div>
          <button
            onClick={handleSyncAll}
            disabled={syncing === "all"}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#C96442] text-white rounded-lg text-sm font-medium hover:bg-[#b5573a] disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing === "all" ? "animate-spin" : ""}`} />
            {syncing === "all" ? "Syncing..." : "Sync All"}
          </button>
        </div>

        {/* Summary stats */}
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-gray-500">Documents: </span>
            <span className="font-medium text-gray-900">{summary.totalDocuments}</span>
          </div>
          <div>
            <span className="text-gray-500">Sources: </span>
            <span className="font-medium text-gray-900">{summary.totalSources}</span>
          </div>
          {summary.lastSync && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-500">Last sync: </span>
              <span className="font-medium text-gray-900">{formatDate(summary.lastSync)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sources */}
      <div className="divide-y divide-gray-100">
        {Object.keys(sources).length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">No documents imported yet</p>
            <p className="text-xs text-gray-400 mt-1">Connect an integration above and import your company docs.</p>
          </div>
        ) : (
          Object.entries(sources).map(([source, items]) => (
            <div key={source}>
              {/* Source header */}
              <button
                onClick={() => toggleSource(source)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  {expandedSources.has(source) ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {SOURCE_LABELS[source] || source}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </div>
                {connections[source] && (
                  <span className="text-xs text-green-600 font-medium">Connected</span>
                )}
              </button>

              {/* Items list */}
              {expandedSources.has(source) && (
                <div className="bg-gray-50 px-5 pb-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase tracking-wide">
                        <th className="text-left py-2 font-medium">Name</th>
                        <th className="text-left py-2 font-medium">Type</th>
                        <th className="text-right py-2 font-medium">Size</th>
                        <th className="text-right py-2 font-medium">Imported</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {items.slice(0, 50).map((item) => (
                        <tr key={item.id} className="text-gray-700">
                          <td className="py-2 pr-4 max-w-[300px] truncate">{item.name}</td>
                          <td className="py-2 pr-4 text-gray-500">{item.type}</td>
                          <td className="py-2 text-right text-gray-500">{item.size > 0 ? formatSize(item.size) : "--"}</td>
                          <td className="py-2 text-right text-gray-500">{item.importedAt ? formatDate(item.importedAt) : "--"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {items.length > 50 && (
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      Showing 50 of {items.length} documents
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
