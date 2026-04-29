'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { MessageCircle, Sun, Moon, Monitor, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

interface TopBarProps {
  // Self-contained — no props needed currently
}

function TopBar({}: TopBarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  const ThemeIcon = theme === 'dark' ? Sun : theme === 'light' ? Moon : Monitor

  return (
    <div className="bg-white dark:bg-[var(--card-bg)]">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-base font-semibold text-gray-900 dark:text-white">
            Sidekick
          </span>
          <span className="text-sm text-gray-400 dark:text-gray-500">|</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Dashboard
          </span>
        </div>

        {/* Right: Home, Theme Toggle, Avatar */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Home">
            <Home className="h-4 w-4" />
          </Button>

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={cycleTheme}
              aria-label="Toggle theme"
            >
              <ThemeIcon className="h-4 w-4" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="inline-flex items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              }
            >
              <Avatar>
                <AvatarFallback className="bg-purple-600 text-white text-xs font-medium">
                  N
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
              <DropdownMenuLabel>Nate Manager</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export { TopBar }
export type { TopBarProps }
