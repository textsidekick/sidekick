"use client";
import { useState } from "react";
import { Zap, Check, Loader2, ArrowRight } from "lucide-react";

interface Props {
  companyId: string;
  plan: string;
  email?: string;
}

export default function UpgradeBanner({ companyId, plan, email }: Props) {
  const [loading, setLoading] = useState(false);

  if (plan === "pro") return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error("Checkout failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#C96442]/20 bg-gradient-to-r from-[#C96442]/5 to-amber-50 p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-[#C96442]" />
            <h3 className="text-base font-semibold text-gray-900">Upgrade to Sidekick Pro</h3>
            <span className="text-sm font-bold text-[#C96442]">$200/mo</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-600" /> Unlimited questions</span>
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-600" /> All integrations</span>
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-600" /> Priority support</span>
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-600" /> Weekly digest reports</span>
          </div>
        </div>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#C96442] text-white rounded-lg text-sm font-semibold hover:bg-[#b5573a] disabled:opacity-50 transition-colors flex-shrink-0"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
          ) : (
            <>Start Plan <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}
