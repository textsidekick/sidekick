"use client";
import React, { useState, useEffect } from "react";
import { Cloud, Check, X, RefreshCw, FileText, Download, Unlink } from "lucide-react";

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
}

interface GoogleDriveIntegrationProps {
  companyId: string;
  darkMode?: boolean;
  onDocumentImported?: (doc: any) => void;
}

export default function GoogleDriveIntegration({ companyId, darkMode = false, onDocumentImported }: GoogleDriveIntegrationProps) {
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);

  useEffect(() => { checkConnection(); }, [companyId]);

  const checkConnection = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/integrations/google-drive?companyId=${companyId}&action=status`);
      const data = await res.json();
      setConnected(data.connected);
      setEmail(data.email);
    } catch (error) { console.error("Failed to check Google Drive connection:", error); }
    setLoading(false);
  };

  const connectGoogleDrive = () => { window.location.href = `/api/auth/google?companyId=${companyId}`; };

  const disconnectGoogleDrive = async () => {
    try {
      await fetch(`/api/integrations/google-drive?companyId=${companyId}`, { method: "DELETE" });
      setConnected(false);
      setEmail(null);
      setFiles([]);
      setShowFilePicker(false);
    } catch (error) { console.error("Failed to disconnect:", error); }
  };

  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch(`/api/integrations/google-drive?companyId=${companyId}&action=list`);
      const data = await res.json();
      if (data.files) { setFiles(data.files); setShowFilePicker(true); }
    } catch (error) { console.error("Failed to load files:", error); }
    setLoadingFiles(false);
  };

  const importFile = async (file: GoogleDriveFile) => {
    setImporting(file.id);
    try {
      const res = await fetch("/api/integrations/google-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, fileId: file.id, fileName: file.name, mimeType: file.mimeType }),
      });
      const data = await res.json();
      if (data.ok) {
        setFiles(prev => prev.filter(f => f.id !== file.id));
        onDocumentImported?.(data.document);
      } else { alert(`Failed to import: ${data.error}`); }
    } catch (error) { console.error("Failed to import file:", error); alert("Failed to import file"); }
    setImporting(null);
  };

  const getMimeTypeIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "FILE";
    if (mimeType.includes("document") || mimeType.includes("word")) return "DOC";
    if (mimeType.includes("spreadsheet") || mimeType.includes("sheet")) return "SHEET";
    return "FOLDER";
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return "";
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${connected ? "bg-green-100" : darkMode ? "bg-gray-600" : "bg-gray-200"}`}>
              <Cloud className={`w-5 h-5 ${connected ? "text-green-600" : darkMode ? "text-gray-400" : "text-gray-500"}`} />
            </div>
            <div>
              <h4 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>Google Drive</h4>
              {connected ? (
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Connected as {email}</p>
              ) : (
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Import documents directly from your Drive</p>
              )}
            </div>
          </div>
          {connected ? (
            <div className="flex items-center gap-2">
              <button onClick={loadFiles} disabled={loadingFiles} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                {loadingFiles ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Import Files
              </button>
              <button onClick={disconnectGoogleDrive} className={`p-2 rounded-lg ${darkMode ? "text-gray-400 hover:text-red-400" : "text-gray-500 hover:text-red-500"}`} title="Disconnect">
                <Unlink className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button onClick={connectGoogleDrive} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              <Cloud className="w-4 h-4" />
              Connect Google Drive
            </button>
          )}
        </div>
      </div>

      {showFilePicker && files.length > 0 && (
        <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg border`}>
          <div className={`px-4 py-3 border-b ${darkMode ? "border-gray-700" : "border-gray-100"} flex items-center justify-between`}>
            <h4 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>Select Files to Import ({files.length})</h4>
            <button onClick={() => setShowFilePicker(false)} className={`p-1 rounded ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
              <X className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
            </button>
          </div>
          <div className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-100"} max-h-80 overflow-y-auto`}>
            {files.map((file) => (
              <div key={file.id} className={`p-4 flex items-center justify-between ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getMimeTypeIcon(file.mimeType)}</span>
                  <div>
                    <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{file.name}</p>
                    <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      {new Date(file.modifiedTime).toLocaleDateString()}{file.size && ` • ${formatFileSize(file.size)}`}
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
          <p className={`text-sm mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Upload PDFs, Word docs, or spreadsheets to your Google Drive</p>
        </div>
      )}
    </div>
  );
}
