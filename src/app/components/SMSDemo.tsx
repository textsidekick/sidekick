"use client";

import { useState, useEffect } from "react";

interface Message {
  id: number;
  text: string;
  sender: "worker" | "sidekick";
  delay: number;
}

const conversations: Message[][] = [
  [
    { id: 1, text: "Hello, today is my first day on the job at EDS Manufacturing in Santa Clara", sender: "worker", delay: 0 },
    { id: 2, text: "Welcome to EDS Manufacturing, Santa Clara! 🎉 I'm Sidekick, your workplace assistant. I can answer questions about parking, schedules, safety, and more. How can I help?", sender: "sidekick", delay: 2000 },
    { id: 3, text: "Where do I park?", sender: "worker", delay: 4500 },
    { id: 4, text: "Employee parking is in Lot B behind the main building. Visitor parking is in front. 🚗", sender: "sidekick", delay: 6000 },
    { id: 5, text: "¿A qué hora es el almuerzo?", sender: "worker", delay: 8500 },
    { id: 6, text: "El almuerzo es a las 11:30 AM para el primer turno y a las 7:30 PM para el segundo turno. Es un descanso de 30 minutos. 🍽️", sender: "sidekick", delay: 10000 },
  ],
];

export default function SMSDemo() {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentConvo] = useState(0);

  useEffect(() => {
    const convo = conversations[currentConvo];
    let timeouts: NodeJS.Timeout[] = [];

    const runAnimation = () => {
      setVisibleMessages([]);
      setIsTyping(false);

      convo.forEach((msg) => {
        if (msg.sender === "sidekick") {
          const typingTimeout = setTimeout(() => {
            setIsTyping(true);
          }, msg.delay - 1000);
          timeouts.push(typingTimeout);
        }

        const timeout = setTimeout(() => {
          setIsTyping(false);
          setVisibleMessages(prev => [...prev, msg]);
        }, msg.delay);
        timeouts.push(timeout);
      });

      const restartTimeout = setTimeout(() => {
        runAnimation();
      }, 16000);
      timeouts.push(restartTimeout);
    };

    runAnimation();

    return () => timeouts.forEach(t => clearTimeout(t));
  }, [currentConvo]);

  return (
    <div className="relative mx-auto" style={{ width: "300px" }}>
      {/* iPhone Frame */}
      <div className="relative bg-black rounded-[3rem] p-2 shadow-2xl border-[3px] border-gray-800">
        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full z-20" />
        
        {/* Screen */}
        <div className="bg-white rounded-[2.5rem] overflow-hidden">
          {/* Status Bar */}
          <div className="bg-gray-50 px-8 pt-4 pb-1 flex justify-between items-center text-sm font-semibold">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/>
              </svg>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 22h20V2z"/>
              </svg>
              <div className="w-7 h-3 border-2 border-black rounded-sm relative ml-1">
                <div className="absolute top-0.5 left-0.5 bottom-0.5 bg-black rounded-sm" style={{width: "75%"}}/>
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0.5 h-1.5 bg-black rounded-r"/>
              </div>
            </div>
          </div>

          {/* iMessage Header */}
          <div className="bg-gray-50 px-4 pb-2 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-blue-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                <span className="text-[17px]">12</span>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-0.5">
                  <span className="text-white font-semibold text-sm">S</span>
                </div>
                <p className="font-semibold text-black text-[15px]">Sidekick</p>
              </div>
              <div className="w-8" />
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-[380px] bg-white px-3 py-2 overflow-hidden flex flex-col gap-1.5">
            {/* Date Header */}
            <div className="text-center text-xs text-gray-500 py-1">Today 9:41 AM</div>
            
            {visibleMessages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "worker" ? "justify-end" : "justify-start"}`}
                style={{animation: "slideIn 0.25s ease-out"}}
              >
                <div
                  className={`max-w-[82%] px-3 py-2 text-[15px] leading-tight ${
                    msg.sender === "worker"
                      ? "bg-[#007AFF] text-white rounded-[18px] rounded-br-[4px]"
                      : "bg-[#E9E9EB] text-black rounded-[18px] rounded-bl-[4px]"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start" style={{animation: "slideIn 0.25s ease-out"}}>
                <div className="bg-[#E9E9EB] px-4 py-3 rounded-[18px] rounded-bl-[4px]">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: "0ms", animationDuration: "0.6s"}}/>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: "150ms", animationDuration: "0.6s"}}/>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: "300ms", animationDuration: "0.6s"}}/>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* iMessage Input */}
          <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div className="flex-1 bg-white rounded-full px-4 py-2 border border-gray-300">
                <span className="text-gray-400 text-[15px]">Text Message</span>
              </div>
            </div>
          </div>
          
          {/* Home Indicator */}
          <div className="bg-gray-50 pb-2 pt-1 flex justify-center">
            <div className="w-32 h-1 bg-black rounded-full" />
          </div>
        </div>
      </div>

      {/* Decorative glow */}
      <div className="absolute -inset-8 bg-blue-500/20 rounded-[5rem] blur-3xl -z-10" />

      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
