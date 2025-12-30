"use client";
import { useRef } from "react";

function HandbookUpload() {
  const [companyId, setCompanyId] = useState("demo");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<{ ok?: boolean; message: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    if (!file) {
      setStatus({ message: "Please select a PDF file." });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("companyId", companyId);
      formData.append("file", file);

      const res = await fetch("/api/handbook/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setStatus({
          ok: true,
          message: `Uploaded: ${data.chars} chars (saved to: ${data.savedTo})`,
        });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setStatus({
          message: data?.error || "Upload failed.",
        });
      }
    } catch (err) {
      setStatus({ message: "Upload failed due to a network error." });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10">
      <h2 className="text-lg font-semibold text-white mb-2">Handbook Upload</h2>
      <form className="flex flex-col sm:flex-row items-stretch gap-3" onSubmit={handleUpload}>
        <input
          type="text"
          className="rounded-xl px-3 py-2 border border-white/20 bg-black/20 text-white"
          placeholder="Company ID"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          disabled={uploading}
          style={{ minWidth: 120 }}
        />
        <input
          type="file"
          accept="application/pdf"
          className="rounded-xl px-3 py-2 border border-white/20 bg-black/20 text-white"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
          }}
          ref={fileInputRef}
          disabled={uploading}
          style={{ minWidth: 180 }}
        />
        <button
          type="submit"
          className="rounded-xl px-5 py-2 bg-emerald-500/80 text-white font-semibold hover:bg-emerald-500 disabled:opacity-60"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {status && (
        <div
          className={`mt-2 text-sm ${
            status.ok ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}

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
