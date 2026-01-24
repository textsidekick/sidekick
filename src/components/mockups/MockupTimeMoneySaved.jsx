// MockupTimeMoneySaved.jsx
// Size: 653x675 - For hero section showing manager time/money saved

export default function MockupTimeMoneySaved() {
  const colors = {
    bg: '#faf9f7',
    card: '#ffffff',
    text: '#1a1a1a',
    textMuted: '#6b7280',
    textLight: '#9ca3af',
    green: '#10b981',
    greenLight: '#d1fae5',
    blue: '#3b82f6',
    blueLight: '#dbeafe',
    red: '#ef4444',
    border: '#e5e5e5',
  };

  return (
    <div style={{
      width: 620,
      background: colors.bg,
      borderRadius: 16,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      overflow: 'hidden',
    }}>
      {/* Main stat card */}
      <div style={{
        background: colors.card,
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
          Manager Time Saved
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, color: colors.green, lineHeight: 1 }}>
          47<span style={{ fontSize: 32 }}>hrs</span>
        </div>
        <div style={{ fontSize: 14, color: colors.textMuted, marginTop: 6 }}>this month alone</div>
      </div>

      {/* Secondary stats row */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{
          flex: 1,
          background: colors.card,
          borderRadius: 16,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            width: 40,
            height: 40,
            background: colors.greenLight,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: colors.text }}>$4,200</div>
          <div style={{ fontSize: 13, color: colors.textMuted }}>Labor cost saved</div>
          <div style={{ fontSize: 12, color: colors.green, marginTop: 8 }}>↑ 23% vs last month</div>
        </div>
        
        <div style={{
          flex: 1,
          background: colors.card,
          borderRadius: 16,
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            width: 40,
            height: 40,
            background: colors.blueLight,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.blue} strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: colors.text }}>892</div>
          <div style={{ fontSize: 13, color: colors.textMuted }}>Interruptions avoided</div>
          <div style={{ fontSize: 12, color: colors.green, marginTop: 8 }}>↑ 18% vs last month</div>
        </div>
      </div>

      {/* Breakdown card */}
      <div style={{
        background: colors.card,
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Column Headers */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          paddingBottom: 10,
          borderBottom: `1px solid ${colors.border}`,
          marginBottom: 4,
        }}>
          <span style={{ flex: 2, fontSize: 10, fontWeight: 600, color: colors.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sidekick Impact</span>
          <span style={{ flex: 1, fontSize: 10, fontWeight: 600, color: colors.red, textTransform: 'uppercase', letterSpacing: 0.5 }}>Before</span>
          <span style={{ flex: 1, fontSize: 10, fontWeight: 600, color: colors.green, textTransform: 'uppercase', letterSpacing: 0.5 }}>After</span>
          <span style={{ width: 50, fontSize: 10, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Saved</span>
        </div>
        
        {[
          { label: 'Avg. questions per new hire', before: '23/day', after: '0', improvement: '100%' },
          { label: 'Manager time on repetitive Q&A', before: '2.5 hrs', after: '12 min', improvement: '92%' },
          { label: 'Time to answer a question', before: '8 min', after: '2.3 sec', improvement: '99%' },
          { label: 'Questions answered after hours', before: '0%', after: '100%', improvement: '∞' },
        ].map((row, i, arr) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none',
          }}>
            <span style={{ flex: 2, fontSize: 13, color: colors.textMuted }}>{row.label}</span>
            <span style={{ flex: 1, fontSize: 13, color: colors.red, textDecoration: 'line-through', opacity: 0.6 }}>{row.before}</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: colors.green }}>{row.after}</span>
            <span style={{
              width: 50,
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 600,
              color: colors.green,
              background: colors.greenLight,
              padding: '4px 8px',
              borderRadius: 6,
            }}>{row.improvement}</span>
          </div>
        ))}

        {/* Bottom Summary */}
        <div style={{
          paddingTop: 16,
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, background: colors.green, borderRadius: '50%' }}></div>
              <span style={{ fontSize: 12, color: colors.textMuted }}>48 workers enrolled</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, background: colors.blue, borderRadius: '50%' }}></div>
              <span style={{ fontSize: 12, color: colors.textMuted }}>8 languages supported</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: colors.green, fontWeight: 500 }}>
            ROI: 12x →
          </div>
        </div>
      </div>
    </div>
  );
}
