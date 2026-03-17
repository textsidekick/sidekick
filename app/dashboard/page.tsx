'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnalyticsTab } from '@/components/dashboard/analytics/AnalyticsTab'

export default function DashboardPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      {/* Minimal top bar */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)]">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-base font-semibold text-gray-900 dark:text-white">
              Sidekick
            </span>
            <span className="text-sm text-gray-400 dark:text-gray-500">|</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Dashboard</span>
          </div>
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
      </div>

      {/* Page content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            An overview of how your team is using Sidekick
          </p>
        </div>
        <AnalyticsTab />
      </div>
    </div>
  )
}
