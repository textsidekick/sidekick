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
    <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(28,26,22,0.06)', position: 'fixed', top: 0, left: 220, right: 0, zIndex: 45 }}>
      <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => router.push('/choose')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 10, border: '1px solid rgba(28,26,22,0.1)', background: 'white', cursor: 'pointer', color: 'rgba(28,26,22,0.6)', fontSize: 13, fontWeight: 500 }}
          >
            <Home size={15} />
            Home
          </button>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 10, border: '1px solid rgba(28,26,22,0.1)', background: 'white', cursor: 'pointer', color: 'rgba(28,26,22,0.6)', fontSize: 13, fontWeight: 500 }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export { TopBar }
export type { TopBarProps }
