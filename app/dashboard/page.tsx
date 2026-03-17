'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import {
  Sun,
  Moon,
  MessageSquare,
  Target,
  AlertTriangle,
  Activity,
  FileText,
  Upload,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'
import { MetricCard } from '@/components/dashboard/shared/MetricCard'
import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'

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

        <div className="space-y-6">
          {/* SectionHeader showcase inside a card */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5">
            <SectionHeader
              title="Team Overview"
              action={
                <Button variant="ghost" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              }
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              SectionHeader component with title and action slot.
            </p>
          </div>

          {/* MetricCard grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <MetricCard
              label="Questions Today"
              value={42}
              icon={MessageSquare}
              subtext="12 this week"
            />
            <MetricCard
              label="Answer Accuracy"
              value="94%"
              icon={Target}
              subtext="Up from 89%"
            />
            <MetricCard
              label="Open Issues"
              value={3}
              icon={AlertTriangle}
              iconClassName="h-5 w-5 text-amber-500"
              subtext="View all"
            />
            <MetricCard
              label="Health Score"
              value={87}
              icon={Activity}
              iconClassName="h-5 w-5 text-green-500"
              subtext="Good"
            />
          </div>

          {/* EmptyState showcase inside a card */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5">
            <EmptyState
              icon={FileText}
              title="No documents uploaded"
              description="Upload training documents to build your team's AI knowledge base. Supported formats include PDF, Word, and Excel."
              actionLabel="Upload Document"
              actionIcon={Upload}
              onAction={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
