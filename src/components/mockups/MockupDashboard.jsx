// MockupDashboard.jsx
// Size: 870x550 - For "Track & Improve" section

export default function MockupDashboard() {
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
    border: '#e5e5e5',
  };

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
      {/* Sidebar */}
      <div style={{
        width: 200,
        background: colors.card,
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, background: colors.green, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>S</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: colors.text }}>Sidekick</span>
        </div>
        
        {[
          { icon: 'chart', label: 'Analytics', active: true },
          { icon: 'file', label: 'Documents', active: false },
          { icon: 'users', label: 'Workers', active: false },
          { icon: 'location', label: 'Locations', active: false },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            borderRadius: 10,
            marginBottom: 4,
            background: item.active ? colors.greenLight : 'transparent',
            color: item.active ? colors.green : colors.textMuted,
          }}>
            {item.icon === 'chart' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>}
            {item.icon === 'file' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>}
            {item.icon === 'users' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
            {item.icon === 'location' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
            <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
        
        <div style={{ borderTop: `1px solid ${colors.border}`, margin: '20px 0', paddingTop: 20 }}>
          <div style={{ fontSize: 11, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Settings</div>
          {['Account', 'Billing', 'Help'].map((item, i) => (
            <div key={i} style={{ padding: '10px 14px', fontSize: 14, color: colors.textMuted }}>{item}</div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, color: colors.text }}>Hello, Manager</div>
            <div style={{ fontSize: 14, color: colors.textMuted }}>Here's what's happening with Sidekick</div>
          </div>
          <div style={{ background: colors.card, padding: '8px 16px', borderRadius: 10, fontSize: 13, color: colors.textMuted, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            This Week ▾
          </div>
        </div>

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { icon: 'chat', label: 'Total Questions', value: '1,247', change: '+16.4%' },
            { icon: 'clock', label: 'Avg Response', value: '2.3s', change: '-12%' },
            { icon: 'globe', label: 'Languages', value: '8', change: '+2' },
            { icon: 'check', label: 'Answer Rate', value: '94.2%', change: '+3.1%' },
          ].map((stat, i) => (
            <div key={i} style={{ background: colors.card, borderRadius: 14, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, background: colors.cardLight, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted }}>
                  {stat.icon === 'chat' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                  {stat.icon === 'clock' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
                  {stat.icon === 'globe' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
                  {stat.icon === 'check' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>}
                </div>
                <span style={{ fontSize: 12, color: colors.textMuted }}>{stat.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: colors.text }}>{stat.value}</span>
                <span style={{ fontSize: 12, color: colors.green, fontWeight: 500 }}>{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom charts */}
        <div style={{ display: 'flex', gap: 16, flex: 1 }}>
          {/* Questions by Topic */}
          <div style={{ background: colors.card, borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', flex: 1, display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 12 }}>Questions by Topic</div>
              <svg width="130" height="130" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r="50" fill="none" stroke="#e5e7eb" strokeWidth="16"/>
                <circle cx="65" cy="65" r="50" fill="none" stroke={colors.green} strokeWidth="16" strokeDasharray="100.5 314" strokeDashoffset="0" transform="rotate(-90 65 65)"/>
                <circle cx="65" cy="65" r="50" fill="none" stroke={colors.blue} strokeWidth="16" strokeDasharray="87.9 314" strokeDashoffset="-100.5" transform="rotate(-90 65 65)"/>
                <circle cx="65" cy="65" r="50" fill="none" stroke={colors.purple} strokeWidth="16" strokeDasharray="69.1 314" strokeDashoffset="-188.4" transform="rotate(-90 65 65)"/>
                <circle cx="65" cy="65" r="50" fill="none" stroke={colors.yellow} strokeWidth="16" strokeDasharray="56.5 314" strokeDashoffset="-257.5" transform="rotate(-90 65 65)"/>
                <text x="65" y="62" textAnchor="middle" fontSize="20" fontWeight="700" fill={colors.text}>1,247</text>
                <text x="65" y="78" textAnchor="middle" fontSize="10" fill={colors.textMuted}>Total</text>
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, flex: 1 }}>
              {[
                { label: 'Safety', value: '32%', color: colors.green },
                { label: 'Scheduling', value: '28%', color: colors.blue },
                { label: 'Benefits', value: '22%', color: colors.purple },
                { label: 'Policies', value: '18%', color: colors.yellow },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, background: item.color, borderRadius: 2 }}></span>
                  <span style={{ flex: 1, fontSize: 12, color: colors.textMuted }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: colors.text }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Peak Activity Hours */}
          <div style={{ background: colors.card, borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', flex: 1.2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Peak Activity Hours</span>
              <span style={{ fontSize: 11, color: colors.textMuted }}>Questions per hour</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, paddingTop: 10 }}>
              {[
                { hour: '6a', value: 15 },
                { hour: '7a', value: 45 },
                { hour: '8a', value: 85 },
                { hour: '9a', value: 70 },
                { hour: '10a', value: 50 },
                { hour: '11a', value: 40 },
                { hour: '12p', value: 65 },
                { hour: '1p', value: 55 },
                { hour: '2p', value: 45 },
                { hour: '3p', value: 75 },
                { hour: '4p', value: 60 },
                { hour: '5p', value: 30 },
              ].map((bar, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: '100%',
                    height: bar.value,
                    background: bar.value >= 75 ? colors.green : bar.value >= 50 ? colors.blue : colors.cardLight,
                    borderRadius: 3,
                  }}></div>
                  <span style={{ fontSize: 9, color: colors.textLight }}>{bar.hour}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '10px 12px', background: colors.cardLight, borderRadius: 8 }}>
              <div style={{ width: 8, height: 8, background: colors.green, borderRadius: 4 }}></div>
              <span style={{ fontSize: 12, color: colors.textMuted }}>Peak:</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: colors.text }}>8-9 AM</span>
              <span style={{ fontSize: 12, color: colors.textMuted }}>&</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: colors.text }}>3-4 PM</span>
              <span style={{ fontSize: 11, color: colors.textLight, marginLeft: 'auto' }}>Shift changes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
