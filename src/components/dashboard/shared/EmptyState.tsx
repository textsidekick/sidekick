'use client'

import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionIcon?: LucideIcon
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  compact?: boolean
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-6' : 'py-10'}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F7F3EC] border border-[rgba(28,26,22,0.06)]">
        <Icon className="h-6 w-6 text-[#C96442]/60" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-[#1C1A16]">
        {title}
      </h3>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-black/45">
        {description}
      </p>
      <div className="mt-4 flex items-center gap-2">
        {actionLabel && onAction && (
          <Button
            size="sm"
            className="bg-[#C96442] hover:bg-[#B0532F] text-white"
            onClick={onAction}
          >
            {ActionIcon && <ActionIcon className="mr-1.5 h-4 w-4" />}
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSecondaryAction}
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

export { EmptyState }
export type { EmptyStateProps }
