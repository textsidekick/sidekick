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
    <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(28,26,22,0.06)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: '#C96442', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5 }}>
            <Image src="/images/logo/newsidekicklogo.png" alt="Sidekick" width={22} height={22} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1C1A16', letterSpacing: '-0.02em' }}>Sidekick</span>
          <span style={{ fontSize: 13, color: 'rgba(28,26,22,0.35)', marginLeft: 4 }}>Dashboard</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#C96442', background: 'rgba(201,100,66,0.1)', padding: '2px 6px', borderRadius: 4, marginLeft: 8 }}>YC S26</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, border: 'none', background: showMenu ? 'rgba(28,26,22,0.06)' : 'transparent', cursor: 'pointer', color: 'rgba(28,26,22,0.5)' }}
              title="Navigate"
            >
              <Home size={18} />
            </button>
            {showMenu && (
              <div style={{ position: 'absolute', right: 0, top: 42, background: '#fff', borderRadius: 12, boxShadow: '0 8px 30px rgba(28,26,22,0.12)', border: '1px solid rgba(28,26,22,0.08)', padding: 6, minWidth: 200, zIndex: 50 }}>
                <button onClick={() => { setShowMenu(false); router.push('/manager'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#1C1A16', textAlign: 'left' }}>
                  <LayoutDashboard size={16} style={{ color: '#C96442' }} /> Dashboard
                </button>
                <button onClick={() => { setShowMenu(false); router.push('/onboarding-chat'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#1C1A16', textAlign: 'left' }}>
                  <UserPlus size={16} style={{ color: '#C96442' }} /> Onboarding
                </button>
                <div style={{ height: 1, background: 'rgba(28,26,22,0.06)', margin: '4px 0' }} />
                <button onClick={() => { setShowMenu(false); window.open('https://textsidekick.com', '_blank'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'rgba(28,26,22,0.5)', textAlign: 'left' }}>
                  <Globe size={16} /> Landing Page
                </button>
              </div>
            )}
          </div>
          {username && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, background: 'rgba(28,26,22,0.04)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#C96442', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F7F3EC', fontSize: 12, fontWeight: 600 }}>
                {username.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1C1A16' }}>{username}</span>
            </div>
          )}
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
