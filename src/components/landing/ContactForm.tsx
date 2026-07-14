"use client";

import { useState } from "react";

const ACCENT = "#1D6BF3";

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "#FFFFFF",
  border: "1px solid #E3DDCB",
  borderRadius: 10,
  padding: "11px 14px",
  fontSize: 13,
  color: "#26251E",
  fontFamily: "inherit",
  outline: "none",
};
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  color: "#26251E",
  marginBottom: 7,
};

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Contact / demo-request form.
 *
 * SUBMITS TO: POST /api/contact — the EXISTING route already in this repo
 *             (src/app/api/contact/route.ts, Resend-backed). No backend changes.
 * PAYLOAD:    { name, email, company, size, message } — name/email/company/message required
 * STATES:     idle -> submitting -> success (form replaced by confirmation)
 *                                -> error (inline banner, form stays editable)
 */
export default function ContactForm() {
  const [fields, setFields] = useState({ name: "", email: "", company: "", size: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.name.trim() || !fields.email.trim() || !fields.company.trim() || !fields.message.trim()) {
      setError("Please fill in your name, work email, company, and a short message.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setStatus("success");
    } catch {
      setError("Something went wrong sending your message. Please try again, or email hello@textsidekick.com.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="lp-contact-success" style={{ background: "#FBF7EF", border: "1px solid #EDE7D8", borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
        <span style={{ width: 36, height: 36, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </span>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#26251E", margin: 0 }}>Message sent.</p>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#6E6A5D", margin: 0 }}>
          Thanks {fields.name.split(" ")[0]} — we&rsquo;ll reply within one business day to set up a short call.
        </p>
      </div>
    );
  }

  return (
    <form className="lp-contact-form" onSubmit={submit} style={{ background: "#FBF7EF", border: "1px solid #EDE7D8", borderRadius: 20, padding: 28 }}>
      <div className="lp-contact-fields" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Your name <span style={{ color: ACCENT }}>*</span></label>
          <input type="text" required value={fields.name} onChange={set("name")} placeholder="Jordan Halverson" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Work email <span style={{ color: ACCENT }}>*</span></label>
          <input type="email" required value={fields.email} onChange={set("email")} placeholder="jordan@halversonmfg.com" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Company <span style={{ color: ACCENT }}>*</span></label>
          <input type="text" required value={fields.company} onChange={set("company")} placeholder="Halverson Manufacturing" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Workforce size</label>
          <input type="text" value={fields.size} onChange={set("size")} placeholder="80 frontline workers" style={inputStyle} />
        </div>
      </div>
      <label style={labelStyle}>What&rsquo;s the most chaotic part of your operation right now?</label>
      <textarea
        rows={4}
        required
        value={fields.message}
        onChange={set("message")}
        placeholder="Onboarding takes forever, SOPs are everywhere, half the team texts me at 6am…"
        style={{ ...inputStyle, resize: "none", marginBottom: 16 }}
      />
      {status === "error" && (
        <div style={{ background: "#F7E3DC", border: "1px solid #E8B7A4", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: "#26251E", marginBottom: 16 }}>
          {error}
        </div>
      )}
      <div className="lp-contact-actions" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <span className="lp-contact-note" style={{ fontSize: 11.5, lineHeight: 1.5, color: "#9B9788", maxWidth: 240 }}>
          We&rsquo;ll never share your info. Reply within one business day.
        </span>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="lp-btn-dark lp-contact-submit"
          style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: 8, border: "none", borderRadius: 999, padding: "13px 24px", fontSize: 13.5, fontWeight: 500, cursor: status === "submitting" ? "default" : "pointer", fontFamily: "inherit", opacity: status === "submitting" ? 0.7 : 1 }}
        >
          {status === "submitting" ? "Sending…" : "Send message →"}
        </button>
      </div>
    </form>
  );
}
