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
    { id: 1, text: "JOIN EDS Santa Clara", sender: "worker", delay: 0 },
    { id: 2, text: "Welcome to EDS Manufacturing, Santa Clara! 🎉 You're registered. Ask me anything about your job.", sender: "sidekick", delay: 1500 },
    { id: 3, text: "Where do I park?", sender: "worker", delay: 3500 },
    { id: 4, text: "Employee parking is in Lot B behind the main building. Visitor parking is in front. 🚗", sender: "sidekick", delay: 5000 },
    { id: 5, text: "¿A qué hora es el almuerzo?", sender: "worker", delay: 7500 },
    { id: 6, text: "El almuerzo es a las 11:30 AM para el primer turno y a las 7:30 PM para el segundo turno. Es un descanso de 30 minutos. 🍽️", sender: "sidekick", delay: 9000 },
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
          }, msg.delay - 800);
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
      }, 14000);
      timeouts.push(restartTimeout);
    };

    runAnimation();

    return () => timeouts.forEach(t => clearTimeout(t));
  }, [currentConvo]);

  return (
    <div className="relative mx-auto" style={{ width: "300px" }}>
      <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-10" />
        
        <div className="bg-gray-100 rounded-[2.25rem] overflow-hidden">
          <div className="bg-gray-100 px-6 py-2 flex justify-between items-center text-xs">
            <span className="font-semibold">9:41</span>
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                <div className="w-6 h-3 border border-current rounded-sm relative">
                  <div className="absolute inset-0.5 bg-green-500 rounded-sm" style={{width: "80%"}}/>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-200 px-4 py-3 flex items-center gap-3 border-b border-gray-300">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Sidekick</p>
              <p className="text-xs text-green-600">Online</p>
            </div>
          </div>

          <div className="h-[420px] bg-white p-4 overflow-hidden flex flex-col gap-3">
            {visibleMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "worker" ? "justify-end" : "justify-start"}`}
                style={{animation: "fadeIn 0.3s ease-out"}}
              >
                <div
                  className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                    msg.sender === "worker"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-gray-200 text-gray-900 rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start" style={{animation: "fadeIn 0.3s ease-out"}}>
                <div className="bg-gray-200 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: "0ms"}}/>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: "150ms"}}/>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: "300ms"}}/>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-100 px-4 py-3 border-t border-gray-200">
            <div className="bg-white rounded-full px-4 py-2 flex items-center gap-2 border border-gray-300">
              <span className="text-gray-400 text-sm flex-1">Text Message</span>
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -inset-4 bg-blue-500/20 rounded-[4rem] blur-2xl -z-10" />

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
