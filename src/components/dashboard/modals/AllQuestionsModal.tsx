"use client";

import { X, Search, User } from "lucide-react";

function getAvatarColor(name: string): string {
  const colors = ["bg-[#C96442]","bg-green-500","bg-purple-500","bg-pink-500","bg-indigo-500","bg-cyan-500","bg-orange-500","bg-teal-500"];
  return colors[name ? name.charCodeAt(0) % colors.length : 0];
}

function getInitials(name: string): string {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

interface Question { id: string; question: string; answer: string; worker_phone: string; worker_name?: string; confidence: number; created_at: string; topic?: string; }

interface Props {
  open: boolean;
  onClose: () => void;
  filteredQuestions: Question[];
  questionSearch: string;
  setQuestionSearch: (s: string) => void;
  questionFilter: "all" | "answered" | "unanswered";
  setQuestionFilter: (f: "all" | "answered" | "unanswered") => void;
}

export function AllQuestionsModal({ open, onClose, filteredQuestions, questionSearch, setQuestionSearch, questionFilter, setQuestionFilter }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">All Questions</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-4">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions or workers..."
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C96442]"
              />
            </div>
            <select
              value={questionFilter}
              onChange={(e) => setQuestionFilter(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C96442]"
            >
              <option value="all">All</option>
              <option value="answered">Answered</option>
              <option value="unanswered">Unanswered</option>
            </select>
          </div>
          <div className="overflow-y-auto max-h-[60vh] space-y-3">
            {filteredQuestions.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No questions found</p>
            ) : filteredQuestions.map((q, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0 ${getAvatarColor(q.worker_name || "")}`}>
                    {q.worker_name ? getInitials(q.worker_name) : <User className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-gray-900">{q.worker_name || "Unknown"}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${q.confidence >= 70 ? "bg-gray-100 text-gray-600" : q.confidence >= 40 ? "bg-gray-100 text-gray-600" : "bg-gray-100 text-gray-600"}`}>{q.confidence}% confidence</span>
                    </div>
                    <p className="text-gray-700 mb-2">{q.question}</p>
                    <p className="text-sm text-gray-500">{q.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
