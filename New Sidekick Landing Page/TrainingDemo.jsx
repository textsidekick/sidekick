/* TrainingDemo v4, pick a module, then assign it: module list -> cursor clicks -> team view with recommendation */
const { useEffect, useState, useRef } = React;

const MODULES = [
  { name: "Chemical handling", meta: "12 min · quiz", target: true },
  { name: "Forklift certification", meta: "3 modules · practical" },
  { name: "Lockout/tagout refresher", meta: "8 min · quiz" },
  { name: "Spill response", meta: "10 min · video" }
];

const MEMBERS = [
  { name: "Mike T.", certs: ["Forklift", "Chemical"], level: 92, note: "1 question this week" },
  { name: "Dana R.", certs: ["Forklift", "LOTO"], level: 84, note: "2 questions this week" },
  { name: "Marcus R.", certs: ["Forklift"], level: 42, note: "8 chemical questions this week", rec: true },
  { name: "Priya S.", certs: ["Chemical"], level: 71, note: "3 questions this week" }
];

function TrainingDemo(props) {
  const accent = props.accent || "#1D6BF3";
  const [view, setView] = useState("modules");
  const [shownMods, setShownMods] = useState(0);
  const [shownMems, setShownMems] = useState(0);
  const [rec, setRec] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle|moveMod|hoverMod|clickMod|moveBtn|hoverBtn|clickBtn|assigned|exit
  const [mousePos, setMousePos] = useState({ x: 300, y: 30 });
  const timersRef = useRef([]);
  const containerRef = useRef(null);
  const modRef = useRef(null);
  const btnRef = useRef(null);

  const moveTo = (ref, fx) => {
    if (ref.current && containerRef.current) {
      const r = ref.current.getBoundingClientRect();
      const c = containerRef.current.getBoundingClientRect();
      setMousePos({ x: r.left - c.left + r.width * (fx || 0.6), y: r.top - c.top + r.height / 2 });
    }
  };

  const run = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    const push = (fn, d) => timersRef.current.push(setTimeout(fn, d));

    setView("modules"); setShownMods(0); setShownMems(0); setRec(false); setPhase("idle");
    if (containerRef.current) {
      const c = containerRef.current.getBoundingClientRect();
      setMousePos({ x: c.width - 36, y: 26 });
    }

    MODULES.forEach((_, i) => push(() => setShownMods(i + 1), 700 + i * 500));
    push(() => { setPhase("moveMod"); moveTo(modRef, 0.75); }, 3100);
    push(() => { setPhase("hoverMod"); moveTo(modRef, 0.75); }, 4100);
    push(() => setPhase("clickMod"), 4500);
    push(() => { setView("assign"); setPhase("mid"); }, 4850);
    MEMBERS.forEach((_, i) => push(() => setShownMems(i + 1), 5200 + i * 550));
    push(() => setRec(true), 7700);
    push(() => { setPhase("moveBtn"); moveTo(btnRef, 0.55); }, 8400);
    push(() => { setPhase("hoverBtn"); moveTo(btnRef, 0.55); }, 9400);
    push(() => setPhase("clickBtn"), 9800);
    push(() => setPhase("assigned"), 10100);
    push(() => setPhase("exit"), 12200);
    push(run, 15500);
  };

  useEffect(() => {
    run();
    return () => timersRef.current.forEach((t) => clearTimeout(t));
  }, []);

  const showCursor = ["moveMod", "hoverMod", "clickMod", "mid", "moveBtn", "hoverBtn", "clickBtn"].includes(phase);
  const moving = ["moveMod", "moveBtn"].includes(phase);
  const clicking = ["clickMod", "clickBtn"].includes(phase);
  const hoverMod = ["hoverMod", "clickMod"].includes(phase);
  const hoverBtn = ["hoverBtn", "clickBtn"].includes(phase);
  const assigned = phase === "assigned" || phase === "exit";

  const navItem = (label, active) => (
    <div style={{
      padding: "7px 10px", borderRadius: 7, fontSize: 11,
      background: active ? "#FFFFFF" : "transparent",
      boxShadow: active ? "0 1px 3px rgba(38,37,30,0.07)" : "none",
      color: active ? "#26251E" : "#8A857A", fontWeight: active ? 600 : 400
    }}>{label}</div>
  );

  return (
    <div ref={containerRef} style={{
      width: "100%", height: "100%", background: "#F1ECDF", borderRadius: 20, padding: 28,
      boxSizing: "border-box", overflow: "hidden", position: "relative",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
    }}>
      <style>{`
        @keyframes sk-tr-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sk-tr-pop { 0% { opacity: 0; transform: scale(0.6); } 70% { transform: scale(1.08); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
      <div style={{ background: "#FDFCF9", borderRadius: 14, overflow: "hidden", boxShadow: "0 10px 34px rgba(38,37,30,0.1), 0 2px 8px rgba(38,37,30,0.05)", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
        
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          
          <div style={{ flex: 1, padding: "13px 14px", minWidth: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: "#9B9788" }}>Training /</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#26251E" }}>{view === "modules" ? "Modules" : "Assign: Chemical handling"}</span>
            </div>

            {view === "modules" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, justifyContent: "center" }}>
                <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B9788", marginBottom: 1 }}>Select modules</div>
                {MODULES.map((m, i) => (
                  <div key={i} ref={m.target ? modRef : null} style={{
                    display: "flex", alignItems: "center", gap: 10, background: "#FAF8F1", borderRadius: 9,
                    padding: "16px 14px",
                    opacity: shownMods > i ? 1 : 0, transform: shownMods > i ? "translateY(0)" : "translateY(-6px)",
                    transition: "opacity 0.35s ease, transform 0.35s ease, outline 0.25s ease",
                    outline: m.target && hoverMod ? `2px solid ${accent}` : "2px solid transparent"
                  }}>
                    <span style={{ width: 30, height: 30, borderRadius: 8, background: accent, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#26251E" }}>{m.name}</div>
                      <div style={{ fontSize: 9.5, color: "#9B9788", marginTop: 1 }}>{m.meta}</div>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B0AA99" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1, justifyContent: "center" }}>
                <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B9788", marginBottom: 1 }}>Team members</div>
                {MEMBERS.map((m, i) => (
                  <div key={i} style={{
                    background: "#FAF8F1", borderRadius: 8, padding: "11px 12px",
                    opacity: shownMems > i ? 1 : 0, transform: shownMems > i ? "translateY(0)" : "translateY(-6px)",
                    outline: m.rec && hoverBtn ? `2px solid ${accent}` : "2px solid transparent", transition: "opacity 0.35s ease, transform 0.35s ease, outline 0.25s ease"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: "#26251E", width: 64, flex: "none" }}>{m.name}</span>
                      <span style={{ display: "flex", gap: 4, flex: "none" }}>
                        {m.certs.map((c, j) => (
                          <span key={j} style={{ fontSize: 8.5, fontWeight: 600, color: "#26251E", background: "#E4E9D6", borderRadius: 999, padding: "2px 7px" }}>{c} ✓</span>
                        ))}
                      </span>
                      <span style={{ flex: 1 }} />
                      {m.rec ? (
                        assigned ? (
                          <span style={{ fontSize: 9.5, fontWeight: 600, color: "#5A6B3B", animation: "sk-tr-pop 0.35s ease-out both" }}>Sent by text ✓</span>
                        ) : (
                          <span ref={btnRef} style={{
                            fontSize: 9.5, fontWeight: 600, padding: "4px 11px", borderRadius: 999, cursor: "default", whiteSpace: "nowrap",
                            background: hoverBtn ? accent : "#FFFFFF",
                            color: hoverBtn ? "#FFFFFF" : accent,
                            border: `1.5px solid ${accent}`,
                            transform: phase === "clickBtn" ? "scale(0.95)" : "scale(1)", transition: "all 0.2s ease"
                          }}>Assign</span>
                        )
                      ) : (
                        <span style={{ fontSize: 9.5, color: "#B0AA99" }}>Covered</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
                      <div style={{ flex: "none", width: 90, height: 4, background: "#EDE7D8", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: m.level + "%", height: "100%", background: m.level < 50 ? "#D9A441" : "#5A6B3B", borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 9, color: "#9B9788" }}>knowledge {m.level}%</span>
                      <span style={{ fontSize: 9, color: m.rec ? "#C24E2E" : "#B0AA99", marginLeft: "auto" }}>{m.note}</span>
                    </div>
                    {m.rec && rec && !assigned && (
                      <div style={{ marginTop: 7, fontSize: 9.5, color: accent, fontWeight: 600, animation: "sk-tr-pop 0.35s ease-out both" }}>
                        ★ Recommended: low chemical coverage, asking about it often
                      </div>
                    )}
                    {m.rec && assigned && (
                      <div style={{ marginTop: 7, fontSize: 9.5, color: "#9B9788", animation: "sk-tr-in 0.3s ease-out both" }}>
                        Module delivered over SMS, quiz due Friday
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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

window.TrainingDemo = TrainingDemo;
