"use client";
import { useState } from "react";
import { Send, Users, Phone } from "lucide-react";

interface InviteWorkersProps {
  companyId: string;
  accessCode: string;
  twilioNumber?: string;
}

export default function InviteWorkers({ companyId, accessCode, twilioNumber = "+1 (888) 707-4659" }: InviteWorkersProps) {
  const [phones, setPhones] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [count, setCount] = useState(0);

  const handleInvite = async () => {
    const numbers = phones.split(/[\n,;]+/).map(p => p.trim()).filter(p => p.length >= 10);
    if (numbers.length === 0) return;
    
    setSending(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          message: `You've been invited to Sidekick! Text JOIN ${accessCode} to ${twilioNumber} to get instant answers about your workplace. No app needed - just text!`,
          phones: numbers,
        }),
      });
      const data = await res.json();
      setCount(numbers.length);
      setSent(true);
    } catch {}
    setSending(false);
  };

  if (sent) return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{"✅"}</div>
      <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1A16" }}>Invites sent to {count} workers!</p>
      <p style={{ fontSize: 12, color: "rgba(28,26,22,0.5)" }}>They'll receive a text with instructions to join.</p>
      <button onClick={() => { setSent(false); setPhones(""); }} style={{ marginTop: 8, fontSize: 12, color: "#C96442", background: "none", border: "none", cursor: "pointer" }}>Send more</button>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Users size={16} style={{ color: "#C96442" }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1C1A16" }}>Invite Workers via SMS</span>
      </div>
      <textarea
        value={phones}
        onChange={e => setPhones(e.target.value)}
        placeholder={"Enter phone numbers (one per line):\n5551234567\n5559876543"}
        rows={4}
        style={{
          width: "100%", padding: "10px 12px", borderRadius: 8,
          border: "1px solid rgba(28,26,22,0.1)", fontSize: 13,
          background: "#F7F3EC", resize: "vertical", fontFamily: "inherit",
        }}
      />
      <button
        onClick={handleInvite}
        disabled={sending || !phones.trim()}
        style={{
          width: "100%", marginTop: 8, padding: "10px", borderRadius: 8,
          background: phones.trim() ? "#C96442" : "rgba(28,26,22,0.1)",
          color: phones.trim() ? "white" : "rgba(28,26,22,0.3)",
          border: "none", fontSize: 14, fontWeight: 600, cursor: phones.trim() ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        <Send size={14} />
        {sending ? "Sending..." : "Send Invites"}
      </button>
    </div>
  );
}
