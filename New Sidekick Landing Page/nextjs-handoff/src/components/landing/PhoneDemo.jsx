"use client";

/* iMessage-style hero demo: scripted worker <-> Sidekick SMS conversation with
   typing, voice-memo recording, and auto-scroll. Loops forever. */
import { useEffect, useRef, useState } from "react";

const ALL = [
  { id: 0, text: "Conveyor 3 making a grinding noise", sender: "user" },
  { id: 1, text: "Logged. Conveyor 3: likely bearing wear. Priority: HIGH. Work order #4521 created, assigned to Mike T. Parts: 6205-2RS bearing (2 in stock).", sender: "sidekick" },
  { id: 2, text: "Where's the 6205 bearing?", sender: "user" },
  { id: 3, text: "6205-2RS bearing is in Parts Cage B, Shelf 3. 2 in stock. Need help with anything else?", sender: "sidekick" },
  { id: 4, isVoice: true, sender: "user" },
  { id: 5, text: "Second shift starts at 3:00 PM. Shift lead today is Carlos R. You're in Warehouse B.", sender: "sidekick" },
  { id: 6, text: "¿Dónde recojo mi uniforme?", sender: "user" },
  { id: 7, text: "Recoge tu uniforme en Recursos Humanos, Edificio A, sala 102. Abierto de 7 AM a 4 PM.", sender: "sidekick" },
  { id: 8, text: "Wet floor near dock 2, slip hazard", sender: "user" },
  { id: 9, text: "Safety hazard flagged. Priority: CRITICAL. Alert sent to shift supervisor. Cleanup work order #4522 created for immediate response.", sender: "sidekick" },
];
const WAVE = [4, 3, 5, 4, 6, 5, 4, 5, 7, 9, 12, 10, 14, 12, 16, 14, 12, 14, 10, 12, 14, 12, 10, 8, 10, 8, 6, 7, 6, 5, 6, 5, 4, 5, 4, 3, 4, 3, 4];

export default function PhoneDemo() {
  const [msgs, setMsgs] = useState([]);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [rec, setRec] = useState(null); // { time, progress }
  const chatRef = useRef(null);
  const timersRef = useRef([]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  });

  useEffect(() => {
    const push = (t) => timersRef.current.push(t);

    const typeText = (text, duration) => {
      setIsTyping(true);
      let idx = 0;
      const interval = setInterval(() => {
        if (idx <= text.length) { setTypingText(text.slice(0, idx)); idx++; }
        else clearInterval(interval);
      }, duration / text.length);
      push(interval);
      push(setTimeout(() => { setIsTyping(false); setTypingText(""); }, duration + 400));
    };

    const showRecording = (duration) => {
      setRec({ time: "0:00", progress: 0 });
      let seconds = 0;
      const timeInterval = setInterval(() => {
        seconds++;
        setRec((r) => (r ? { ...r, time: "0:0" + seconds } : r));
      }, 1000);
      const progressInterval = setInterval(() => {
        setRec((r) => (r ? { ...r, progress: r.progress + 1 } : r));
      }, duration / WAVE.length);
      push(timeInterval);
      push(progressInterval);
      push(setTimeout(() => {
        clearInterval(timeInterval);
        clearInterval(progressInterval);
        setRec((r) => (r ? { ...r, time: "0:04" } : r));
      }, duration - 100));
      push(setTimeout(() => setRec(null), duration + 300));
    };

    const run = () => {
      timersRef.current.forEach((t) => { clearTimeout(t); clearInterval(t); });
      timersRef.current = [];
      setMsgs([]); setTypingText(""); setIsTyping(false); setThinking(false); setRec(null);

      let d = 1000;
      const actions = [];
      const pushType = (text, dur) => { actions.push({ type: "type", text, delay: d, duration: dur }); d += dur + 600; };
      const pushSend = (msg) => { actions.push({ type: "send", msg, delay: d }); d += 700; };
      const pushReply = (msg, thinkDur) => {
        actions.push({ type: "thinking", delay: d }); d += thinkDur || 1800;
        actions.push({ type: "send", msg, delay: d }); d += 1400;
      };
      const pushRecord = (dur) => { actions.push({ type: "record", delay: d, duration: dur }); d += dur + 500; };
      const pushVoice = (msg) => { actions.push({ type: "voice", msg, delay: d }); d += 1200; };

      pushType(ALL[0].text, 1800); pushSend(ALL[0]); pushReply(ALL[1], 2400); d += 800;
      pushType(ALL[2].text, 1400); pushSend(ALL[2]); pushReply(ALL[3], 1800); d += 1000;
      pushRecord(4500); pushVoice(ALL[4]); pushReply(ALL[5], 2000); d += 800;
      pushType(ALL[6].text, 1600); pushSend(ALL[6]); pushReply(ALL[7], 1800); d += 800;
      pushType(ALL[8].text, 1600); pushSend(ALL[8]); pushReply(ALL[9], 2200);

      actions.forEach((a) => {
        push(setTimeout(() => {
          if (a.type === "type") typeText(a.text, a.duration);
          else if (a.type === "send") { setThinking(false); setMsgs((m) => m.concat([a.msg])); }
          else if (a.type === "thinking") setThinking(true);
          else if (a.type === "record") showRecording(a.duration);
          else if (a.type === "voice") setMsgs((m) => m.concat([a.msg]));
        }, a.delay));
      });

      push(setTimeout(run, d + 3500));
    };

    run();
    return () => timersRef.current.forEach((t) => { clearTimeout(t); clearInterval(t); });
  }, []);

  const sf = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";

  return (
    <div style={{ background: "#1C1A16", borderRadius: 40, padding: 8, boxShadow: "0 30px 80px -20px rgba(28,26,22,0.55), 0 10px 30px -10px rgba(28,26,22,0.4)" }}>
      <div style={{ position: "relative", background: "#FAFAF7", borderRadius: 32, overflow: "hidden", height: 528 }}>
        {/* status bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 37, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", fontSize: 11, fontWeight: 600, color: "#000", zIndex: 10, fontFamily: sf }}>
          <span>9:41</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
              {[2.5, 4, 5.5, 7].map((h, i) => (
                <span key={i} style={{ width: 2.5, height: h, background: "#000", borderRadius: 0.5 }} />
              ))}
            </span>
            <svg width="11" height="8" viewBox="0 0 16 12" fill="#000" style={{ display: "block" }}><path d="M8 0C5.06 0 2.34 1.04 0.21 2.78a0.5 0.5 0 0 0 -0.04 0.74l1.06 1.06a0.5 0.5 0 0 0 0.7 0.02A9 9 0 0 1 8 2a9 9 0 0 1 6.07 2.6 0.5 0.5 0 0 0 0.7 -0.02l1.06 -1.06a0.5 0.5 0 0 0 -0.04 -0.74A11.97 11.97 0 0 0 8 0zM8 4.5c-2 0-3.83 0.74-5.23 1.96a0.5 0.5 0 0 0 -0.03 0.74l1.05 1.05a0.5 0.5 0 0 0 0.7 0.03A6 6 0 0 1 8 6.5a6 6 0 0 1 3.51 1.78 0.5 0.5 0 0 0 0.7 -0.03l1.05 -1.05a0.5 0.5 0 0 0 -0.03 -0.74A7.97 7.97 0 0 0 8 4.5zM8 9a3 3 0 0 0 -2.12 0.88 0.5 0.5 0 0 0 -0.02 0.7l1.79 1.93a0.5 0.5 0 0 0 0.7 0l1.79 -1.93a0.5 0.5 0 0 0 -0.02 -0.7A3 3 0 0 0 8 9z" /></svg>
            <span style={{ position: "relative", display: "inline-block", width: 20, height: 10, border: "1px solid rgba(0,0,0,0.4)", borderRadius: 3, padding: 1 }}>
              <span style={{ display: "block", width: "82%", height: "100%", background: "#000", borderRadius: 1.5 }} />
              <span style={{ position: "absolute", left: "100%", top: "30%", width: 1.5, height: "40%", background: "rgba(0,0,0,0.4)", borderRadius: "0 1px 1px 0" }} />
            </span>
          </span>
        </div>
        {/* dynamic island */}
        <div style={{ position: "absolute", top: 9, left: "50%", transform: "translateX(-50%)", width: 86, height: 22, borderRadius: 16, background: "#000", zIndex: 20 }} />
        {/* messages app */}
        <div style={{ position: "absolute", top: 42, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", background: "#FFF", fontFamily: sf }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "9px 12px", borderBottom: "1px solid rgba(229,229,234,0.5)", background: "#F9F9F9", flex: "none" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#000" }}>Text Sidekick</span>
          </div>
          <div ref={chatRef} className="sk-chat-scroll" style={{ flex: 1, overflowY: "auto", padding: 11, display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ marginTop: "auto" }} />
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.sender === "user" ? "flex-end" : "flex-start", animation: "sk-msg-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both" }}>
                {m.isVoice ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "#007AFF", borderRadius: "18px 18px 4px 18px", minWidth: 140 }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                      <svg width="7" height="9" viewBox="0 0 10 12" fill="#007AFF"><path d="M1 1L9 6L1 11V1Z" /></svg>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 1, flex: 1, height: 14, overflow: "hidden" }}>
                      {WAVE.map((h, j) => (
                        <span key={j} style={{ width: 1.5, height: Math.round(h * 0.85), background: "rgba(255,255,255,0.5)", borderRadius: 1, flex: "none" }} />
                      ))}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.95)", fontSize: 9.5, fontWeight: 500 }}>0:04</span>
                  </div>
                ) : (
                  <div style={{ display: "inline-block", maxWidth: 190, padding: "7px 10px", fontSize: 11.5, lineHeight: 1.4, background: m.sender === "user" ? "#007AFF" : "#E9E9EB", color: m.sender === "user" ? "#FFF" : "#000", borderRadius: m.sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px" }}>
                    {m.text}
                  </div>
                )}
              </div>
            ))}
            {thinking && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", animation: "sk-msg-in 0.2s ease-out both" }}>
                <span style={{ padding: "7px 10px", borderRadius: "18px 18px 18px 4px", background: "#E9E9EB", display: "inline-flex", gap: 3, alignItems: "center" }}>
                  {[0, 0.2, 0.4].map((delay, j) => (
                    <span key={j} style={{ width: 5, height: 5, borderRadius: "50%", background: "#8E8E93", animation: `sk-typing-bounce 1.4s ease-in-out ${delay}s infinite` }} />
                  ))}
                </span>
              </div>
            )}
          </div>
          {/* composer */}
          <div style={{ padding: "8px 10px 10px", borderTop: "1px solid rgba(229,229,234,0.5)", background: "#F9F9F9", flex: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#E5E5EA", display: "flex", alignItems: "center", justifyContent: "center", color: "#8E8E93", fontSize: 14, flex: "none" }}>+</span>
              {rec ? (
                <div style={{ display: "flex", background: "#E5E5EA", borderRadius: 15, padding: "4px 10px", minHeight: 24, alignItems: "center", gap: 6, maxWidth: 150 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 1, width: 74, height: 16, overflow: "hidden" }}>
                    {WAVE.slice(0, rec.progress).map((h, j) => (
                      <span key={j} style={{ width: 1.5, height: Math.round(h * 0.85), background: "#FF3B30", borderRadius: 1, flex: "none" }} />
                    ))}
                  </span>
                  <span style={{ color: "#FF3B30", fontSize: 10, fontWeight: 600, minWidth: 24, textAlign: "right" }}>{rec.time}</span>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#FF3B30", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                    <span style={{ width: 6, height: 6, background: "#FFF", borderRadius: 1.5 }} />
                  </span>
                </div>
              ) : (
                <div style={{ display: "flex", flex: 1, background: "#FFF", borderRadius: 15, padding: "5px 10px", fontSize: 11, border: "1px solid #E5E5EA", minHeight: 24, alignItems: "center", color: isTyping ? "#000" : "#8E8E93" }}>
                  <span>{isTyping ? typingText : "Text Message"}</span>
                  {isTyping && <span style={{ display: "inline-block", width: 1.5, height: 12, background: "#007AFF", marginLeft: 1, animation: "sk-blink 1s step-end infinite" }} />}
                </div>
              )}
              <svg width="15" height="15" viewBox="0 0 24 24" style={{ flex: "none" }}>
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="#8E8E93" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="#8E8E93" />
              </svg>
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", width: 102, height: 3, borderRadius: 2, background: "#000", opacity: 0.9, zIndex: 20 }} />
      </div>
    </div>
  );
}
