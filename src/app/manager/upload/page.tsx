"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Document = {
  id: string;
  name: string;
  type: string;
  file: File;
};

export default function UploadPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);

  const addDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newDocs = files.map(file => ({
      id: Math.random().toString(36).slice(2),
      name: file.name,
      type: "general",
      file
    }));
    setDocuments(prev => [...prev, ...newDocs]);
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const updateDocType = (id: string, type: string) => {
    setDocuments(prev => prev.map(d => 
      d.id === id ? { ...d, type } : d
    ));
  };

  const uploadAll = async () => {
    if (documents.length === 0) return;
    
    setUploading(true);
    try {
      for (const doc of documents) {
        const formData = new FormData();
        formData.append("file", doc.file);
        formData.append("type", doc.type);
        formData.append("companyId", "demo");

        await fetch("/api/documents/upload", {
          method: "POST",
          body: formData
        });
      }

      alert(`✅ Uploaded ${documents.length} documents!`);
      router.push("/manager");
    } catch (err) {
      alert("Upload failed: " + err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Upload Company Documents</h1>
          <p className="text-white/70">Add handbooks, policies, schedules, and more</p>
        </div>

        <div className="mb-8">
          <label className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl cursor-pointer transition">
            <span className="text-lg">📁 Add Documents</span>
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.md"
              onChange={addDocument}
              className="hidden"
            />
          </label>
        </div>

        {documents.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Documents to Upload ({documents.length})
            </h2>
            
            <div className="space-y-3">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
                  <div className="flex-1">
                    <div className="text-white font-medium">{doc.name}</div>
                    <div className="text-white/50 text-sm">{(doc.file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  
                  <select
                    value={doc.type}
                    onChange={(e) => updateDocType(doc.id, e.target.value)}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="general">General</option>
                    <option value="safety">Safety Manual</option>
                    <option value="schedule">Schedule</option>
                    <option value="policies">Policies</option>
                    <option value="training">Training</option>
                    <option value="equipment">Equipment</option>
                    <option value="emergency">Emergency</option>
                  </select>

                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {documents.length > 0 && (
          <button
            onClick={uploadAll}
            disabled={uploading}
            className="w-full px-6 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 text-white text-lg font-semibold rounded-xl transition"
          >
            {uploading ? "Uploading..." : `Upload ${documents.length} Document${documents.length > 1 ? 's' : ''}`}
          </button>
        )}
      </div>
    </main>
  );
}
