"use client";

import { X, User, Award } from "lucide-react";

function formatTimeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getAvatarColor(name: string): string {
  const colors = ["bg-[#0060F0]","bg-green-500","bg-purple-500","bg-pink-500","bg-indigo-500","bg-cyan-500","bg-blue-500","bg-teal-500"];
  return colors[name ? name.charCodeAt(0) % colors.length : 0];
}

function getInitials(name: string): string {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

interface Worker { phone: string; company_id: string; name?: string; photo_url?: string; registered_at?: string; }
interface Question { id: string; question: string; answer: string; worker_phone: string; worker_name?: string; confidence: number; created_at: string; topic?: string; }

interface Props {
  worker: Worker | null;
  onClose: () => void;
  workerQuestions: Question[];
  certifications: any[];
}

export function WorkerDetailModal({ worker, onClose, workerQuestions, certifications }: Props) {
  if (!worker) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(worker.name || "")}`}>
              {worker.name ? getInitials(worker.name) : <User className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{worker.name || "Unknown Worker"}</h3>
              <p className="text-sm text-gray-500">{worker.phone}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-gray-900">{workerQuestions.length}</p><p className="text-xs text-gray-500">Questions</p></div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{workerQuestions.length > 0 ? Math.round(workerQuestions.reduce((a, q) => a + q.confidence, 0) / workerQuestions.length) : 0}%</p>
              <p className="text-xs text-gray-500">Avg Confidence</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{worker.registered_at ? formatTimeAgo(worker.registered_at) : "N/A"}</p>
              <p className="text-xs text-gray-500">Joined</p>
            </div>
          </div>

          <h4 className="font-medium text-gray-900 mb-3">Question History</h4>
          <div className="space-y-3">
            {workerQuestions.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No questions yet</p>
            ) : workerQuestions.map((q, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-gray-900">{q.question}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${q.confidence >= 70 ? "bg-green-100 text-green-700" : q.confidence >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{q.confidence}%</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{q.answer}</p>
                <p className="text-xs text-gray-400">{formatTimeAgo(q.created_at)}</p>
              </div>
            ))}
          </div>

          <h4 className="font-medium text-gray-900 mb-3 mt-6">Certifications</h4>
          <div className="space-y-2">
            {certifications.filter(c => c.worker_phone === worker.phone).length === 0 ? (
              <p className="text-center py-4 text-gray-400">No certifications</p>
            ) : certifications.filter(c => c.worker_phone === worker.phone).map((cert, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className={`w-5 h-5 ${new Date(cert.expiry_date) > new Date() ? "text-green-500" : "text-red-500"}`} />
                  <div>
                    <p className="font-medium text-gray-900">{cert.cert_name}</p>
                    <p className="text-xs text-gray-500">Expires: {new Date(cert.expiry_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${new Date(cert.expiry_date) > new Date() ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {new Date(cert.expiry_date) > new Date() ? "Valid" : "Expired"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
