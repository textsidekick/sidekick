"use client";

/* ReportsDemo v4 — floating document cards (not a dashboard mock): cursor generates a report from the knowledge base */
import { useEffect, useState, useRef } from "react";

const REPORTS = [
  { name: "Safety Procedures", desc: "Protocols, compliance, and emergency steps" },
  { name: "Employee Handbook", desc: "Policies, procedures, and expectations" },
  { name: "FAQ: Top Worker Questions", desc: "The questions your floor actually asks" }
];

function ReportsDemo(props) {
  const accent = props.accent || "#1D6BF3";
  const [shown, setShown] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle|move|hover|click|generating|done|exit
  const [mousePos, setMousePos] = useState({ x: 300, y: 30 });
  const timersRef = useRef([]);
  const containerRef = useRef(null);
  const btnRef = useRef(null);

  const moveToBtn = () => {
    if (btnRef.current && containerRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const c = containerRef.current.getBoundingClientRect();
      setMousePos({ x: r.left - c.left + r.width * 0.55, y: r.top - c.top + r.height / 2 });
    }
  };

  const run = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    const push = (fn, d) => timersRef.current.push(setTimeout(fn, d));

    setShown(0); setPhase("idle");
    if (containerRef.current) {
      const c = containerRef.current.getBoundingClientRect();
      setMousePos({ x: c.width - 40, y: 30 });
    }

    REPORTS.forEach((_, i) => push(() => setShown(i + 1), 700 + i * 500));
    push(() => { setPhase("move"); moveToBtn(); }, 2900);
    push(() => { setPhase("hover"); moveToBtn(); }, 4000);
    push(() => setPhase("click"), 4500);
    push(() => setPhase("generating"), 4800);
    push(() => setPhase("done"), 7400);
    push(() => setPhase("exit"), 9500);
    push(run, 13500);
  };

  useEffect(() => {
    run();
    return () => timersRef.current.forEach((t) => clearTimeout(t));
  }, []);

  const showCursor = ["move", "hover", "click"].includes(phase);
  const generating = phase === "generating";
  const done = phase === "done" || phase === "exit";

  const docIcon = (
    <span style={{ width: 38, height: 38, borderRadius: 11, background: accent, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
    </span>
  );

  return (
    <div ref={containerRef} style={{
      width: "100%", height: "100%", background: "#F1ECDF", borderRadius: 20, padding: "28px 32px",
      boxSizing: "border-box", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", gap: 14,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    }}>
      <style>{`
        @keyframes sk-rep-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sk-rep-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 9, flex: "none", paddingLeft: 4 }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: accent, flex: "none" }} />
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.13em", color: "#9B9788" }}>AI-GENERATED REPORTS</span>
      </div>

      {REPORTS.map((r, i) => {
        const isTarget = i === 0;
        return (
          <div key={i} style={{
            background: "#FDFCF9", borderRadius: 16, padding: "15px 18px",
            boxShadow: "0 8px 26px rgba(38,37,30,0.08), 0 2px 6px rgba(38,37,30,0.04)",
            opacity: shown > i ? 1 : 0, transform: shown > i ? "translateY(0)" : "translateY(-6px)",
            outline: isTarget && ["hover", "click"].includes(phase) ? `2px solid ${accent}` : "2px solid transparent", transition: "opacity 0.35s ease, transform 0.35s ease, outline 0.25s ease"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              {docIcon}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#26251E" }}>{r.name}</div>
                <div style={{ fontSize: 11, color: "#9B9788", marginTop: 2 }}>{r.desc}</div>
              </div>
              {isTarget ? (
                done ? (
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#5A6B3B", whiteSpace: "nowrap", animation: "sk-rep-in 0.3s ease-out both" }}>Ready · 12 pages ✓</span>
                ) : generating ? (
                  <span style={{ display: "inline-flex", gap: 3.5, alignItems: "center", padding: "6px 14px" }}>
                    <span style={{ width: 4.5, height: 4.5, borderRadius: "50%", background: accent, animation: "sk-rep-pulse 1s ease-in-out infinite" }} />
                    <span style={{ width: 4.5, height: 4.5, borderRadius: "50%", background: accent, animation: "sk-rep-pulse 1s ease-in-out 0.2s infinite" }} />
                    <span style={{ width: 4.5, height: 4.5, borderRadius: "50%", background: accent, animation: "sk-rep-pulse 1s ease-in-out 0.4s infinite" }} />
                  </span>
                ) : (
                  <span ref={btnRef} style={{
                    fontSize: 11, fontWeight: 600, padding: "6px 15px", borderRadius: 999, cursor: "default", whiteSpace: "nowrap",
                    background: ["hover", "click"].includes(phase) ? accent : "#FFFFFF",
                    color: ["hover", "click"].includes(phase) ? "#FFFFFF" : accent,
                    border: `1.5px solid ${accent}`,
                    transform: phase === "click" ? "scale(0.95)" : "scale(1)", transition: "all 0.2s ease"
                  }}>Generate</span>
                )
              ) : (
                <span style={{ fontSize: 11, fontWeight: 600, padding: "6px 15px", borderRadius: 999, background: "#FFFFFF", color: "#8A857A", border: "1.5px solid #E3DDCB", whiteSpace: "nowrap" }}>Generate</span>
              )}
            </div>
            {isTarget && (
              <div style={{ marginTop: 11, paddingTop: 11, borderTop: "1.5px dotted #D8D2C0", fontSize: 11, color: "#6E6A5D", opacity: done ? 1 : 0.35, transition: "opacity 0.35s ease" }}>
                {done ? "Compiled from 84 captured answers and 6 SOPs. Every claim cites its source." : "Compiles from your captured answers and SOPs. Every claim cites its source."}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ fontSize: 11, color: "#6E6A5D", flex: "none", paddingLeft: 4 }}>
        Documents written from your own knowledge base, not the internet.
      </div>

      <svg style={{
        position: "absolute", left: mousePos.x, top: mousePos.y, width: 20, height: 20, zIndex: 50,
        pointerEvents: "none", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
        opacity: showCursor ? 1 : 0,
        transform: phase === "click" ? "scale(0.85)" : "scale(1)",
        transition: phase === "move" ? "left 0.9s cubic-bezier(0.4, 0, 0.2, 1), top 0.9s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s" : "all 0.2s ease"
      }} viewBox="0 0 24 24">
        <path d="M5.5 3.21V20.8l4.86-4.86 3.58 8.06 2.62-1.17-3.58-8.06h6.52L5.5 3.21z" fill="#111827" stroke="white" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export default ReportsDemo;
