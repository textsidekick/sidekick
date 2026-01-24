// MockupAISuggestions.jsx
// Size: 870x550 - For AI gap detection / suggestions feature

export default function MockupAISuggestions() {
  const colors = {
    bg: '#faf9f7',
    card: '#ffffff',
    cardLight: '#f5f4f2',
    text: '#1a1a1a',
    textMuted: '#6b7280',
    textLight: '#9ca3af',
    green: '#10b981',
    greenLight: '#d1fae5',
    blue: '#3b82f6',
    blueLight: '#dbeafe',
    purple: '#8b5cf6',
    purpleLight: '#f3e8ff',
    yellow: '#f59e0b',
    yellowLight: '#fef3c7',
    red: '#ef4444',
    redLight: '#fee2e2',
    border: '#e5e5e5',
  };

  const gaps = [
    { topic: 'Overtime pay policies', count: 12, urgency: 'high' },
    { topic: 'Holiday schedule 2024', count: 8, urgency: 'high' },
    { topic: 'Parking assignments', count: 6, urgency: 'medium' },
    { topic: 'Equipment checkout process', count: 4, urgency: 'medium' },
    { topic: 'Break room rules', count: 3, urgency: 'low' },
  ];

  const getUrgencyColor = (urgency) => {
    if (urgency === 'high') return colors.red;
    if (urgency === 'medium') return colors.yellow;
    return colors.textLight;
  };

  const getUrgencyBg = (urgency) => {
    if (urgency === 'high') return colors.redLight;
    if (urgency === 'medium') return colors.yellowLight;
    return colors.cardLight;
  };

  return (
    <div style={{
      width: 870,
      height: 550,
      background: colors.bg,
      borderRadius: 20,
      padding: 24,
      display: 'flex',
      gap: 20,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* Left - Knowledge Gaps */}
      <div style={{
        flex: 1,
        background: colors.card,
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 36,
            height: 36,
            background: colors.yellowLight,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.yellow} strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: colors.text }}>Knowledge Gaps Detected</div>
            <div style={{ fontSize: 12, color: colors.textMuted }}>Questions Sidekick couldn't fully answer</div>
          </div>
        </div>

        {/* Gap clusters */}
        {gaps.map((gap, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 16px',
            background: colors.cardLight,
            borderRadius: 12,
            marginBottom: 10,
            borderLeft: `3px solid ${getUrgencyColor(gap.urgency)}`,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: colors.text }}>{gap.topic}</div>
              <div style={{ fontSize: 12, color: colors.textMuted }}>{gap.count} unanswered questions</div>
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              color: getUrgencyColor(gap.urgency),
              background: getUrgencyBg(gap.urgency),
              padding: '4px 8px',
              borderRadius: 6,
            }}>{gap.urgency}</span>
          </div>
        ))}
      </div>

      {/* Right - AI Suggestions */}
      <div style={{
        flex: 1,
        background: colors.card,
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 36,
            height: 36,
            background: colors.purpleLight,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.purple} strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: colors.text }}>AI Suggestions</div>
            <div style={{ fontSize: 12, color: colors.textMuted }}>Recommended actions to improve</div>
          </div>
        </div>

        {/* Suggestion 1 - Primary */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.green}10, ${colors.blue}10)`,
          borderRadius: 14,
          padding: 20,
          marginBottom: 16,
          border: `1px solid ${colors.green}30`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              background: colors.greenLight,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 4 }}>Add Overtime Policy</div>
              <div style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.5 }}>
                12 workers asked about overtime pay this week. Adding a clear policy document would resolve these questions automatically.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginLeft: 44 }}>
            <button style={{
              background: colors.green,
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}>Generate Draft</button>
            <button style={{
              background: 'transparent',
              color: colors.textMuted,
              border: `1px solid ${colors.border}`,
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}>Dismiss</button>
          </div>
        </div>

        {/* Suggestion 2 */}
        <div style={{
          background: colors.cardLight,
          borderRadius: 14,
          padding: 20,
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              background: colors.blueLight,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.blue} strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 4 }}>Update Holiday Schedule</div>
              <div style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.5 }}>
                Your holiday schedule document is from 2023. Workers are asking about 2024 dates.
              </div>
            </div>
          </div>
        </div>

        {/* Suggestion 3 */}
        <div style={{
          background: colors.cardLight,
          borderRadius: 14,
          padding: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              background: colors.yellowLight,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.yellow} strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l2 2"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 4 }}>Create Parking Guide</div>
              <div style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.5 }}>
                No parking information found. 6 questions this week about lot assignments.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: colors.textMuted }}>3 suggestions this week</span>
            <span style={{ fontSize: 13, color: colors.green, fontWeight: 500, cursor: 'pointer' }}>View all insights →</span>
          </div>
        </div>
      </div>
    </div>
  );
}
