// MockupConversation.jsx
// Size: 870x550 - Worker SMS conversation view

export default function MockupConversation() {
  const colors = {
    bg: '#faf9f7',
    card: '#ffffff',
    cardLight: '#f5f4f2',
    text: '#1a1a1a',
    textMuted: '#6b7280',
    textLight: '#9ca3af',
    green: '#10b981',
    blue: '#3b82f6',
    border: '#e5e5e5',
  };

  const messages = [
    { type: 'user', text: '¿Cuántos días de vacaciones tengo?', time: '2:34 PM' },
    { type: 'bot', text: 'Based on your time at EDS Manufacturing, you have 12 PTO days available this year. You\'ve used 3 days so far, leaving you with 9 days remaining.\n\nTo request time off, text your manager or fill out form PTO-1 in the break room.', time: '2:34 PM' },
    { type: 'user', text: 'Where is the break room?', time: '2:35 PM' },
    { type: 'bot', text: 'The break room is located on the first floor, next to the main entrance. Turn left after the security desk and it\'s the second door on your right.\n\nHours: 6 AM - 10 PM\nVending machines & microwaves available.', time: '2:35 PM' },
  ];

  return (
    <div style={{
      width: 870,
      height: 550,
      background: colors.bg,
      borderRadius: 20,
      padding: 20,
      display: 'flex',
      gap: 20,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* Phone mockup */}
      <div style={{
        width: 320,
        background: colors.card,
        borderRadius: 32,
        padding: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Phone header */}
        <div style={{
          background: colors.green,
          borderRadius: '20px 20px 0 0',
          padding: '16px 16px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 40,
            height: 40,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: 16,
          }}>S</div>
          <div>
            <div style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>Sidekick</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>EDS Manufacturing</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          background: colors.cardLight,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          overflowY: 'auto',
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
            }}>
              <div style={{
                background: msg.type === 'user' ? colors.green : colors.card,
                color: msg.type === 'user' ? 'white' : colors.text,
                padding: '10px 14px',
                borderRadius: msg.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                fontSize: 13,
                lineHeight: 1.5,
                whiteSpace: 'pre-line',
              }}>{msg.text}</div>
              <div style={{
                fontSize: 10,
                color: colors.textLight,
                marginTop: 4,
                textAlign: msg.type === 'user' ? 'right' : 'left',
              }}>{msg.time}</div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{
          background: colors.card,
          borderRadius: '0 0 20px 20px',
          padding: 12,
          display: 'flex',
          gap: 8,
        }}>
          <div style={{
            flex: 1,
            background: colors.cardLight,
            borderRadius: 20,
            padding: '10px 16px',
            fontSize: 13,
            color: colors.textLight,
          }}>Type a message...</div>
          <div style={{
            width: 36,
            height: 36,
            background: colors.green,
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Right side - Features */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
        <div style={{
          background: colors.card,
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 40,
              height: 40,
              background: '#dbeafe',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.blue} strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: colors.text }}>Any Language</div>
              <div style={{ fontSize: 13, color: colors.textMuted }}>Ask in Spanish, get answers in Spanish</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['English', 'Español', 'Tiếng Việt', '中文', 'Tagalog'].map((lang, i) => (
              <span key={i} style={{
                background: colors.cardLight,
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 12,
                color: colors.textMuted,
              }}>{lang}</span>
            ))}
          </div>
        </div>

        <div style={{
          background: colors.card,
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              background: '#d1fae5',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: colors.text }}>Instant Answers</div>
              <div style={{ fontSize: 13, color: colors.textMuted }}>Average response time: 2.3 seconds</div>
            </div>
          </div>
        </div>

        <div style={{
          background: colors.card,
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              background: '#fef3c7',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: colors.text }}>Always Accurate</div>
              <div style={{ fontSize: 13, color: colors.textMuted }}>Answers sourced from your documents only</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
