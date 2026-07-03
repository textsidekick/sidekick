"use client";

import { X, FileCheck } from "lucide-react";

interface Props {
  modal: { open: boolean; draft: string; topic: string } | null;
  onClose: () => void;
}

export function DraftModal({ modal, onClose }: Props) {
  if (!modal?.open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Generated Policy Draft</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{modal.draft}</pre>
        </div>
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-gray-600">Close</button>
          <button onClick={() => navigator.clipboard.writeText(modal.draft)} className="px-4 py-2 bg-[#C96442] text-white rounded-lg font-medium hover:opacity-90">
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}
