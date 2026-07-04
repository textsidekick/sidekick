'use client'

import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm leading-relaxed text-gray-500 dark:text-white/60">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export { SectionHeader }
export type { SectionHeaderProps }
