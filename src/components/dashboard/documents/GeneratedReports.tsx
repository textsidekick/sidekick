"use client";
import { useState } from "react";
import { Building2, BookOpen, HelpCircle, Shield, UserPlus, Pencil, RefreshCw, X, Loader2, FileText } from "lucide-react";

interface Report {
  id: string;
  title: string;
  description: string;
  reportType: string;
  icon: React.ReactNode;
}

interface GeneratedReport {
  title: string;
  content: string;
  reportType: string;
  generatedAt: string;
}

const REPORTS: Report[] = [
  { id: "company-overview", title: "Company Overview", description: "Company profile, industry, size, and key information", reportType: "company-overview", icon: <Building2 className="h-5 w-5" /> },
  { id: "employee-handbook", title: "Employee Handbook", description: "Policies, procedures, benefits, and expectations", reportType: "employee-handbook", icon: <BookOpen className="h-5 w-5" /> },
  { id: "faq", title: "FAQ -- Top Worker Questions", description: "Most common questions your workers would ask", reportType: "faq", icon: <HelpCircle className="h-5 w-5" /> },
  { id: "safety-procedures", title: "Safety Procedures", description: "Safety protocols, compliance, and emergency procedures", reportType: "safety-procedures", icon: <Shield className="h-5 w-5" /> },
  { id: "onboarding-guide", title: "Onboarding Guide", description: "Step-by-step new hire onboarding instructions", reportType: "onboarding-guide", icon: <UserPlus className="h-5 w-5" /> },
  { id: "custom", title: "Custom Report", description: "Generate a report with your own prompt", reportType: "custom", icon: <Pencil className="h-5 w-5" /> },
];

function renderMarkdown(text: string): string {
  return text
    .replace(/^## (.+)$/gm, '<h3 class="text-base font-semibold text-gray-900 mt-5 mb-2">$1</h3>')
    .replace(/^### (.+)$/gm, '<h4 class="text-sm font-semibold text-gray-800 mt-4 mb-1">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm text-gray-700 leading-relaxed">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 text-sm text-gray-700 leading-relaxed">$1. $2</li>')
    .replace(/(<li.*<\/li>\n?)+/g, (match) => `<ul class="list-disc space-y-1 my-2">${match}</ul>`)
    .replace(/^(?!<[hul])((?!<).+)$/gm, '<p class="text-sm text-gray-700 leading-relaxed mb-2">$1</p>')
    .replace(/\n{2,}/g, "");
}

interface Props {
  companyId: string;
}

export default function GeneratedReports({ companyId }: Props) {
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Record<string, GeneratedReport>>({});
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");

  const handleGenerate = async (reportType: string) => {
    setGenerating(reportType);
    try {
      const res = await fetch("/api/knowledge-base/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          reportType,
          customPrompt: reportType === "custom" ? customPrompt : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGenerated(prev => ({ ...prev, [reportType]: data }));
        setExpandedReport(reportType);
      }
    } catch (e) {
      console.error("Failed to generate report:", e);
    } finally {
      setGenerating(null);
    }
  };

  const handleDismiss = (reportType: string) => {
    setGenerated(prev => {
      const next = { ...prev };
      delete next[reportType];
      return next;
    });
    if (expandedReport === reportType) setExpandedReport(null);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-5 w-5 text-[#0060F0]" />
          <h3 className="text-base font-semibold text-gray-900">Generated Reports</h3>
        </div>
        <p className="text-sm text-gray-500">AI-generated documents based on your company knowledge base</p>
      </div>

      {/* Report cards grid */}
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORTS.map((report) => {
            const isGenerating = generating === report.reportType;
            const isGenerated = !!generated[report.reportType];

            return (
              <div
                key={report.id}
                className={`rounded-xl border p-4 transition-all ${
                  isGenerated
                    ? "border-[#0060F0]/30 bg-[#0060F0]/5"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-[#0060F0]">
                    {report.icon}
                    <h4 className="text-sm font-semibold text-gray-900">{report.title}</h4>
                  </div>
                  {isGenerated && (
                    <button
                      onClick={() => handleDismiss(report.reportType)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-500 mb-3">{report.description}</p>

                {report.reportType === "custom" && !isGenerated && (
                  <input
                    type="text"
                    placeholder="What report do you need?"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-3 focus:outline-none focus:border-[#0060F0]"
                  />
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleGenerate(report.reportType)}
                    disabled={isGenerating || (report.reportType === "custom" && !customPrompt && !isGenerated)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0060F0] text-white rounded-lg text-xs font-medium hover:bg-[#0050D0] disabled:opacity-50 transition-colors"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Generating...
                      </>
                    ) : isGenerated ? (
                      <>
                        <RefreshCw className="h-3 w-3" />
                        Regenerate
                      </>
                    ) : (
                      "Generate"
                    )}
                  </button>
                  {isGenerated && (
                    <button
                      onClick={() => setExpandedReport(expandedReport === report.reportType ? null : report.reportType)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      {expandedReport === report.reportType ? "Collapse" : "View"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Expanded report view */}
        {expandedReport && generated[expandedReport] && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{generated[expandedReport].title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Generated {new Date(generated[expandedReport].generatedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setExpandedReport(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div
              className="p-5 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(generated[expandedReport].content) }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
