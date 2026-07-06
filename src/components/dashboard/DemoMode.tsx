"use client";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface Props { companyId: string; onSeeded?: () => void; }

export default function DemoMode({ companyId, onSeeded }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/demo/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
        if (onSeeded) onSeeded();
        setTimeout(() => setDone(false), 3000);
      }
    } catch (e) {
      console.error("Demo seed failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSeed}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
    >
      {loading ? (
        <><Loader2 className="h-3 w-3 animate-spin" /> Loading...</>
      ) : done ? (
        <>Done -- demo data loaded</>
      ) : (
        <><Sparkles className="h-3 w-3" /> Load Demo Data</>
      )}
    </button>
  );
}
