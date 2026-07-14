/* EscalationDemo — urgent safety escalation timeline (light panel) */
const { useEffect, useState, useRef } = React;

const STEPS = [
  { time: "2:47 AM", kind: "worker", text: "Ammonia smell near the freezer compressor" },
  { time: "2:47 AM", kind: "flag", text: "Flagged CRITICAL — safety hazard", badge: "CRITICAL" },
  { time: "2:47 AM", kind: "action", text: "Calling + texting on-call supervisor…", live: true },
  { time: "2:48 AM", kind: "ack", text: "Dana R. acknowledged — en route", badge: "ACK 42s" },
  { time: "2:48 AM", kind: "wo", text: "Work order #4523 created · evacuation checklist sent to floor" }
];

function EscalationDemo() {
  const [shown, setShown] = useState(0);
  const timersRef = useRef([]);

  const run = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    const push = (t) => timersRef.current.push(t);

    setShown(0);
    const delays = [800, 2400, 3800, 6600, 8400];
    delays.forEach((d, i) => push(setTimeout(() => setShown(i + 1), d)));
    push(setTimeout(run, 14000));
  };

  useEffect(() => {
    run();
    return () => timersRef.current.forEach((t) => clearTimeout(t));
  }, []);

  const renderStep = (s, i) => {
    const isLast = i === shown - 1;
    let icon, iconBg, iconColor;
    if (s.kind === "worker") { iconBg = "#26251E"; iconColor = "#FAF8F1"; icon = (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    ); }
    else if (s.kind === "flag") { iconBg = "#FBE3DC"; iconColor = "#C24E2E"; icon = (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
    ); }
    else if (s.kind === "action") { iconBg = "#F1ECDF"; iconColor = "#6E6A5D"; icon = (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
    ); }
    else if (s.kind === "ack") { iconBg = "#DCE8D2"; iconColor = "#5A6B3B"; icon = (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="20 6 9 17 4 12" /></svg>
    ); }
    else { iconBg = "#F1ECDF"; iconColor = "#6E6A5D"; icon = (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
    ); }

    return (
      <div key={i} style={{ display: "flex", gap: 12, animation: "sk-esc-in 0.35s ease-out both", position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%", background: iconBg, color: iconColor,
            display: "flex", alignItems: "center", justifyContent: "center", flex: "none", zIndex: 1,
            animation: s.live && isLast ? "sk-esc-ring 1.2s ease-in-out infinite" : "none"
          }}>{icon}</div>
          {i < STEPS.length - 1 && <div style={{ width: 1.5, flex: 1, background: "#E3DDCB", minHeight: 12 }} />}
        </div>
        <div style={{ paddingBottom: 16, minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'SF Mono', Menlo, monospace", fontSize: 9.5, color: "#9B9788" }}>{s.time}</span>
            {s.badge && (
              <span style={{
                fontFamily: "'SF Mono', Menlo, monospace", fontSize: 9, fontWeight: 600, letterSpacing: "0.06em",
                padding: "2px 8px", borderRadius: 999,
                background: s.kind === "flag" ? "#FBE3DC" : "#DCE8D2",
                color: s.kind === "flag" ? "#C24E2E" : "#5A6B3B"
              }}>{s.badge}</span>
            )}
          </div>
          <div style={{
            marginTop: 4, fontSize: 13, lineHeight: 1.5, color: "#26251E",
            fontStyle: s.kind === "worker" ? "italic" : "normal"
          }}>
            {s.kind === "worker" ? `"${s.text}"` : s.text}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      width: "100%", height: "100%", background: "#FFFFFF", border: "1px solid #E3DDCB", borderRadius: 12,
      padding: 20, display: "flex", flexDirection: "column", boxSizing: "border-box", overflow: "hidden",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      boxShadow: "0 4px 24px rgba(0,0,0,0.06)"
    }}>
      <style>{`
        @keyframes sk-esc-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sk-esc-ring { 0%, 100% { box-shadow: 0 0 0 0 rgba(194,78,46,0.35); } 50% { box-shadow: 0 0 0 7px rgba(194,78,46,0); } }
        @keyframes sk-esc-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      `}</style>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 19, color: "#26251E" }}>Urgent escalation</div>
          <div style={{ fontSize: 11, color: "#9B9788", marginTop: 3 }}>Night shift · escalates until acknowledged</div>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'SF Mono', Menlo, monospace", fontSize: 9.5, letterSpacing: "0.1em", color: "#C24E2E", border: "1px solid #F0D5CB", borderRadius: 999, padding: "4px 10px" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C24E2E", animation: "sk-esc-blink 1.2s ease-in-out infinite" }} />
          LIVE
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {STEPS.slice(0, shown).map(renderStep)}
      </div>
    </div>
  );
}

window.EscalationDemo = EscalationDemo;
