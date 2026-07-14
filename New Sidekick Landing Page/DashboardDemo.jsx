/* DashboardDemo v2, extended manager-dashboard walkthrough: close out one WO, then triage + assign the urgent one */
const { useEffect, useState, useRef } = React;

function DashboardDemo(props) {
  const accent = props.accent || "#1D6BF3";
  const [phase, setPhase] = useState("idle");
  const [mousePos, setMousePos] = useState({ x: 320, y: 20 });
  const [r2Open, setR2Open] = useState(false);
  const [r2Done, setR2Done] = useState(false);
  const [r1Open, setR1Open] = useState(false);
  const [assigned, setAssigned] = useState(false);
  const timersRef = useRef([]);
  const containerRef = useRef(null);
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);
  const optRef = useRef(null);

  const center = (ref, fx, fy) => {
    if (ref.current && containerRef.current) {
      const r = ref.current.getBoundingClientRect();
      const c = containerRef.current.getBoundingClientRect();
      return { x: r.left - c.left + r.width * (fx || 0.7), y: r.top - c.top + r.height * (fy || 0.5) };
    }
    return null;
  };
  const moveTo = (ref, fx, fy) => { const p = center(ref, fx, fy); if (p) setMousePos(p); };

  const run = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    const push = (fn, d) => timersRef.current.push(setTimeout(fn, d));

    setPhase("idle"); setR2Open(false); setR2Done(false); setR1Open(false); setAssigned(false);
    if (containerRef.current) {
      const c = containerRef.current.getBoundingClientRect();
      setMousePos({ x: c.width - 40, y: 24 });
    }

    push(() => { setPhase("move2"); moveTo(row2Ref); }, 1000);
    push(() => { setPhase("hover2"); moveTo(row2Ref); }, 2000);
    push(() => setPhase("click2"), 2500);
    push(() => { setPhase("open2"); setR2Open(true); }, 2800);
    push(() => setR2Done(true), 4400);
    push(() => { setPhase("move1"); moveTo(row1Ref); }, 5800);
    push(() => { setPhase("hover1"); moveTo(row1Ref); }, 6800);
    push(() => setPhase("click1"), 7300);
    push(() => { setPhase("open1"); setR1Open(true); }, 7600);
    push(() => { setPhase("moveOpt"); moveTo(optRef, 0.5, 0.5); }, 8600);
    push(() => { setPhase("hoverOpt"); moveTo(optRef, 0.5, 0.5); }, 9500);
    push(() => setPhase("clickOpt"), 9900);
    push(() => { setPhase("done"); setAssigned(true); }, 10200);
    push(() => setPhase("exit"), 12400);
    push(run, 15000);
  };

  useEffect(() => {
    run();
    return () => timersRef.current.forEach((t) => clearTimeout(t));
  }, []);

  const showCursor = !["idle", "exit"].includes(phase);
  const moving = ["move2", "move1", "moveOpt"].includes(phase);
  const clicking = ["click2", "click1", "clickOpt"].includes(phase);
  const hover2 = ["hover2", "click2"].includes(phase);
  const hover1 = ["hover1", "click1"].includes(phase);
  const hoverOpt = ["hoverOpt", "clickOpt"].includes(phase);

  const chip = (label, color, bg) => (
    <span style={{ fontSize: 9.5, fontWeight: 600, color, background: bg, borderRadius: 999, padding: "3px 9px", whiteSpace: "nowrap", transition: "all 0.3s ease", flex: "none" }}>{label}</span>
  );

  const navItem = (label, count, active) => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 7, fontSize: 11,
      background: active ? "#FFFFFF" : "transparent", boxShadow: active ? "0 1px 3px rgba(38,37,30,0.07)" : "none",
      color: active ? "#26251E" : "#8A857A", fontWeight: active ? 600 : 400
    }}>
      <span>{label}</span>
      {count && <span style={{ fontSize: 10, color: "#B0AA99" }}>{count}</span>}
    </div>
  );

  return (
    <div ref={containerRef} style={{
      width: "100%", height: "100%", background: "#F1ECDF", borderRadius: 20, padding: 28,
      boxSizing: "border-box", overflow: "hidden", position: "relative",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    }}>
      <style>{`
        @keyframes sk-dash-flash { 0% { background: rgba(90,107,59,0.22); } 100% { background: #FAF8F1; } }
        @keyframes sk-dash-blueflash { 0% { background: rgba(29,107,243,0.14); } 100% { background: #FAF8F1; } }
        @keyframes sk-dash-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div style={{ background: "#FDFCF9", borderRadius: 14, overflow: "hidden", boxShadow: "0 10px 34px rgba(38,37,30,0.1), 0 2px 8px rgba(38,37,30,0.05)", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
        
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          
          <div style={{ flex: 1, padding: "16px 18px", minWidth: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 11 }}>
              <span style={{ fontSize: 11, color: "#9B9788" }}>Work orders /</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#26251E" }}>This week</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, justifyContent: "center" }}>
              <div ref={row1Ref} style={{ borderRadius: 8, overflow: "hidden", outline: hover1 ? `2px solid ${accent}` : "2px solid transparent", transition: "outline 0.25s ease", transform: phase === "click1" ? "scale(0.985)" : "scale(1)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 14px", background: "#FAF8F1", animation: assigned ? "sk-dash-blueflash 1.2s ease-out both" : "none" }}>
                  <span style={{ fontSize: 12.5, color: "#26251E" }}>Walk-in freezer temp alarm</span>
                  {assigned ? chip("Dana R. · Assigned", "#FFFFFF", accent) : chip("Urgent · unassigned", "#26251E", "#F7E3DC")}
                </div>
                {r1Open && !assigned && (
                  <div style={{ background: "#FAF8F1", borderTop: "1px dotted #D8D2C0", padding: "11px 14px", animation: "sk-dash-in 0.35s ease-out both" }}>
                    <div style={{ fontSize: 10.5, color: "#9B9788", marginBottom: 6 }}>Reported 12 min ago · 2 workers nearby. Assign:</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span ref={optRef} style={{
                        fontSize: 10, fontWeight: 600, padding: "5px 12px", borderRadius: 999, cursor: "default",
                        background: hoverOpt ? accent : "#FFFFFF", color: hoverOpt ? "#FFFFFF" : "#26251E",
                        border: "1px solid " + (hoverOpt ? accent : "#E3DDCB"),
                        transform: phase === "clickOpt" ? "scale(0.95)" : "scale(1)", transition: "all 0.2s ease"
                      }}>Dana R. · on shift</span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "5px 12px", borderRadius: 999, background: "#FFFFFF", color: "#26251E", border: "1px solid #E3DDCB" }}>Mike T. · busy</span>
                    </div>
                  </div>
                )}
                {assigned && (
                  <div style={{ background: "#FAF8F1", borderTop: "1px dotted #D8D2C0", padding: "11px 14px", display: "flex", gap: 12, animation: "sk-dash-in 0.35s ease-out both" }}>
                    <span style={{ fontSize: 10.5, color: "#9B9788" }}>Dana notified by text ✓</span>
                    <span style={{ fontSize: 10.5, color: "#9B9788" }}>Escalates in 10 min if unacknowledged</span>
                  </div>
                )}
              </div>
              <div ref={row2Ref} style={{ borderRadius: 8, overflow: "hidden", outline: hover2 ? `2px solid ${accent}` : "2px solid transparent", transition: "outline 0.25s ease", transform: phase === "click2" ? "scale(0.985)" : "scale(1)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 14px", background: "#FAF8F1", animation: r2Done ? "sk-dash-flash 1.2s ease-out both" : "none" }}>
                  <span style={{ fontSize: 12.5, color: "#26251E" }}>Dock door 3 stuck roller</span>
                  {r2Done ? chip("Done ✓", "#26251E", "#E4E9D6") : chip("Assigned", "#8A857A", "#EEE9DB")}
                </div>
                {r2Open && (
                  <div style={{ background: "#FAF8F1", borderTop: "1px dotted #D8D2C0", padding: "11px 14px", display: "flex", gap: 12, animation: "sk-dash-in 0.35s ease-out both" }}>
                    <span style={{ fontSize: 10.5, color: "#9B9788" }}>WO <span style={{ color: "#26251E", fontWeight: 600 }}>#482</span></span>
                    <span style={{ fontSize: 10.5, color: "#9B9788" }}>Assignee <span style={{ color: "#26251E", fontWeight: 600 }}>Mike T.</span></span>
                    <span style={{ fontSize: 10.5, color: "#9B9788" }}>{r2Done ? "Closed by text · 2:14 PM" : "En route · ETA 10 min"}</span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAF8F1", borderRadius: 8, padding: "14px 14px" }}>
                <span style={{ fontSize: 12.5, color: "#26251E" }}>Aisle 7 lighting</span>
                {chip("Assigned", "#8A857A", "#EEE9DB")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <svg style={{
        position: "absolute", left: mousePos.x, top: mousePos.y, width: 20, height: 20, zIndex: 50,
        pointerEvents: "none", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
        opacity: showCursor ? 1 : 0,
        transform: clicking ? "scale(0.85)" : "scale(1)",
        transition: moving ? "left 0.9s cubic-bezier(0.4, 0, 0.2, 1), top 0.9s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s" : "all 0.2s ease"
      }} viewBox="0 0 24 24">
        <path d="M5.5 3.21V20.8l4.86-4.86 3.58 8.06 2.62-1.17-3.58-8.06h6.52L5.5 3.21z" fill="#111827" stroke="white" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

window.DashboardDemo = DashboardDemo;
