"use client";

/* ThreadDemo v3, work orders: SMS arrives, Sidekick's plan executes, tech acknowledges, fix saved */
import { useEffect, useState, useRef } from "react";

const STEPS = ["Log the issue: Conveyor 3", "Create work order #482", "Route Mike T. with parts info", "Save the fix to knowledge"];

function ThreadDemo(props) {
  const accent = props.accent || "#1D6BF3";
  const [sms, setSms] = useState(false);
  const [plan, setPlan] = useState(false);
  const [checked, setChecked] = useState(0);
  const [ack, setAck] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fading, setFading] = useState(false);
  const timersRef = useRef([]);

  const run = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    const push = (fn, d) => timersRef.current.push(setTimeout(fn, d));

    setSms(false); setPlan(false); setChecked(0); setAck(false); setSaved(false); setFading(false);
    push(() => setSms(true), 600);
    push(() => setPlan(true), 1600);
    STEPS.forEach((_, i) => push(() => setChecked(i + 1), 2500 + i * 1200));
    push(() => setAck(true), 2500 + 3 * 1200 + 500);
    push(() => setSaved(true), 2500 + 4 * 1200 + 900);
    push(() => setFading(true), 12600);
    push(run, 13300);
  };

  useEffect(() => {
    run();
    return () => timersRef.current.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <div style={{
      width: "100%", height: "100%", background: "#F1ECDF", borderRadius: 20, padding: "28px 32px",
      boxSizing: "border-box", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    }}>
      <style>{`
        @keyframes sk-plan-pop { 0% { transform: scale(0.5); } 70% { transform: scale(1.15); } 100% { transform: scale(1); } }
        @keyframes sk-plan-in { 0% { opacity: 0; transform: scale(0.9) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: fading ? 0 : 1, transition: "opacity 0.5s ease" }}>
        <div style={{ alignSelf: "flex-end", minHeight: 38 }}>
          {sms && (
            <div style={{ background: "#3478F6", color: "#FFFFFF", borderRadius: "16px 16px 4px 16px", padding: "10px 15px", fontSize: 13, maxWidth: 250, boxShadow: "0 4px 14px rgba(0,0,0,0.1)", animation: "sk-plan-in 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) both" }}>
              Conveyor 3 making a grinding noise
            </div>
          )}
        </div>

        <div style={{ minHeight: 246 }}>
          {plan && (
            <div style={{
              background: "#FDFCF9", borderRadius: 18, boxShadow: "0 10px 34px rgba(38,37,30,0.1), 0 2px 8px rgba(38,37,30,0.05)",
              padding: "20px 24px 12px", animation: "sk-plan-in 0.4s ease-out both"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 13, borderBottom: "1.5px dotted #D8D2C0", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: accent, flex: "none" }} />
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.13em", color: "#9B9788" }}>SIDEKICK'S PLAN</span>
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", color: "#26251E", background: "#F7E3DC", borderRadius: 999, padding: "3px 9px" }}>WO #482 · HIGH</span>
              </div>
              {STEPS.map((label, i) => {
                const done = checked > i;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0" }}>
                    <span style={{
                      width: 19, height: 19, borderRadius: 5.5, flex: "none", boxSizing: "border-box",
                      background: done ? accent : "transparent", border: done ? "none" : "1.8px solid #D3CCBA",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      animation: done ? "sk-plan-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none"
                    }}>
                      {done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    </span>
                    <span style={{ fontSize: 14.5, color: done ? "#26251E" : "#BDB6A4", transition: "color 0.3s ease", letterSpacing: "-0.01em" }}>{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ alignSelf: "flex-start", minHeight: 34 }}>
          {ack && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FDFCF9", border: "1px solid #E3DDCB", borderRadius: 999, padding: "8px 15px", fontSize: 12, color: "#26251E", animation: "sk-plan-in 0.35s ease-out both" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#5A6B3B" }} />
              Mike T. acknowledged, ETA 10 min
            </span>
          )}
        </div>
        <div style={{ alignSelf: "flex-start", minHeight: 34 }}>
          {saved && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: accent, color: "#FFFFFF", borderRadius: 999, padding: "8px 15px", fontSize: 12, fontWeight: 500, boxShadow: "0 4px 14px rgba(29,107,243,0.3)", animation: "sk-plan-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}>
              ✓ Fix saved to the knowledge base
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ThreadDemo;
