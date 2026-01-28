"use client";
import React, { useState } from "react";
import { Video, Upload, Loader2, CheckCircle, MapPin, HelpCircle, FileText } from "lucide-react";

interface WalkthroughUploadProps {
  companyId: string;
  darkMode: boolean;
  onComplete?: (result: { locations: number; faqs: number; chunks: number }) => void;
}

export default function WalkthroughUpload({ companyId, darkMode, onComplete }: WalkthroughUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [result, setResult] = useState<{ locations: number; faqs: number; chunks: number } | null>(null);
  const [error, setError] = useState<string>("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      setError("Please upload a video file (MP4, MOV, etc.)");
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError("Video must be under 100MB");
      return;
    }

    setUploading(true);
    setProgress("Uploading video...");
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("companyId", companyId);

      setProgress("Processing video... This may take 1-2 minutes.");

      const res = await fetch("/api/walkthrough", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      setResult({
        locations: data.locations,
        faqs: data.faqs,
        chunks: data.chunks,
      });
      setProgress("");
      onComplete?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setProgress("");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl border p-6`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? "bg-purple-900" : "bg-purple-100"}`}>
          <Video className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
            Video Walkthrough
          </h3>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Record your facility and Sidekick will create a searchable knowledge base
          </p>
        </div>
      </div>

      {result ? (
        <div className={`${darkMode ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className={`font-medium ${darkMode ? "text-green-400" : "text-green-700"}`}>
              Walkthrough processed successfully!
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className={`${darkMode ? "bg-gray-700" : "bg-white"} rounded-lg p-3 text-center`}>
              <MapPin className={`w-5 h-5 mx-auto mb-1 ${darkMode ? "text-blue-400" : "text-blue-500"}`} />
              <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{result.locations}</p>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Locations</p>
            </div>
            <div className={`${darkMode ? "bg-gray-700" : "bg-white"} rounded-lg p-3 text-center`}>
              <HelpCircle className={`w-5 h-5 mx-auto mb-1 ${darkMode ? "text-amber-400" : "text-amber-500"}`} />
              <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{result.faqs}</p>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>FAQs Generated</p>
            </div>
            <div className={`${darkMode ? "bg-gray-700" : "bg-white"} rounded-lg p-3 text-center`}>
              <FileText className={`w-5 h-5 mx-auto mb-1 ${darkMode ? "text-green-400" : "text-green-500"}`} />
              <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{result.chunks}</p>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Knowledge Entries</p>
            </div>
          </div>
          <p className={`text-sm mt-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Workers can now text questions about these locations and get answers with photos.
          </p>
          <button
            onClick={() => setResult(null)}
            className={`mt-3 text-sm ${darkMode ? "text-blue-400" : "text-blue-600"} hover:underline`}
          >
            Upload another walkthrough
          </button>
        </div>
      ) : (
        <>
          <div
            className={`${darkMode ? "border-gray-600 hover:border-purple-500" : "border-gray-200 hover:border-purple-400"} border-2 border-dashed rounded-lg p-6 text-center transition-colors ${uploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
          >
            <input
              type="file"
              id="walkthrough-upload"
              className="hidden"
              accept="video/*"
              onChange={handleUpload}
              disabled={uploading}
            />
            <label htmlFor="walkthrough-upload" className="cursor-pointer">
              {uploading ? (
                <Loader2 className={`w-8 h-8 mx-auto mb-2 animate-spin ${darkMode ? "text-purple-400" : "text-purple-500"}`} />
              ) : (
                <Upload className={`w-8 h-8 mx-auto mb-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
              )}
              <p className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                {uploading ? progress : "Upload facility walkthrough video"}
              </p>
              <p className={`text-sm mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                MP4, MOV up to 100MB • 1-5 minutes recommended
              </p>
            </label>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-500">{error}</p>
          )}

          <div className={`mt-4 p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
            <p className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              💡 Tips for best results:
            </p>
            <ul className={`text-sm space-y-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              <li>• Walk slowly through your facility while recording</li>
              <li>• Narrate what you're showing: "This is the break room..."</li>
              <li>• Point out equipment, safety items, and key locations</li>
              <li>• Keep it under 5 minutes for faster processing</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
