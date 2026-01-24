// MockupVoiceMemo.jsx
// Size: 870x550 - Worker voice memo feature

export default function MockupVoiceMemo() {
  const colors = {
    bg: '#faf9f7',
    card: '#ffffff',
    cardLight: '#f5f4f2',
    text: '#1a1a1a',
    textMuted: '#6b7280',
    textLight: '#9ca3af',
    green: '#10b981',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    border: '#e5e5e5',
  };

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
        }}>
          {/* Voice memo from user */}
          <div style={{ alignSelf: 'flex-end', maxWidth: '85%' }}>
            <div style={{
              background: colors.green,
              padding: '12px 16px',
              borderRadius: '16px 16px 4px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <div style={{
                width: 32,
                height: 32,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[3,5,8,4,7,9,6,4,7,5,3,6,8,5,4].map((h, i) => (
                    <div key={i} style={{
                      width: 3,
                      height: h * 2,
                      background: 'rgba(255,255,255,0.7)',
                      borderRadius: 2,
                    }}/>
                  ))}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>0:08</span>
              </div>
            </div>
            <div style={{ fontSize: 10, color: colors.textLight, marginTop: 4, textAlign: 'right' }}>2:41 PM</div>
          </div>

          {/* Transcription indicator */}
          <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
            <div style={{
              background: colors.card,
              padding: '10px 14px',
              borderRadius: '16px 16px 16px 4px',
              fontSize: 12,
              color: colors.textMuted,
              fontStyle: 'italic',
            }}>
              <span style={{ color: colors.purple }}>🎤 Transcribed:</span> "¿Dónde están los cascos de seguridad?"
            </div>
          </div>

          {/* Bot response */}
          <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
            <div style={{
              background: colors.card,
              color: colors.text,
              padding: '12px 16px',
              borderRadius: '16px 16px 16px 4px',
              fontSize: 13,
              lineHeight: 1.5,
            }}>
              Los cascos de seguridad están en el armario de EPP junto a la entrada del almacén. Código de acceso: 4521.
              <div style={{ marginTop: 10, padding: 10, background: colors.cardLight, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>📍 Location</div>
                <div style={{ fontSize: 12, color: colors.text }}>Warehouse Entrance - PPE Cabinet #3</div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: colors.textLight, marginTop: 4 }}>2:41 PM</div>
          </div>
        </div>

        {/* Input with mic */}
        <div style={{
          background: colors.card,
          borderRadius: '0 0 20px 20px',
          padding: 12,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}>
          <div style={{
            flex: 1,
            background: colors.cardLight,
            borderRadius: 20,
            padding: '10px 16px',
            fontSize: 13,
            color: colors.textLight,
          }}>Type or hold to record...</div>
          <div style={{
            width: 44,
            height: 44,
            background: colors.purple,
            borderRadius: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Right side - Voice features */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
        <div style={{
          background: colors.card,
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 48,
              height: 48,
              background: '#f3e8ff',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.purple} strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: colors.text }}>Voice Memos</div>
              <div style={{ fontSize: 14, color: colors.textMuted }}>Just talk - no typing needed</div>
            </div>
          </div>
          <p style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.6 }}>
            Workers can send voice messages in any language. Sidekick transcribes, understands, and responds instantly.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{
            flex: 1,
            background: colors.card,
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: colors.green }}>50+</div>
            <div style={{ fontSize: 13, color: colors.textMuted }}>Languages supported</div>
          </div>
          <div style={{
            flex: 1,
            background: colors.card,
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: colors.purple }}>98%</div>
            <div style={{ fontSize: 13, color: colors.textMuted }}>Transcription accuracy</div>
          </div>
        </div>

        <div style={{
          background: colors.card,
          borderRadius: 16,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 12 }}>Perfect for workers who:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Have their hands full on the job',
              'Prefer speaking over typing',
              'Are more comfortable in their native language',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 20,
                  height: 20,
                  background: '#d1fae5',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span style={{ fontSize: 13, color: colors.textMuted }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
