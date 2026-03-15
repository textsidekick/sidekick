'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-end mb-6">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] shadow-[var(--card-shadow)] p-5">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            Sidekick Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Foundation verified — design tokens active.
          </p>
        </div>
      </div>
    </div>
  )
}
