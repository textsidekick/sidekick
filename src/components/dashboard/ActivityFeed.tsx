"use client";
import { useState, useEffect } from "react";
import { Activity } from "lucide-react";

interface FeedItem {
  id: string;
  phone: string;
  question: string;
  responseTime: string;
  timestamp: string;
  language?: string;
}

const DEMO_FEED: FeedItem[] = [
  { id: "1", phone: "+1***8234", question: "What time does my shift start?", responseTime: "1.8s", timestamp: "2 min ago" },
  { id: "2", phone: "+1***5671", question: "Where do I park?", responseTime: "2.3s", timestamp: "5 min ago" },
  { id: "3", phone: "+1***9012", question: "Como solicito tiempo libre?", responseTime: "2.1s", timestamp: "8 min ago", language: "Spanish" },
  { id: "4", phone: "+1***3456", question: "What's the dress code?", responseTime: "1.5s", timestamp: "12 min ago" },
  { id: "5", phone: "+1***7890", question: "Who do I call if I'm sick?", responseTime: "1.9s", timestamp: "15 min ago" },
  { id: "6", phone: "+1***2345", question: "Saan ako mag-clock in?", responseTime: "2.4s", timestamp: "18 min ago", language: "Tagalog" },
  { id: "7", phone: "+1***6789", question: "Is there overtime this weekend?", responseTime: "1.7s", timestamp: "22 min ago" },
  { id: "8", phone: "+1***1234", question: "What PPE do I need in Zone B?", responseTime: "2.0s", timestamp: "25 min ago" },
];

interface Props { companyId: string; }

export default function ActivityFeed({ companyId }: Props) {
  const [feed, setFeed] = useState<FeedItem[]>(DEMO_FEED);

  useEffect(() => {
    fetch(`/api/analytics?companyId=${companyId}&action=recent`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.feed?.length) setFeed(d.feed); })
      .catch(() => {});

    const interval = setInterval(() => {
      fetch(`/api/analytics?companyId=${companyId}&action=recent`)
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.feed?.length) setFeed(d.feed); })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [companyId]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center gap-2">
        <Activity className="h-4 w-4 text-[#C96442]" />
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
        <span className="ml-auto flex items-center gap-1">
          <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Live</span>
        </span>
      </div>
      <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
        {feed.map(item => (
          <div key={item.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-gray-800 truncate">
                  <span className="font-mono text-xs text-gray-400">{item.phone}</span>
                  {" -- "}
                  <span className="font-medium">"{item.question}"</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Answered in {item.responseTime}
                  {item.language && <span className="ml-2 px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px] font-medium">{item.language}</span>}
                </p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{item.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
