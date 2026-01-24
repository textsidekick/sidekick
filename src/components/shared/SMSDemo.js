"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const SMSDemo = () => {
  const [messages, setMessages] = useState([
    { type: 'outgoing', text: "Hello, today is my first day on the job at EDS Manufacturing in Santa Clara" },
    { type: 'incoming', text: "Welcome to EDS Manufacturing, Santa Clara! 🎉 I'm Sidekick, your workplace assistant. Ask me anything!" },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef(null);
  
  const conversationFlow = [
    { type: 'outgoing', text: 'Where do I park?' },
    { type: 'incoming', text: 'Employee parking is in Lot B behind the main building. Visitor parking is in front. 🅿️' },
    { type: 'outgoing', text: '¿A qué hora es el almuerzo?' },
    { type: 'incoming', text: 'El almuerzo es de 12:00 PM a 1:00 PM. La cafetería está en el edificio principal. 🍽️' },
    { type: 'outgoing', isVoice: true, duration: '0:15' },
    { type: 'incoming', text: '🎤 Got it! Safety vests are in the warehouse entrance. Hard hats are required in Zone B.' },
    { type: 'outgoing', text: '안전 장비는 어디서 받나요?' },
    { type: 'incoming', text: '안전 장비는 창고 입구 옆 장비실에서 받으실 수 있습니다. 🦺' },
  ];
  
  const [flowIndex, setFlowIndex] = useState(0);

  // Scroll within the iPhone container only
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (flowIndex >= conversationFlow.length) {
      // Reset after a pause
      const resetTimer = setTimeout(() => {
        setMessages([
          { type: 'outgoing', text: "Hello, today is my first day on the job at EDS Manufacturing in Santa Clara" },
          { type: 'incoming', text: "Welcome to EDS Manufacturing, Santa Clara! 🎉 I'm Sidekick, your workplace assistant. Ask me anything!" },
        ]);
        setFlowIndex(0);
      }, 3000);
      return () => clearTimeout(resetTimer);
    }

    const currentMessage = conversationFlow[flowIndex];
    
    const timer = setTimeout(() => {
      if (currentMessage.type === 'outgoing') {
        setMessages(prev => [...prev, currentMessage]);
        setFlowIndex(prev => prev + 1);
      } else {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, currentMessage]);
          setFlowIndex(prev => prev + 1);
        }, 1200);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [flowIndex]);

  // Static waveform heights
  const waveformHeights = [8, 12, 6, 18, 10, 22, 8, 14, 20, 6, 16, 12, 8, 22, 10, 14, 6, 18, 12, 8, 16, 10, 20, 8, 14];

  // Voice memo component
  const VoiceMemo = ({ duration }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px' }}>
      <div style={{
        width: '28px',
        height: '28px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg style={{ width: '14px', height: '14px', color: 'white', marginLeft: '2px' }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '2px' }}>
        {waveformHeights.map((height, i) => (
          <div 
            key={i} 
            style={{
              width: '2px',
              backgroundColor: 'rgba(255,255,255,0.7)',
              borderRadius: '9999px',
              height: `${height * 0.8}px`,
            }}
          />
        ))}
      </div>
      <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', marginLeft: '4px' }}>{duration}</span>
    </div>
  );

  return (
    <div style={{ position: 'relative', width: '300px', margin: '0 auto', transform: 'scale(0.92)', transformOrigin: 'top center' }}>
      {/* iPhone Frame */}
      <div style={{
        position: 'relative',
        backgroundColor: '#18181b',
        borderRadius: '3rem',
        padding: '10px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}>
        {/* Dynamic Island */}
        <div style={{
          position: 'absolute',
          top: '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '95px',
          height: '28px',
          backgroundColor: '#000',
          borderRadius: '9999px',
          zIndex: 20,
        }} />
        
        {/* Screen */}
        <div style={{
          backgroundColor: '#f2f2f7',
          borderRadius: '2.5rem',
          overflow: 'hidden',
          height: '600px',
          position: 'relative',
        }}>
          {/* Contact Header */}
          <div style={{
            backgroundColor: '#f2f2f7',
            paddingTop: '44px',
            paddingBottom: '6px',
            paddingLeft: '14px',
            paddingRight: '14px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(to bottom right, #60a5fa, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 4px',
              overflow: 'hidden',
            }}>
              <Image 
                src="/images/logo/sidekick-logo-white.png" 
                alt="Sidekick" 
                width={26} 
                height={26}
                style={{objectFit: 'contain'}}
              />
            </div>
            <p style={{ fontWeight: 600, color: '#18181b', fontSize: '14px', margin: 0 }}>Sidekick</p>
            <p style={{ fontSize: '11px', color: '#71717a', margin: 0 }}>+1 (888) 707-4659</p>
          </div>
          
          {/* Messages Area */}
          <div 
            ref={messagesContainerRef}
            style={{
              padding: '0 10px 58px',
              height: '460px',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: msg.type === 'outgoing' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div 
                    style={{
                      maxWidth: '85%',
                      padding: '7px 12px',
                      fontSize: '14px',
                      lineHeight: 1.4,
                      backgroundColor: msg.type === 'outgoing' ? '#007AFF' : '#E9E9EB',
                      color: msg.type === 'outgoing' ? 'white' : '#18181b',
                      borderRadius: '16px',
                      borderBottomRightRadius: msg.type === 'outgoing' ? '4px' : '16px',
                      borderBottomLeftRadius: msg.type === 'incoming' ? '4px' : '16px',
                      animation: idx >= messages.length - 1 ? 'bubble-pop 0.25s ease-out forwards' : 'none',
                      transformOrigin: msg.type === 'outgoing' ? 'bottom right' : 'bottom left',
                    }}
                  >
                    {msg.isVoice ? (
                      <VoiceMemo duration={msg.duration || '0:15'} />
                    ) : (
                      <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div 
                    style={{
                      backgroundColor: '#E9E9EB',
                      padding: '10px 14px',
                      borderRadius: '16px',
                      borderBottomLeftRadius: '4px',
                      animation: 'bubble-pop 0.25s ease-out forwards',
                      transformOrigin: 'bottom left',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div className="typing-dot" style={{ animationDelay: '0ms' }} />
                      <div className="typing-dot" style={{ animationDelay: '150ms' }} />
                      <div className="typing-dot" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* iMessage Input Bar */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#f2f2f7',
            padding: '6px 10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                backgroundColor: '#e4e4e7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ color: '#71717a', fontSize: '18px', lineHeight: 1 }}>+</span>
              </div>
              <div style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: '9999px',
                padding: '6px 14px',
                fontSize: '14px',
                color: '#a1a1aa',
                border: '1px solid #d4d4d8',
              }}>
                iMessage
              </div>
              <div style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg style={{ width: '20px', height: '20px', color: '#a1a1aa' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </div>
            </div>
            {/* Home Indicator */}
            <div style={{
              width: '110px',
              height: '4px',
              backgroundColor: '#18181b',
              borderRadius: '9999px',
              margin: '10px auto 0',
            }} />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .typing-dot {
          width: 7px;
          height: 7px;
          background-color: #a1a1aa;
          border-radius: 50%;
          animation: bounce 1s infinite;
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        @keyframes bubble-pop {
          0% { opacity: 0; transform: scale(0.8) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SMSDemo;
