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
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-6 w-6 text-gray-400" />
      <h3 className="mt-3 text-sm font-semibold text-gray-900">
        {title}
      </h3>
      <p className="mt-1 max-w-xs text-sm text-gray-500">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onAction}
        >
          {ActionIcon && <ActionIcon className="mr-1.5 h-4 w-4" />}
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export { EmptyState }
export type { EmptyStateProps }
