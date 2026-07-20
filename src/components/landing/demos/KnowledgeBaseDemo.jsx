"use client";

/* KnowledgeBaseDemo v4 — spotlight-style floating search (not a dashboard mock): search pill, cited answer, history card */
import { useEffect, useState, useRef } from "react";

const ENTRIES = [
  { title: "Conveyor 3 bearing failure", detail: "Replace 6205-2RS · resolved by Mike T.", date: "Today", match: false },
  { title: "CNC-3 coolant PSI drop", detail: "Check pump seal · cited SOP-CNC-07 p3", date: "Apr 14", match: false },
  { title: "Forklift battery rotation", detail: "Bank A → C every Tues · per Mike", date: "Apr 11", match: false },
  { title: "Allen-Bradley fault E-04", detail: "Reset sequence + photo · per Devin", date: "Apr 06", match: false },
  { title: "Hydraulic press oil change", detail: "ISO 46 · every 500 hrs · Cage D", date: "Apr 02", match: true }
];

const QUERY = "when was the press oil last changed?";

function KnowledgeBaseDemo(props) {
  const accent = props.accent || "#1D6BF3";
  const [shown, setShown] = useState(0);
  const [typed, setTyped] = useState("");
  const [searching, setSearching] = useState(false);
  const [filtered, setFiltered] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [answer, setAnswer] = useState(false);
  const timersRef = useRef([]);

  const run = () => {
    timersRef.current.forEach((t) => { clearTimeout(t); clearInterval(t); });
    timersRef.current = [];
    const push = (t) => timersRef.current.push(t);

    setShown(0); setTyped(""); setSearching(false); setFiltered(false); setThinking(false); setAnswer(false);

    ENTRIES.forEach((_, i) => push(setTimeout(() => setShown(i + 1), 500 + i * 450)));

    const typeStart = 500 + ENTRIES.length * 450 + 800;
    push(setTimeout(() => {
      setSearching(true);
      let idx = 0;
      const iv = setInterval(() => {
        if (idx <= QUERY.length) { setTyped(QUERY.slice(0, idx)); idx++; }
        else clearInterval(iv);
      }, 42);
      push(iv);
    }, typeStart));
    const typeEnd = typeStart + QUERY.length * 42;
    push(setTimeout(() => setFiltered(true), typeEnd + 300));
    push(setTimeout(() => setThinking(true), typeEnd + 700));
    push(setTimeout(() => { setThinking(false); setAnswer(true); }, typeEnd + 1900));
    push(setTimeout(run, typeEnd + 1900 + 5400));
  };

  useEffect(() => {
    run();
    return () => timersRef.current.forEach((t) => { clearTimeout(t); clearInterval(t); });
  }, []);

  return (
    <div style={{
      width: "100%", height: "100%", background: "#F1ECDF", borderRadius: 20, padding: "24px 28px",
      boxSizing: "border-box", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: 10,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    }}>
      <style>{`
        @keyframes sk-kb-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sk-kb-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes sk-kb-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#FDFCF9", borderRadius: 999, padding: "12px 18px", boxShadow: "0 10px 30px rgba(38,37,30,0.1), 0 2px 8px rgba(38,37,30,0.05)", flex: "none" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B9788" strokeWidth="2" style={{ flex: "none" }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <span style={{ fontSize: 13.5, color: typed ? "#26251E" : "#B0AA99", whiteSpace: "nowrap", overflow: "hidden" }}>
          {typed || (searching ? "" : "Search everything your floor has learned…")}
        </span>
        {searching && !answer && <span style={{ width: 1.5, height: 14, background: accent, animation: "sk-kb-blink 1s step-end infinite", flex: "none" }} />}
      </div>

      <div style={{ minHeight: 82, flex: "none" }}>
        {(thinking || answer) && (
          <div style={{ animation: "sk-kb-in 0.35s ease-out both", background: "#FBF2DC", border: "1px solid #E8CFA0", borderRadius: 14, padding: "12px 17px", boxShadow: "0 6px 18px rgba(38,37,30,0.07)" }}>
            {thinking ? (
              <div style={{ display: "flex", gap: 4, alignItems: "center", height: 30 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#B08020", animation: "sk-kb-pulse 1s ease-in-out infinite" }} />
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#B08020", animation: "sk-kb-pulse 1s ease-in-out 0.2s infinite" }} />
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#B08020", animation: "sk-kb-pulse 1s ease-in-out 0.4s infinite" }} />
              </div>
            ) : (
              <div style={{ animation: "sk-kb-in 0.35s ease-out both" }}>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: "#26251E" }}>ISO 46 oil change on Apr 02 by Devin. Next due at 1,500 hrs. Cage D has 2 in stock.</div>
                <div style={{ fontFamily: "'SF Mono', Menlo, monospace", fontSize: 9, color: "#6E6A5D", marginTop: 6 }}>CITES SOP-HYD-11 · APR 02 · VERIFIED</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ background: "#FDFCF9", borderRadius: 18, boxShadow: "0 10px 34px rgba(38,37,30,0.1), 0 2px 8px rgba(38,37,30,0.05)", padding: "4px 16px", flex: "none" }}>
        {ENTRIES.map((e, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            borderBottom: i < ENTRIES.length - 1 ? "1px solid #F0EBDD" : "none", padding: "9px 4px",
            background: filtered && e.match ? "#FBF2DC" : "transparent",
            borderRadius: filtered && e.match ? 9 : 0,
            opacity: shown <= i ? 0 : (filtered && !e.match ? 0.35 : 1),
            transform: shown > i ? "translateY(0)" : "translateY(-6px)",
            transition: "opacity 0.4s ease, transform 0.35s ease, background 0.4s ease"
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#26251E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.title}</div>
              <div style={{ fontSize: 10.5, color: "#9B9788", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.detail}</div>
            </div>
            <span style={{ fontFamily: "'SF Mono', Menlo, monospace", fontSize: 9, color: "#B0AA99", flex: "none" }}>{e.date}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 7, flex: "none", padding: "2px 0 8px 6px" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, animation: "sk-kb-pulse 1.6s ease-in-out infinite" }} />
        <span style={{ fontSize: 11, color: "#6E6A5D" }}>+12 entries captured this week. Nothing walks out the door</span>
      </div>
    </div>
  );
}

export default KnowledgeBaseDemo;
