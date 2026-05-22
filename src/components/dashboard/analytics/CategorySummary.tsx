'use client'

import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'
import { Tag } from 'lucide-react'

export interface CategoryDataPoint {
  name: string
  count: number
  color: string
}

interface CategorySummaryProps {
  data?: CategoryDataPoint[]
}

function CategorySummary({ data = [] }: CategorySummaryProps) {
  const total = data.reduce((sum, c) => sum + c.count, 0)
  const hasData = data.length > 0 && total > 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white [box-shadow:var(--card-shadow)] p-5">
      <SectionHeader title="Question Categories" />
      {!hasData ? (
        <EmptyState
          icon={Tag}
          title="No categories yet"
          description="Question categories will appear here once workers start asking questions."
        />
      ) : (
        <>
          <div className="space-y-3">
            {data.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${cat.color}`} />
                  <span className="text-sm font-medium text-gray-700">
                    {cat.name}
                  </span>
                </div>
                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-sm font-semibold text-gray-900 tabular-nums">
                  {cat.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Total</span>
            <span className="text-sm font-bold text-gray-900 tabular-nums">
              {total.toLocaleString()}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

export { CategorySummary }
