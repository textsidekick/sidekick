"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: number;
  text: string;
  sender: "worker" | "sidekick";
  delay: number;
}

const conversations: Message[][] = [
  [
    { id: 1, text: "Hello, today is my first day on the job at EDS Manufacturing in Santa Clara", sender: "worker", delay: 0 },
    { id: 2, text: "Welcome to EDS Manufacturing, Santa Clara! 🎉 I'm Sidekick, your workplace assistant. Ask me anything!", sender: "sidekick", delay: 2000 },
    { id: 3, text: "Where do I park?", sender: "worker", delay: 4500 },
    { id: 4, text: "Employee parking is in Lot B behind the main building. Visitor parking is in front. 🅿️", sender: "sidekick", delay: 6000 },
    { id: 5, text: "¿A qué hora es el almuerzo?", sender: "worker", delay: 8500 },
    { id: 6, text: "El almuerzo es a las 11:30 AM para el primer turno. Es un descanso de 30 minutos. 🍽️", sender: "sidekick", delay: 10000 },
    { id: 7, text: "안전 장비는 어디서 받나요?", sender: "worker", delay: 13000 },
    { id: 8, text: "안전 장비는 도구 보관소에서 받을 수 있습니다. 노란색 구역에서는 안전모가 필수입니다. 🦺", sender: "sidekick", delay: 15000 },
    { id: 9, text: "When is payday?", sender: "worker", delay: 18000 },
    { id: 10, text: "Payday is every other Friday. Direct deposit hits by 8am. Paper checks available at HR after 10am. 💰", sender: "sidekick", delay: 20000 },
  ],
];

export default function SMSDemo() {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentConvo] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages, isTyping]);

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
      }, 25000);
      timeouts.push(restartTimeout);
    };

    runAnimation();

    return () => timeouts.forEach(t => clearTimeout(t));
  }, [currentConvo]);

  return (
    <div className="relative mx-auto" style={{ width: "340px" }}>
      {/* iPhone Frame */}
      <div className="relative bg-black rounded-[3rem] p-2 shadow-2xl border-[3px] border-gray-800">
        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20" />
        
        {/* Screen */}
        <div className="bg-black rounded-[2.5rem] overflow-hidden pt-8">
          {/* iMessage Header */}
          <div className="px-4 pb-3 pt-2 border-b border-gray-800">
            <div className="text-center">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-0.5">
                <span className="text-white font-semibold text-sm">S</span>
              </div>
              <p className="font-semibold text-white text-[15px]">Sidekick</p>
              <p className="text-[11px] text-gray-400">+1 (888) 707-4659</p>
            </div>
          </div>

          {/* Messages Area - Scrollable */}
          <div 
            className="h-[460px] px-3 py-3 overflow-y-auto flex flex-col gap-2 scroll-smooth messages-container"
          >
            {visibleMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "worker" ? "justify-end" : "justify-start"} msg-animate`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 text-[15px] leading-snug text-left ${
                    msg.sender === "worker"
                      ? "bg-[#34C759] text-white rounded-[18px] rounded-br-[4px]"
                      : "bg-[#3A3A3C] text-white rounded-[18px] rounded-bl-[4px]"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start msg-animate">
                <div className="bg-[#3A3A3C] px-4 py-3 rounded-[18px] rounded-bl-[4px]">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0ms", animationDuration: "0.6s"}}/>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "150ms", animationDuration: "0.6s"}}/>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "300ms", animationDuration: "0.6s"}}/>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* iMessage Input */}
          <div className="px-3 py-2 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div className="flex-1 bg-[#1C1C1E] rounded-full px-4 py-2 border border-gray-700 flex items-center justify-between">
                <span className="text-gray-500 text-[15px]">Text Message</span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Home Indicator */}
          <div className="pb-2 pt-1 flex justify-center">
            <div className="w-32 h-1 bg-white rounded-full" />
          </div>
        </div>
      </div>

      {/* Decorative glow */}
      <div className="absolute -inset-8 bg-green-500/10 rounded-[5rem] blur-3xl -z-10" />

      <style jsx>{`
        .messages-container::-webkit-scrollbar {
          display: none;
        }
        .messages-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .msg-animate {
          animation: slideIn 0.25s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
