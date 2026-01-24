// MockupKnowledgeBase.jsx
// Size: 870x550 - For "Build Your Knowledge Base" section

export default function MockupKnowledgeBase() {
  const colors = {
    bg: '#ffffff',
    card: '#ffffff',
    cardLight: '#f5f4f2',
    text: '#1a1a1a',
    textMuted: '#6b7280',
    textLight: '#9ca3af',
    green: '#10b981',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    yellow: '#f59e0b',
    red: '#ef4444',
    border: '#e5e5e5',
  };

  const documents = [
    { name: 'Employee Handbook', type: 'PDF', pages: '45 pages', color: colors.red },
    { name: 'Safety Procedures', type: 'PDF', pages: '28 pages', color: colors.yellow },
    { name: 'Equipment Manual', type: 'PDF', pages: '67 pages', color: colors.green },
    { name: 'Dress Code Policy', type: 'DOC', pages: '8 pages', color: colors.blue },
  ];

  const audioFiles = [
    { name: 'Safety Training (Spanish)', duration: '12:34', color: colors.purple },
    { name: 'Onboarding Welcome', duration: '5:20', color: colors.blue },
    { name: 'Break Policy (Vietnamese)', duration: '8:15', color: colors.green },
  ];

  return (
    <div style={{
      width: 870,
      height: 550,
      background: '#faf9f7',
      borderRadius: 20,
      padding: 20,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      <div style={{
        background: colors.card,
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        height: '100%',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header with stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: colors.text }}>Knowledge Base</div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>7 files • 165 pages indexed</div>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: colors.text }}>165</div>
              <div style={{ fontSize: 10, color: colors.textMuted }}>Pages</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: colors.text }}>4</div>
              <div style={{ fontSize: 10, color: colors.textMuted }}>Docs</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: colors.text }}>3</div>
              <div style={{ fontSize: 10, color: colors.textMuted }}>Audio</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: colors.green }}>100%</div>
              <div style={{ fontSize: 10, color: colors.textMuted }}>Indexed</div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Documents</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {documents.map((doc, i) => (
              <div key={i} style={{
                background: colors.cardLight,
                borderRadius: 12,
                padding: 12,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}>
                <div style={{
                  width: 36,
                  height: 44,
                  background: `${doc.color}15`,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: doc.color,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.text, marginBottom: 2 }}>{doc.name}</div>
                  <div style={{ fontSize: 10, color: colors.textLight }}>{doc.pages}</div>
                </div>
                <span style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: doc.color,
                  background: `${doc.color}15`,
                  padding: '3px 8px',
                  borderRadius: 4,
                }}>{doc.type}</span>
              </div>
            ))}
          </div>
          {/* Add document button */}
          <div style={{
            border: '2px dashed #e5e5e5',
            borderRadius: 10,
            padding: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: colors.textMuted,
            fontSize: 13,
            cursor: 'pointer',
            marginTop: 10,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v8M8 12h8"/>
            </svg>
            Add document
          </div>
        </div>

        {/* Audio Section */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Audio Recordings</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {audioFiles.map((audio, i) => (
              <div key={i} style={{
                background: colors.cardLight,
                borderRadius: 12,
                padding: 12,
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <div style={{
                  width: 38,
                  height: 38,
                  background: `${audio.color}15`,
                  borderRadius: 19,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: audio.color,
                  flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.text, marginBottom: 2 }}>{audio.name}</div>
                  <div style={{ fontSize: 10, color: colors.textLight }}>{audio.duration}</div>
                </div>
                <div style={{
                  width: 26,
                  height: 26,
                  background: colors.green,
                  borderRadius: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="none">
                    <polygon points="5,3 19,12 5,21"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
          {/* Add audio button */}
          <div style={{
            border: '2px dashed #e5e5e5',
            borderRadius: 10,
            padding: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: colors.textMuted,
            fontSize: 13,
            cursor: 'pointer',
            marginTop: 10,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v8M8 12h8"/>
            </svg>
            Add audio recording
          </div>
        </div>
      </div>
    </div>
  );
}
