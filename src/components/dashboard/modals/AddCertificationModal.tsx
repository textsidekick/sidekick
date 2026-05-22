"use client";

import { X } from "lucide-react";

interface Worker { phone: string; company_id: string; name?: string; }

interface Props {
  open: boolean;
  onClose: () => void;
  newCert: { workerPhone: string; certType: string; expiryDate: string };
  setNewCert: (updater: (prev: any) => any) => void;
  companyWorkers: Worker[];
  onAdd: () => void;
}

export function AddCertificationModal({ open, onClose, newCert, setNewCert, companyWorkers, onAdd }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Add Certification</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Worker</label>
            <select
              value={newCert.workerPhone}
              onChange={e => setNewCert(p => ({ ...p, workerPhone: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]"
            >
              <option value="">Select worker...</option>
              {companyWorkers.map(w => <option key={w.phone} value={w.phone}>{w.name || w.phone}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Certification Type</label>
            <input
              type="text"
              value={newCert.certType}
              onChange={e => setNewCert(p => ({ ...p, certType: e.target.value }))}
              placeholder="e.g. Forklift Operator"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Expiry Date</label>
            <input
              type="date"
              value={newCert.expiryDate}
              onChange={e => setNewCert(p => ({ ...p, expiryDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancel</button>
          <button onClick={onAdd} className="flex-1 px-4 py-2 bg-[#C96442] text-white rounded-lg text-sm font-medium hover:opacity-90">Add Certification</button>
        </div>
      </div>
    </div>
  );
}
