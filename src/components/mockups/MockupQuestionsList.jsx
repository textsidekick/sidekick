// MockupQuestionsList.jsx
// Size: 870x550 - For "Workers Text & Ask" section

export default function MockupQuestionsList() {
  const colors = {
    bg: '#ffffff',
    card: '#ffffff',
    cardLight: '#f5f4f2',
    text: '#1a1a1a',
    textMuted: '#6b7280',
    textLight: '#9ca3af',
    green: '#10b981',
    greenLight: '#d1fae5',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    yellow: '#f59e0b',
    yellowLight: '#fef3c7',
    red: '#ef4444',
    border: '#e5e5e5',
  };

  const questions = [
    { q: '¿Cuál es el código de vestimenta?', lang: 'Spanish', code: 'ES', codeColor: colors.yellow, status: 'Answered', statusColor: colors.green, time: '2 min ago' },
    { q: 'What time does my shift start tomorrow?', lang: 'English', code: 'EN', codeColor: colors.blue, status: 'Answered', statusColor: colors.green, time: '5 min ago' },
    { q: 'Où se trouve la salle de pause?', lang: 'French', code: 'FR', codeColor: colors.purple, status: 'Answered', statusColor: colors.green, time: '12 min ago' },
    { q: 'How do I request PTO?', lang: 'English', code: 'EN', codeColor: colors.blue, status: 'Answered', statusColor: colors.green, time: '18 min ago' },
    { q: '安全眼鏡在哪裡?', lang: 'Chinese', code: 'ZH', codeColor: colors.red, status: 'Needs Review', statusColor: colors.yellow, time: '25 min ago' },
    { q: 'What is the overtime policy?', lang: 'English', code: 'EN', codeColor: colors.blue, status: 'Answered', statusColor: colors.green, time: '32 min ago' },
    { q: 'Wie melde ich mich krank?', lang: 'German', code: 'DE', codeColor: colors.green, status: 'Answered', statusColor: colors.green, time: '45 min ago' },
  ];

  return (
    <div style={{
      width: 870,
      height: 550,
      background: '#faf9f7',
      borderRadius: 20,
      padding: 24,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      <div style={{
        background: colors.card,
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        height: '100%',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: 24, borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: colors.text, marginBottom: 16 }}>Recent Questions</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{
              flex: 1,
              background: colors.cardLight,
              borderRadius: 10,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textLight} strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <span style={{ color: colors.textLight, fontSize: 14 }}>Search questions...</span>
            </div>
            <div style={{
              background: colors.cardLight,
              borderRadius: 10,
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: colors.textMuted,
              fontSize: 14,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>
              </svg>
              Filter
            </div>
          </div>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          padding: '14px 24px',
          borderBottom: `1px solid ${colors.border}`,
          fontSize: 12,
          color: colors.textLight,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          <span>Question</span>
          <span>Language</span>
          <span>Status</span>
          <span>Time</span>
        </div>

        {/* Question rows */}
        {questions.map((item, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            padding: '16px 24px',
            borderBottom: `1px solid ${colors.border}`,
            alignItems: 'center',
            borderLeft: `3px solid ${item.statusColor}`,
          }}>
            <span style={{ fontSize: 14, color: colors.text, fontWeight: 500 }}>{item.q}</span>
            <span style={{ fontSize: 13, color: colors.textMuted, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: `${item.codeColor}15`,
                color: item.codeColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
              }}>{item.code}</span>
              {item.lang}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 500,
              color: item.statusColor,
              background: item.statusColor === colors.green ? colors.greenLight : colors.yellowLight,
              padding: '4px 10px',
              borderRadius: 20,
              width: 'fit-content',
            }}>
              <span style={{ width: 6, height: 6, background: item.statusColor, borderRadius: 3 }}></span>
              {item.status}
            </span>
            <span style={{ fontSize: 13, color: colors.textLight }}>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
