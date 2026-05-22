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

const CONTENT_CATEGORIES: Omit<ContentCategory, 'fileCount' | 'size'>[] = [
  {
    label: 'Videos',
    icon: Video,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    label: 'Documents',
    icon: FileText,
    iconBg: 'bg-blue-100',
    iconColor: 'text-[#C96442]',
  },
  {
    label: 'Audio',
    icon: Music,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
]

interface ContentCardsProps {
  data?: { label: string; fileCount: number; size: string }[]
}

function ContentCards({ data = [] }: ContentCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {CONTENT_CATEGORIES.map((category) => {
        const Icon = category.icon
        const item = data.find(d => d.label === category.label)
        return (
          <div
            key={category.label}
            className="rounded-xl border border-gray-200 bg-white [box-shadow:var(--card-shadow)] p-5 hover:[box-shadow:var(--card-shadow-hover)] transition-shadow duration-150 cursor-pointer"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${category.iconBg} mb-3`}>
              <Icon className={`h-5 w-5 ${category.iconColor}`} />
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              {category.label}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {item ? `${item.fileCount.toLocaleString()} files · ${item.size}` : '0 files'}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export { ContentCards }
export type { ContentCardsProps }
