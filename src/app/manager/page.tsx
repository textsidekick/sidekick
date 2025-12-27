"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Onboarding = {
  id: string;
  name: string;
  department: string;
  supervisor: string;
  email: string;
  startDate: string;
  completedAt: string;
};

export default function ManagerPage() {
  const [rows, setRows] = useState<Onboarding[]>([]);

  function load() {
    try {
      const raw = localStorage.getItem("onboardings");
      const parsed = raw ? (JSON.parse(raw) as Onboarding[]) : [];
      setRows(Array.isArray(parsed) ? parsed : []);
    } catch {
      setRows([]);
    }
  }

  function clear() {
    localStorage.removeItem("onboardings");
    setRows([]);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="w-full max-w-5xl rounded-3xl bg-black/40 border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-white text-2xl font-semibold">Manager Dashboard</h1>
              <p className="text-white/70 text-sm">
                Completed onboardings: <span className="text-white">{rows.length}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={load}
                className="rounded-2xl px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm border border-white/10"
              >
                Refresh
              </button>
              <button
                onClick={clear}
                className="rounded-2xl px-4 py-2 bg-rose-500/60 hover:bg-rose-500/80 text-white text-sm"
              >
                Clear Data
              </button>
              <Link
                href="/"
                className="rounded-2xl px-4 py-2 bg-emerald-500/60 hover:bg-emerald-500/80 text-white text-sm"
              >
                Back to Worker
              </Link>
            </div>
          </div>

          <div className="mt-6 overflow-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/80">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Supervisor</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Start Date</th>
                  <th className="p-3">Completed At</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {rows.length === 0 ? (
                  <tr>
                    <td className="p-4 text-white/70" colSpan={6}>
                      No completed onboardings yet. Complete the worker flow, then come back here.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-t border-white/10">
                      <td className="p-3">{r.name}</td>
                      <td className="p-3">{r.department}</td>
                      <td className="p-3">{r.supervisor}</td>
                      <td className="p-3">{r.email}</td>
                      <td className="p-3">{r.startDate}</td>
                      <td className="p-3">
                        {new Date(r.completedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-white/60 text-xs">
            Tip: If you don’t see updates, click “Refresh” after completing onboarding.
          </div>
        </div>
      </div>
    </main>
  );
}
