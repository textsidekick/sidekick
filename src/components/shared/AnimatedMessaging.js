"use client";
import { useState, useEffect } from 'react';

const AnimatedMessaging = () => {
  const [particles, setParticles] = useState([]);

  // People positioned in a circle around Sidekick
  const people = [
    { id: 1, type: 'worker', angle: 0, label: 'Worker' },
    { id: 2, type: 'manager', angle: 45, label: 'Manager' },
    { id: 3, type: 'worker', angle: 90, label: 'Worker' },
    { id: 4, type: 'worker', angle: 135, label: 'Worker' },
    { id: 5, type: 'manager', angle: 180, label: 'Manager' },
    { id: 6, type: 'worker', angle: 225, label: 'Worker' },
    { id: 7, type: 'worker', angle: 270, label: 'Worker' },
    { id: 8, type: 'manager', angle: 315, label: 'Manager' },
  ];

  const messageTypes = [
    { type: 'question', icon: '?', color: '#007AFF' },
    { type: 'voice', icon: '●', color: '#34C759' },
    { type: 'file', icon: '▢', color: '#FF9500' },
    { type: 'answer', icon: '✓', color: '#5856D6' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const person = people[Math.floor(Math.random() * people.length)];
      const isIncoming = Math.random() > 0.3; // 70% incoming, 30% outgoing (answers)
      const msgType = isIncoming 
        ? messageTypes[Math.floor(Math.random() * 3)] // question, voice, or file
        : messageTypes[3]; // answer

      const newParticle = {
        id: Date.now() + Math.random(),
        angle: person.angle,
        isIncoming,
        type: msgType.type,
        icon: msgType.icon,
        color: msgType.color,
      };

      setParticles(prev => [...prev.slice(-12), newParticle]);
    }, 600);

    return () => clearInterval(interval);
  }, []);

  const getPosition = (angle, radius) => {
    const radian = (angle - 90) * (Math.PI / 180);
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius,
    };
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '500px',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Connection lines */}
      <svg style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
      }}>
        {people.map((person) => {
          const pos = getPosition(person.angle, 180);
          return (
            <line
              key={person.id}
              x1="50%"
              y1="50%"
              x2={`calc(50% + ${pos.x}px)`}
              y2={`calc(50% + ${pos.y}px)`}
              stroke="#1A161520"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          );
        })}
      </svg>

      {/* Center Sidekick Hub */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 20,
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, #1A1615 0%, #3a3835 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 60px rgba(26, 22, 21, 0.3)',
          animation: 'pulse 3s ease-in-out infinite',
          position: 'relative',
        }}>
          <span style={{
            color: '#ffffff',
            fontSize: '28px',
            fontWeight: '800',
            fontFamily: 'system-ui, sans-serif',
          }}>S</span>
          {/* Outer ring */}
          <div style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            border: '2px solid #1A161530',
            borderRadius: '50%',
            animation: 'spin 20s linear infinite',
          }} />
          <div style={{
            position: 'absolute',
            width: '140px',
            height: '140px',
            border: '1px solid #1A161515',
            borderRadius: '50%',
            animation: 'spin 30s linear infinite reverse',
          }} />
        </div>
      </div>

      {/* People around the circle */}
      {people.map((person) => {
        const pos = getPosition(person.angle, 180);
        const isManager = person.type === 'manager';
        
        return (
          <div
            key={person.id}
            style={{
              position: 'absolute',
              left: `calc(50% + ${pos.x}px)`,
              top: `calc(50% + ${pos.y}px)`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              border: isManager ? '2px solid #007AFF' : '2px solid #34C759',
            }}>
              {/* Person icon */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill={isManager ? '#007AFF' : '#34C759'} />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke={isManager ? '#007AFF' : '#34C759'} strokeWidth="2" fill="none" />
                {isManager && (
                  <rect x="9" y="2" width="6" height="3" rx="1" fill="#007AFF" />
                )}
              </svg>
            </div>
            <div style={{
              textAlign: 'center',
              marginTop: '6px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#1A1615aa',
            }}>
              {person.label}
            </div>
          </div>
        );
      })}

      {/* Animated particles (messages) */}
      {particles.map((particle) => {
        const startPos = particle.isIncoming ? getPosition(particle.angle, 180) : { x: 0, y: 0 };
        const endPos = particle.isIncoming ? { x: 0, y: 0 } : getPosition(particle.angle, 180);
        
        return (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: '24px',
              height: '24px',
              backgroundColor: particle.color,
              borderRadius: particle.type === 'file' ? '6px' : '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '700',
              boxShadow: `0 4px 15px ${particle.color}50`,
              animation: particle.isIncoming 
                ? `moveIn-${particle.angle} 1.5s ease-out forwards`
                : `moveOut-${particle.angle} 1.5s ease-out forwards`,
              zIndex: 15,
            }}
          >
            {particle.type === 'voice' ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0014 0M12 18v4M8 22h8" stroke="white" strokeWidth="2" fill="none" />
              </svg>
            ) : particle.type === 'file' ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M4 4h10l6 6v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
              </svg>
            ) : particle.type === 'answer' ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M5 12l5 5L20 7" />
              </svg>
            ) : (
              '?'
            )}
          </div>
        );
      })}

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '24px',
        backgroundColor: '#ffffff',
        padding: '12px 24px',
        borderRadius: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#007AFF', borderRadius: '50%' }} />
          <span style={{ fontSize: '12px', color: '#1A1615aa' }}>Questions</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#34C759', borderRadius: '50%' }} />
          <span style={{ fontSize: '12px', color: '#1A1615aa' }}>Voice</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#FF9500', borderRadius: '6px' }} />
          <span style={{ fontSize: '12px', color: '#1A1615aa' }}>Files</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#5856D6', borderRadius: '50%' }} />
          <span style={{ fontSize: '12px', color: '#1A1615aa' }}>Answers</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        ${people.map(p => `
          @keyframes moveIn-${p.angle} {
            0% { 
              transform: translate(calc(-50% + ${getPosition(p.angle, 180).x}px), calc(-50% + ${getPosition(p.angle, 180).y}px));
              opacity: 1;
            }
            100% { 
              transform: translate(-50%, -50%);
              opacity: 0;
            }
          }
          @keyframes moveOut-${p.angle} {
            0% { 
              transform: translate(-50%, -50%);
              opacity: 1;
            }
            100% { 
              transform: translate(calc(-50% + ${getPosition(p.angle, 180).x}px), calc(-50% + ${getPosition(p.angle, 180).y}px));
              opacity: 0;
            }
          }
        `).join('')}
      `}</style>
    </div>
  );
};

export default AnimatedMessaging;
