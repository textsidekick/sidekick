"use client";
import { useState, useEffect } from "react";
import { MessageSquare, AlertTriangle, UserPlus, Clock } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "question" | "join" | "issue";
  message: string;
  time: string;
  workerName?: string;
}

interface ActivityFeedProps {
  companyId: string;
}

export default function ActivityFeed({ companyId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;
    const fetchActivity = async () => {
      try {
        const res = await fetch(`/api/analytics?companyId=${companyId}&timeRange=1week`);
        const data = await res.json();
        const items: ActivityItem[] = [];
        
        for (const q of (data.recentQuestions || []).slice(0, 10)) {
          items.push({
            id: `q-${q.id}`,
            type: "question",
            message: q.question?.slice(0, 60) + (q.question?.length > 60 ? "..." : ""),
            time: q.created_at,
            workerName: q.worker_name || "A worker",
          });
        }
        
        setActivities(items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
      } catch {}
      setLoading(false);
    };
    fetchActivity();
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, [companyId]);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "question": return <MessageSquare size={14} style={{ color: "#C96442" }} />;
      case "join": return <UserPlus size={14} style={{ color: "#22c55e" }} />;
      case "issue": return <AlertTriangle size={14} style={{ color: "#f59e0b" }} />;
      default: return <Clock size={14} style={{ color: "rgba(28,26,22,0.4)" }} />;
    }
  };

  if (loading) return <div style={{ padding: 20, textAlign: "center", color: "rgba(28,26,22,0.4)", fontSize: 13 }}>Loading activity...</div>;
  
  if (activities.length === 0) return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <p style={{ color: "rgba(28,26,22,0.4)", fontSize: 13 }}>No activity yet. Share your access code to get started!</p>
    </div>
  );

  return (
    <div style={{ maxHeight: 300, overflowY: "auto" }}>
      {activities.map(a => (
        <div key={a.id} style={{
          display: "flex", alignItems: "start", gap: 10, padding: "10px 16px",
          borderBottom: "1px solid rgba(28,26,22,0.04)",
        }}>
          <div style={{ marginTop: 2 }}>{getIcon(a.type)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, color: "#1C1A16", margin: "0 0 2px", lineHeight: 1.4 }}>
              <strong>{a.workerName}</strong> {a.type === "question" ? "asked" : a.type === "join" ? "joined" : "reported"}: {a.message}
            </p>
            <p style={{ fontSize: 11, color: "rgba(28,26,22,0.35)", margin: 0 }}>{timeAgo(a.time)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
