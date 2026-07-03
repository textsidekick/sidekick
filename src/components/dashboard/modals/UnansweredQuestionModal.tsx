"use client";

import { X, MessageSquare } from "lucide-react";

interface Props {
  question: any | null;
  onClose: () => void;
  answer: string;
  setAnswer: (s: string) => void;
  onSend: () => void;
}

export function UnansweredQuestionModal({ question, onClose, answer, setAnswer, onSend }: Props) {
  if (!question) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                <MessageSquare className="w-5 h-5 text-[#0060F0]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{question.worker_name || "Worker"}</p>
                <p className="text-xs text-gray-400">{question.created_at ? new Date(question.created_at).toLocaleString() : ""}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm font-medium mb-1 text-gray-500">Question</p>
          <p className="text-base mb-4 text-gray-900">{question.question}</p>
          <p className="text-sm font-medium mb-2 text-gray-500">Your Answer</p>
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={4}
            className="w-full rounded-lg border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0060F0]"
          />
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">Response will be sent via SMS and saved permanently</p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg text-gray-500 hover:bg-gray-100">Cancel</button>
            <button onClick={onSend} className="px-4 py-2 text-sm rounded-lg bg-[#0060F0] text-white hover:opacity-90 font-medium">Send Answer</button>
          </div>
        </div>
      </div>
    </div>
  );
}
