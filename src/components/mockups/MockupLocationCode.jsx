// MockupLocationCode.jsx
// Size: 870x550 - For "Get Your Location Code" section

export default function MockupLocationCode() {
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
    red: '#ef4444',
    border: '#e5e5e5',
  };

  const workers = [
    { name: 'Maria Garcia', role: 'Assembly Line', time: 'Active now', color: colors.red, active: true },
    { name: 'John Smith', role: 'Quality Control', time: '5 min ago', color: colors.blue, active: false },
    { name: 'Wei Chen', role: 'Packaging', time: '12 min ago', color: colors.green, active: false },
    { name: 'Ahmed Hassan', role: 'Maintenance', time: '18 min ago', color: colors.yellow, active: false },
    { name: 'Lisa Johnson', role: 'Shipping', time: '25 min ago', color: colors.purple, active: false },
  ];

  return (
    <div style={{
      width: 870,
      height: 550,
      background: '#faf9f7',
      borderRadius: 20,
      padding: 24,
      display: 'flex',
      gap: 20,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* Left card - Location code */}
      <div style={{
        width: 340,
        background: colors.card,
        borderRadius: 16,
        padding: 28,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          width: 52,
          height: 52,
          background: colors.greenLight,
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.green,
          marginBottom: 24,
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        
        <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 8 }}>Location Code</div>
        <div style={{
          fontSize: 44,
          fontWeight: 800,
          color: colors.text,
          letterSpacing: 3,
          marginBottom: 24,
          fontFamily: "'SF Mono', Monaco, 'Courier New', monospace",
        }}>EDS-247</div>
        
        <div style={{
          background: colors.cardLight,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>EDS Manufacturing</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>Main Production Floor</div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
          <button style={{
            flex: 1,
            background: colors.green,
            color: 'white',
            border: 'none',
            padding: 12,
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 500,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}>Copy Code</button>
          <button style={{
            flex: 1,
            background: colors.cardLight,
            color: colors.text,
            border: 'none',
            padding: 12,
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 500,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}>Print QR</button>
        </div>
      </div>

      {/* Right side - Workers list */}
      <div style={{
        flex: 1,
        background: colors.card,
        borderRadius: 16,
        padding: 28,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.text }}>Active Workers</div>
          <span style={{ fontSize: 13, color: colors.textMuted }}>24 enrolled</span>
        </div>

        {/* Worker rows */}
        {workers.map((worker, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '12px 0',
            borderBottom: i < workers.length - 1 ? `1px solid ${colors.border}` : 'none',
          }}>
            <div style={{
              width: 40,
              height: 40,
              background: worker.color,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
            }}>{worker.name.split(' ').map(n => n[0]).join('')}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: colors.text }}>{worker.name}</div>
              <div style={{ fontSize: 12, color: colors.textMuted }}>{worker.role}</div>
            </div>
            <div style={{ fontSize: 12, color: worker.active ? colors.green : colors.textLight }}>{worker.time}</div>
          </div>
        ))}

        {/* Bottom info */}
        <div style={{
          marginTop: 20,
          padding: 16,
          background: colors.cardLight,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{ color: colors.textMuted }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, color: colors.textMuted }}>Workers text <strong style={{ color: colors.text }}>EDS-247</strong> to</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>+1 (555) 123-4567</div>
          </div>
        </div>
      </div>
    </div>
  );
}
