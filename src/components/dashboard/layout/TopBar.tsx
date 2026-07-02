'use client'

import { useState, useEffect, useRef } from 'react'
import { Home, LogOut, LayoutDashboard, UserPlus, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface TopBarProps {}

function TopBar({}: TopBarProps) {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('sidekick_auth') || '{}')
      setUsername(auth.username || '')
    } catch { setUsername('') }
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('sidekick_auth')
    document.cookie = 'sidekick_auth=; path=/; max-age=0'
    router.push('/login')
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(28,26,22,0.06)', position: 'relative', zIndex: 50 }}>
      <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: '#C96442', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5 }}>
            <Image src="/images/logo/newsidekicklogo.png" alt="Sidekick" width={22} height={22} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1C1A16', letterSpacing: '-0.02em' }}>Sidekick</span>
          <span style={{ fontSize: 13, color: 'rgba(28,26,22,0.35)', marginLeft: 4 }}>Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => router.push('/choose')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', color: 'rgba(28,26,22,0.5)' }}
            title="Home"
          >
            <Home size={18} />
          </button>
          {username && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, background: 'rgba(28,26,22,0.04)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#C96442', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F7F3EC', fontSize: 12, fontWeight: 600 }}>
                {username.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1C1A16' }}>{username}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { TopBar }
export type { TopBarProps }
