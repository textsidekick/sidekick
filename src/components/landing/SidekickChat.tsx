"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  id: number;
  text?: string;
  sender: "user" | "sidekick";
  isVoice?: boolean;
};

const ALL_MESSAGES: Msg[] = [
  { id: 0, text: "Conveyor 3 making a grinding noise", sender: "user" },
  { id: 1, text: "Logged. Conveyor 3 — likely bearing wear. Priority: HIGH. Work order #4521 created, assigned to Mike T. Parts: 6205-2RS bearing (2 in stock).", sender: "sidekick" },
  { id: 2, text: "Wet floor near loading dock, someone could slip", sender: "user" },
  { id: 3, text: "Safety hazard flagged. Priority: CRITICAL. Alert sent to shift supervisor. Work order #4522 created for immediate cleanup. Area marked for caution signage.", sender: "sidekick" },
];

const WAVEFORM = [4,3,5,4,6,5,4,5,7,9,12,10,14,12,16,14,12,14,10,12,14,12,10,8,10,8,6,7,6,5,6,5,4,5,4,3,4,3,4];

export default function SidekickChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [recording, setRecording] = useState<{ time: string; progress: number } | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, showTypingIndicator, recording, typingText, isTyping]);

  useEffect(() => {
    const typeText = (text: string, duration: number) => {
      setIsTyping(true);
      let idx = 0;
      const interval = window.setInterval(() => {
        if (idx <= text.length) {
          setTypingText(text.slice(0, idx));
          idx++;
        } else {
          window.clearInterval(interval);
        }
      }, duration / text.length);
      const t = window.setTimeout(() => {
        setIsTyping(false);
        setTypingText("");
      }, duration + 400);
      timeoutsRef.current.push(t, interval as unknown as number);
    };

    const showRecording = (duration: number) => {
      setRecording({ time: "0:00", progress: 0 });
      let seconds = 0;
      let progress = 0;
      const timeInterval = window.setInterval(() => {
        seconds++;
        setRecording((p) => (p ? { ...p, time: `0:0${seconds}` } : null));
      }, 1000);
      const progressInterval = window.setInterval(() => {
        progress++;
        setRecording((p) => (p ? { ...p, progress } : null));
      }, duration / WAVEFORM.length);
      const t1 = window.setTimeout(() => {
        window.clearInterval(timeInterval);
        window.clearInterval(progressInterval);
        setRecording((p) => (p ? { ...p, time: "0:04" } : null));
      }, duration - 100);
      const t2 = window.setTimeout(() => setRecording(null), duration + 300);
      timeoutsRef.current.push(t1, t2, timeInterval as unknown as number, progressInterval as unknown as number);
    };

    const run = () => {
      setMessages([]);
      setShowTypingIndicator(false);
      setTypingText("");
      setIsTyping(false);
      setRecording(null);

      let d = 1000;
      const actions: Array<{ type: string; delay: number; text?: string; duration?: number; msg?: Msg }> = [];
      const pushType = (text: string, dur: number) => {
        actions.push({ type: "type", text, delay: d, duration: dur });
        d += dur + 600;
      };
      const pushSend = (msg: Msg) => {
        actions.push({ type: "send", msg, delay: d });
        d += 700;
      };
      const pushThink = (dur = 1800) => {
        actions.push({ type: "thinking", delay: d });
        d += dur;
      };
      const pushReply = (msg: Msg, thinkDur = 1800) => {
        pushThink(thinkDur);
        actions.push({ type: "send", msg, delay: d });
        d += 1400;
      };
      const pushRecord = (dur: number) => {
        actions.push({ type: "record", delay: d, duration: dur });
        d += dur + 500;
      };
      const pushVoice = (msg: Msg) => {
        actions.push({ type: "voice", msg, delay: d });
        d += 1200;
      };

      pushType(ALL_MESSAGES[0].text!, 2000);
      pushSend(ALL_MESSAGES[0]);
      pushReply(ALL_MESSAGES[1], 2800);
      d += 1200;

      pushType(ALL_MESSAGES[2].text!, 1800);
      pushSend(ALL_MESSAGES[2]);
      pushReply(ALL_MESSAGES[3], 2400);

      const totalDuration = d + 3500;

      actions.forEach((a) => {
        const t = window.setTimeout(() => {
          if (a.type === "type") typeText(a.text!, a.duration!);
          else if (a.type === "send") {
            setShowTypingIndicator(false);
            setMessages((prev) => [...prev, a.msg!]);
          } else if (a.type === "thinking") setShowTypingIndicator(true);
          else if (a.type === "record") showRecording(a.duration!);
          else if (a.type === "voice") setMessages((prev) => [...prev, a.msg!]);
        }, a.delay);
        timeoutsRef.current.push(t);
      });

      const loopT = window.setTimeout(run, totalDuration);
      timeoutsRef.current.push(loopT);
    };

    run();
    return () => {
      timeoutsRef.current.forEach((t) => window.clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, []);

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="flex items-center justify-center px-4 py-3 border-b border-[#E5E5EA]/50 bg-[#F9F9F9] flex-shrink-0">
        <span className="text-[15px] font-semibold text-black">Text Sidekick</span>
      </div>
      <div ref={messagesRef} className="sk-chat-messages flex-1 overflow-y-auto px-3.5 py-3.5 flex flex-col gap-1.5 justify-end">
        {messages.map((msg, i) => (
          <div key={`${msg.id}-${i}`} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
            {msg.isVoice ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#007AFF] rounded-[18px_18px_4px_18px] min-w-[170px]">
                <div className="w-[22px] h-[22px] rounded-full bg-white/95 flex items-center justify-center">
                  <svg width="9" height="11" viewBox="0 0 10 12" fill="#007AFF"><path d="M1 1L9 6L1 11V1Z" /></svg>
                </div>
                <div className="flex items-center gap-[1.5px] flex-1 h-4">
                  {WAVEFORM.map((h, j) => (
                    <div key={j} style={{ width: 2, height: h, background: "rgba(255,255,255,0.5)", borderRadius: 1 }} />
                  ))}
                </div>
                <span className="text-white/95 text-[11px] font-medium">0:04</span>
              </div>
            ) : (
              <div className={`max-w-[240px] px-[13px] py-[9px] text-sm leading-[1.4] ${msg.sender === "user" ? "bg-[#007AFF] text-white rounded-[18px_18px_4px_18px]" : "bg-[#E9E9EB] text-black rounded-[18px_18px_18px_4px]"}`}>
                {msg.text}
              </div>
            )}
          </div>
        ))}
        {showTypingIndicator && (
          <div className="flex flex-col items-start">
            <div className="px-[13px] py-[9px] rounded-[18px_18px_18px_4px] bg-[#E9E9EB] inline-flex gap-[3px] items-center">
              {[0, 0.2, 0.4].map((delay, i) => (
                <div
                  key={i}
                  style={{ width: 6, height: 6, borderRadius: "50%", background: "#8E8E93", animation: `sk-typing-bounce 1.4s ease-in-out ${delay}s infinite` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="px-3 pt-2.5 pb-3 border-t border-[#E5E5EA]/50 bg-[#F9F9F9] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#E5E5EA] flex items-center justify-center text-[#8E8E93] text-lg flex-shrink-0">+</div>
          {recording ? (
            <>
              <div className="bg-[#E5E5EA] rounded-[18px] px-[13px] min-h-[30px] flex items-center gap-2 max-w-[170px]">
                <div className="flex items-center gap-[1.5px] w-[90px] h-5 overflow-hidden">
                  {WAVEFORM.slice(0, recording.progress).map((h, i) => (
                    <div key={i} style={{ width: 2, height: h, background: "#FF3B30", borderRadius: 1 }} />
                  ))}
                </div>
                <span className="text-[#FF3B30] text-xs font-semibold min-w-[28px] text-right">{recording.time}</span>
                <div className="w-[22px] h-[22px] rounded-full bg-[#FF3B30] flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-white rounded-[1.5px]" />
                </div>
              </div>
              <div className="flex-1" />
            </>
          ) : (
            <div className={`flex-1 bg-white rounded-[18px] px-[13px] py-2 text-[13px] border border-[#E5E5EA] min-h-[30px] flex items-center ${isTyping ? "text-black" : "text-[#8E8E93]"}`}>
              {isTyping ? (
                <>
                  {typingText}
                  <span style={{ display: "inline-block", width: 2, height: 14, background: "#007AFF", marginLeft: 1, animation: "sk-blink 1s step-end infinite" }} />
                </>
              ) : (
                "Text Message"
              )}
            </div>
          )}
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="#8E8E93" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="#8E8E93" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
