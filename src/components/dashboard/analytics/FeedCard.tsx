'use client'

import type { LucideIcon } from 'lucide-react'
import { MessageSquare, Activity, ChevronRight } from 'lucide-react'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'
import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'

interface FeedItem {
  id: string
  text: string
  timestamp: string
  category?: string
}

interface FeedCardProps {
  title: string
  icon: LucideIcon
  items: FeedItem[]
  emptyTitle: string
  emptyDescription: string
  showSeeAll?: boolean
  onSeeAll?: () => void
}

function FeedCard({
  title,
  icon: Icon,
  items,
  emptyTitle,
  emptyDescription,
  showSeeAll = false,
  onSeeAll,
}: FeedCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:bg-[#ffffff] [box-shadow:var(--card-shadow)] p-5">
      <SectionHeader
        title={title}
        action={
          showSeeAll ? (
            <button
              type="button"
              onClick={onSeeAll}
              className="flex items-center gap-0.5 text-xs font-medium text-[#C96442] dark:text-[#C96442] hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              See All
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : undefined
        }
      />
      {items.length === 0 ? (
        <EmptyState
          icon={Icon}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-white/50 transition-colors"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <Icon className="h-4 w-4 text-gray-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900 truncate">
                  {item.text}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">
                    {item.timestamp}
                  </span>
                  {item.category && (
                    <span className="text-xs text-gray-400">
                      · {item.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { FeedCard }
export type { FeedCardProps, FeedItem }
