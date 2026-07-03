"use client";
import { useState, useEffect } from "react";
import { MessageSquare, Clock, Globe, Users } from "lucide-react";

interface Props { companyId: string; }

export default function QuickStats({ companyId }: Props) {
  const [stats, setStats] = useState<{ questions: number; avgTime: string; languages: number; workers: number } | null>(null);

  useEffect(() => {
    if (!companyId) return;
    fetch(`/api/analytics?companyId=${companyId}&action=stats`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d); })
      .catch(() => {});
  }, [companyId]);

  const cards = [
    { label: "Questions Answered", value: stats?.questions?.toLocaleString() ?? "—", icon: <MessageSquare className="h-5 w-5" />, color: "text-blue-600" },
    { label: "Avg Response Time", value: stats?.avgTime ?? "—", icon: <Clock className="h-5 w-5" />, color: "text-emerald-600" },
    { label: "Languages Detected", value: stats?.languages ?? "—", icon: <Globe className="h-5 w-5" />, color: "text-violet-600" },
    { label: "Active Workers", value: stats?.workers ?? "—", icon: <Users className="h-5 w-5" />, color: "text-[#C96442]" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-4 relative">
          <div className={`absolute top-4 right-4 ${c.color} opacity-40`}>{c.icon}</div>
          {stats === null ? (
            <>
              <div className="h-7 w-16 bg-gray-100 animate-pulse rounded mb-2" />
              <div className="h-3 w-24 bg-gray-100 animate-pulse rounded" />
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              <p className="text-xs text-gray-500 mt-1">{c.label}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
