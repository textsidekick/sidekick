'use client'

import { Video, FileText, Music } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ContentCategory {
  label: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  fileCount: number
  size: string
}

const MOCK_CONTENT: ContentCategory[] = [
  {
    label: 'Videos',
    icon: Video,
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    fileCount: 16,
    size: '128.1 gb',
  },
  {
    label: 'Documents',
    icon: FileText,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-[#C96442] dark:text-[#C96442]',
    fileCount: 42,
    size: '2.8 gb',
  },
  {
    label: 'Audio',
    icon: Music,
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    fileCount: 1228,
    size: '155 mb',
  },
]

interface ContentCardsProps {
  showMockData?: boolean
}

function ContentCards({ showMockData = false }: ContentCardsProps) {
  const data = showMockData ? MOCK_CONTENT : MOCK_CONTENT.map(c => ({ ...c, fileCount: 0, size: '0 mb' }))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {data.map((category) => {
        const Icon = category.icon
        return (
          <div
            key={category.label}
            className="rounded-xl border border-gray-200 dark:border-gray-200 bg-white dark:bg-[#ffffff] [box-shadow:var(--card-shadow)] p-5 hover:[box-shadow:var(--card-shadow-hover)] transition-shadow duration-150 cursor-pointer"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${category.iconBg} mb-3`}>
              <Icon className={`h-5 w-5 ${category.iconColor}`} />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-900">
              {category.label}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {category.fileCount.toLocaleString()} files &middot; {category.size}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export { ContentCards, MOCK_CONTENT }
export type { ContentCardsProps }
