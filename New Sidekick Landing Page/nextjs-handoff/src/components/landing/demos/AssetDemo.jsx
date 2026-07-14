"use client";

/* AssetDemo v4 — floating asset-record card (not a dashboard mock): specs stream in, PM alert, cursor schedules, WO chip */
import { useEffect, useState, useRef } from "react";

const ROWS = [
  { label: "Model", value: "FlexLink X85 · drive-end" },
  { label: "Installed", value: "Sept 2019 · Line 2" },
  { label: "Runtime", value: "1,240 hrs since service" },
  { label: "Last fix", value: "Bearing replaced · WO #4521" }
];

function AssetDemo(props) {
  const accent = props.accent || "#1D6BF3";
  const [card, setCard] = useState(false);
  const [shown, setShown] = useState(0);
  const [due, setDue] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle|move|hover|click|scheduled
  const [wo, setWo] = useState(false);
  const [fading, setFading] = useState(false);
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

    setCard(false); setShown(0); setDue(false); setPhase("idle"); setWo(false); setFading(false);
    if (containerRef.current) {
      const c = containerRef.current.getBoundingClientRect();
      setMousePos({ x: c.width - 40, y: 30 });
    }

    push(() => setCard(true), 500);
    ROWS.forEach((_, i) => push(() => setShown(i + 1), 1200 + i * 700));
    push(() => setDue(true), 4400);
    push(() => { setPhase("move"); moveToBtn(); }, 5200);
    push(() => { setPhase("hover"); moveToBtn(); }, 6300);
    push(() => setPhase("click"), 6800);
    push(() => setPhase("scheduled"), 7100);
    push(() => setWo(true), 7900);
    push(() => setFading(true), 12400);
    push(run, 13100);
  };

  useEffect(() => {
    run();
    return () => timersRef.current.forEach((t) => clearTimeout(t));
  }, []);

  const showCursor = ["move", "hover", "click"].includes(phase);
  const scheduled = phase === "scheduled" || wo;

  return (
    <div ref={containerRef} style={{
      width: "100%", height: "100%", background: "#F1ECDF", borderRadius: 20, padding: "28px 32px",
      boxSizing: "border-box", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    }}>
      <style>{`
        @keyframes sk-as-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sk-as-pop { 0% { opacity: 0; transform: scale(0.6); } 70% { transform: scale(1.08); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes sk-as-pulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: fading ? 0 : 1, transition: "opacity 0.5s ease" }}>
        <div style={{ minHeight: 228 }}>
          {card && (
            <div style={{ background: "#FDFCF9", borderRadius: 18, boxShadow: "0 10px 34px rgba(38,37,30,0.1), 0 2px 8px rgba(38,37,30,0.05)", padding: "20px 24px 10px", animation: "sk-as-in 0.4s ease-out both" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 13, borderBottom: "1.5px dotted #D8D2C0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: accent, flex: "none" }} />
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.13em", color: "#9B9788" }}>ASSET RECORD</span>
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", color: "#26251E", background: "#F1ECDF", borderRadius: 999, padding: "3px 10px" }}>CONVEYOR 3 · LINE 2</span>
              </div>
              {ROWS.map((r, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 14, padding: "11px 2px",
                  borderBottom: i < ROWS.length - 1 ? "1px solid #F0EBDD" : "none",
                  opacity: shown > i ? 1 : 0, transform: shown > i ? "translateY(0)" : "translateY(6px)", transition: "opacity 0.35s ease, transform 0.35s ease"
                }}>
                  <span style={{ fontSize: 12, color: "#9B9788" }}>{r.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#26251E", textAlign: "right" }}>{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ minHeight: 44 }}>
          {due && !scheduled && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#FBF2DC", border: "1px solid #E8CFA0", borderRadius: 999, padding: "9px 10px 9px 16px", boxShadow: "0 4px 14px rgba(38,37,30,0.07)", animation: "sk-as-in 0.35s ease-out both" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#B08020", animation: "sk-as-pulse 1.4s ease-in-out infinite", flex: "none" }} />
              <span style={{ fontSize: 12.5, color: "#26251E", flex: 1 }}>Preventive maintenance due in 3 days</span>
              <span ref={btnRef} style={{
                fontSize: 11, fontWeight: 600, padding: "6px 14px", borderRadius: 999, whiteSpace: "nowrap", cursor: "default",
                background: ["hover", "click"].includes(phase) ? "#B08020" : "transparent",
                color: ["hover", "click"].includes(phase) ? "#FFFFFF" : "#26251E",
                border: "1.5px solid #B08020",
                transform: phase === "click" ? "scale(0.95)" : "scale(1)", transition: "all 0.2s ease"
              }}>Schedule</span>
            </div>
          )}
          {scheduled && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FDFCF9", border: "1px solid #E3DDCB", borderRadius: 999, padding: "9px 16px", fontSize: 12.5, color: "#26251E", boxShadow: "0 4px 14px rgba(38,37,30,0.07)", animation: "sk-as-in 0.35s ease-out both" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5A6B3B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><polyline points="20 6 9 17 4 12" /></svg>
              PM scheduled for Thursday, 7:00 AM
            </span>
          )}
        </div>
        <div style={{ minHeight: 36 }}>
          {wo && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: accent, color: "#FFFFFF", borderRadius: 999, padding: "8px 15px", fontSize: 12, fontWeight: 500, boxShadow: "0 4px 14px rgba(29,107,243,0.3)", animation: "sk-as-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}>
              ✓ Work order #4530 created. Mike T. notified by text
            </span>
          )}
        </div>
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

export default AssetDemo;
