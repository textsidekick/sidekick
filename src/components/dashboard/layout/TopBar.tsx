'use client'

import { useState, useEffect } from 'react'
import { Home, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface TopBarProps {}

function TopBar({}: TopBarProps) {
  const router = useRouter()
  const [username, setUsername] = useState('')

  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('sidekick_auth') || '{}')
      setUsername(auth.username || 'User')
    } catch { setUsername('User') }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('sidekick_auth')
    document.cookie = 'sidekick_auth=; path=/; max-age=0'
    router.push('/login')
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(28,26,22,0.06)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image src="/images/logo/newsidekicklogo.png" alt="Sidekick" width={28} height={28} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1C1A16', letterSpacing: '-0.02em' }}>Sidekick</span>
          <span style={{ fontSize: 13, color: 'rgba(28,26,22,0.35)', marginLeft: 4 }}>Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', color: 'rgba(28,26,22,0.5)' }}
            title="Home"
          >
            <Home size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, background: 'rgba(28,26,22,0.04)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#C96442', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F7F3EC', fontSize: 12, fontWeight: 600 }}>
              {username.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1C1A16' }}>{username}</span>
          </div>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', color: 'rgba(28,26,22,0.35)' }}
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export { TopBar }
export type { TopBarProps }
