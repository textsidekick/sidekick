"use client";

import { useState } from "react";

const serif = "var(--font-instrument-serif), Georgia, serif";
const ACCENT = "#1D6BF3";

const FAQS = [
  { q: "Do workers need to download an app or learn a new system?", a: "No. Sidekick works over plain SMS. Workers text a number the same way they'd text a coworker. There's no app to download, no account to create, and no password to forget. Managers use a web dashboard." },
  { q: "What does pricing look like?", a: "Simple per-site pricing with no per-seat fees, so you never think twice about adding workers. We'll walk you through it on a short call. No pitch deck." },
  { q: "What if workers are not allowed to install apps or use complex tools?", a: "That's exactly who Sidekick is built for. It runs over plain SMS: no installs, no logins, no training. It works on any phone, including flip phones." },
  { q: "Can I use it alongside my current systems?", a: "Yes. Sidekick can be your system of record for work orders, or sit in front of the tools you already use, turning texts into tickets and syncing status back to the thread." },
  { q: "What happens when the AI gets something wrong?", a: "When Sidekick isn't confident, it says so and escalates to a manager instead of guessing. The manager's answer is captured and cited going forward, so it never makes the same mistake twice." },
  { q: "Where does the knowledge go?", a: "Into a centralized, searchable knowledge base your company owns. Every answer cites the source SOP, page, and revision, and it compounds with every shift worked." },
];

export default function Faq() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section id="faq" className="lp-faq-section" style={{ padding: "0 36px 120px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A857A" }}>FAQ</span>
        </div>
        <h2 style={{ fontFamily: serif, fontWeight: 400, fontSize: 44, margin: "0 0 40px" }}>Common questions.</h2>
        {FAQS.map((f, i) => (
          <div key={i} style={{ background: "#FFFFFF", borderRadius: 14, marginBottom: 12, padding: "4px 24px", boxShadow: "0 1px 4px rgba(38,37,30,0.04)" }}>
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, background: "none", border: "none", padding: "20px 0", cursor: "pointer", textAlign: "left", fontFamily: "inherit", fontSize: 15.5, fontWeight: 600, color: "#26251E" }}
            >
              {f.q}
              <span style={{ fontSize: 20, fontWeight: 400, color: ACCENT, flex: "none" }}>{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <div style={{ padding: "0 0 20px", fontSize: 13.5, lineHeight: 1.7, color: "#6E6A5D", maxWidth: 680 }}>{f.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
