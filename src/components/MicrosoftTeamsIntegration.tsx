"use client";
import React, { useState, useEffect } from "react";
import { MessageSquare, RefreshCw, Unlink, FileText, Download, X, Cloud } from "lucide-react";

interface OneDriveFile {
  id: string;
  name: string;
  size: number;
  modified: string;
  downloadUrl: string;
}

interface MicrosoftTeamsIntegrationProps {
  companyId: string;
  darkMode?: boolean;
  onDocumentImported?: (doc: any) => void;
}

export default function MicrosoftTeamsIntegration({ companyId, darkMode = false, onDocumentImported }: MicrosoftTeamsIntegrationProps) {
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<OneDriveFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);

  useEffect(() => { checkConnection(); }, [companyId]);

  const checkConnection = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/integrations/microsoft-teams?companyId=${companyId}&action=status`);
      const data = await res.json();
      setConnected(data.connected);
      setEmail(data.email);
    } catch (error) { console.error("Failed to check Microsoft connection:", error); }
    setLoading(false);
  };

  const connectMicrosoft = () => { window.location.href = `/api/auth/microsoft?companyId=${companyId}`; };

  const disconnectMicrosoft = async () => {
    try {
      await fetch(`/api/integrations/microsoft-teams?companyId=${companyId}`, { method: "DELETE" });
      setConnected(false);
      setEmail(null);
      setFiles([]);
      setShowFilePicker(false);
    } catch (error) { console.error("Failed to disconnect:", error); }
  };

  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch(`/api/integrations/microsoft-teams?companyId=${companyId}&action=files`);
      const data = await res.json();
      if (data.files) { setFiles(data.files); setShowFilePicker(true); }
    } catch (error) { console.error("Failed to load files:", error); }
    setLoadingFiles(false);
  };

  const importFile = async (file: OneDriveFile) => {
    setImporting(file.id);
    try {
      const res = await fetch("/api/integrations/microsoft-teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          companyId, 
          action: "import",
          fileId: file.id, 
          fileName: file.name,
          downloadUrl: file.downloadUrl 
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setFiles(prev => prev.filter(f => f.id !== file.id));
        onDocumentImported?.(data.document);
      } else { alert(`Failed to import: ${data.error}`); }
    } catch (error) { console.error("Failed to import file:", error); alert("Failed to import file"); }
    setImporting(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-4 flex items-center gap-3`}>
        <RefreshCw className={`w-5 h-5 animate-spin ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
        <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Checking connection...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"} rounded-lg border p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${connected ? "bg-purple-100" : darkMode ? "bg-gray-600" : "bg-gray-200"}`}>
              <svg className={`w-6 h-6 ${connected ? "text-purple-600" : darkMode ? "text-gray-400" : "text-gray-500"}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17l4.59-4.59L16 11l-6 6z"/>
              </svg>
            </div>
            <div>
              <h4 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>Microsoft 365</h4>
              {connected ? (
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Connected as {email}</p>
              ) : (
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>OneDrive, SharePoint & Teams</p>
              )}
            </div>
          </div>
          {connected ? (
            <div className="flex items-center gap-2">
              <button onClick={loadFiles} disabled={loadingFiles} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50">
                {loadingFiles ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Import Files
              </button>
              <span className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-gray-800 rounded-full text-sm">
                <MessageSquare className="w-3 h-3" />
                Teams enabled
              </span>
              <button onClick={disconnectMicrosoft} className={`p-2 rounded-lg ${darkMode ? "text-gray-400 hover:text-red-400" : "text-gray-500 hover:text-red-500"}`} title="Disconnect">
                <Unlink className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button onClick={connectMicrosoft} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
              <Cloud className="w-4 h-4" />
              Connect Microsoft
            </button>
          )}
        </div>
      </div>

      {showFilePicker && files.length > 0 && (
        <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg border`}>
          <div className={`px-4 py-3 border-b ${darkMode ? "border-gray-700" : "border-gray-100"} flex items-center justify-between`}>
            <h4 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>OneDrive Files ({files.length})</h4>
            <button onClick={() => setShowFilePicker(false)} className={`p-1 rounded ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
              <X className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
            </button>
          </div>
          <div className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-100"} max-h-80 overflow-y-auto`}>
            {files.map((file) => (
              <div key={file.id} className={`p-4 flex items-center justify-between ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
                <div className="flex items-center gap-3">
                  <FileText className={`w-8 h-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <div>
                    <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{file.name}</p>
                    <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      {new Date(file.modified).toLocaleDateString()} • {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button onClick={() => importFile(file)} disabled={importing === file.id} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                  {importing === file.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Import
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showFilePicker && files.length === 0 && (
        <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg border p-8 text-center`}>
          <FileText className={`w-10 h-10 mx-auto mb-3 ${darkMode ? "text-gray-600" : "text-gray-300"}`} />
          <p className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>No compatible files found</p>
          <p className={`text-sm mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Upload PDFs, Word docs, or spreadsheets to your OneDrive</p>
        </div>
      )}
    </div>
  );
}
