"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

const EXAMPLE_CSV = `name,asset_tag,type,manufacturer,model,year,serial_number,location
Conveyor Belt A,CB-001,Conveyor,Hytrol,E-24,2019,SN123456,Line 1
Hydraulic Press,HP-002,Press,Enerpac,P-Series,2021,SN789012,Shop Floor
Air Compressor 1,AC-003,Compressor,Atlas Copco,GA15,2020,SN345678,Utility Room`;

export default function AssetImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ imported: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.trim().split(/\r?\n/).slice(0, 6);
      setPreview(lines.map((l) => l.split(",").map((v) => v.replace(/^"|"$/g, ""))));
    };
    reader.readAsText(f);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/assets/import", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setResult(json);
      setFile(null);
      setPreview([]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function downloadExample() {
    const blob = new Blob([EXAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "assets-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <a href="/assets" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Assets
          </a>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Upload className="h-6 w-6 text-[#0060F0]" /> Import Assets (CSV)
          </h1>
          <p className="text-sm text-gray-500 mt-1">Bulk upload assets from a CSV file</p>
        </div>

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-gray-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">Import successful!</p>
              <p className="text-sm text-gray-600">Imported {result.imported} of {result.total} rows.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Format guide */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><FileText className="h-4 w-4" /> CSV Format</h2>
            <Button variant="outline" size="sm" onClick={downloadExample}>Download Template</Button>
          </div>
          <p className="text-xs text-gray-500 mb-2">Required column: <code className="bg-gray-100 px-1 rounded">name</code>. Optional: <code className="bg-gray-100 px-1 rounded">asset_tag, type, manufacturer, model, year, serial_number, location, status</code></p>
          <pre className="text-xs bg-gray-50 rounded-lg p-3 overflow-x-auto text-gray-600">{EXAMPLE_CSV}</pre>
        </div>

        {/* Upload zone */}
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 text-center mb-6 cursor-pointer hover:border-[#0060F0] transition-colors" onClick={() => inputRef.current?.click()}>
          <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <Upload className="h-8 w-8 mx-auto text-gray-300 mb-3" />
          {file ? (
            <p className="text-sm text-gray-700 font-medium">{file.name}</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-600">Click to select a CSV file</p>
              <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
            </>
          )}
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700">Preview (first {preview.length - 1} rows)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                {preview.map((row, i) => (
                  <tr key={i} className={i === 0 ? "bg-gray-50 font-semibold" : "border-t border-gray-50"}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2 text-gray-700">{cell}</td>
                    ))}
                  </tr>
                ))}
              </table>
            </div>
          </div>
        )}

        <Button onClick={handleUpload} disabled={!file || uploading} className="w-full bg-[#0060F0] hover:bg-[#004BB8] text-white">
          {uploading ? "Uploading…" : "Import Assets"}
        </Button>
      </div>
    </div>
  );
}
