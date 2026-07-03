'use client'

import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'
import { Lightbulb } from 'lucide-react'

export interface GapItem {
  id: string
  question: string
  frequency: number
  category: string
}

const CATEGORY_COLORS: Record<string, string> = {
  Safety: 'bg-[#DC2626] text-white',
  HR: 'bg-[#0891B2] text-white',
  Training: 'bg-[#DB2777] text-white',
  General: 'bg-[#4A4A4A] text-white',
}

interface TopGapsTableProps {
  gaps?: GapItem[]
}

function TopGapsTable({ gaps = [] }: TopGapsTableProps) {
  const hasData = gaps.length > 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white [box-shadow:var(--card-shadow)] p-5">
      <SectionHeader title="Top Unanswered Topics" subtitle="Questions Sidekick couldn't resolve" />
      {!hasData ? (
        <EmptyState
          icon={Lightbulb}
          title="No gaps detected"
          description="Unanswered question topics will appear here once workers start asking questions."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500">
                  Topic
                </th>
                <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500">
                  Category
                </th>
                <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wide text-gray-500">
                  Asks
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {gaps.map((gap) => (
                <tr key={gap.id} className="group">
                  <td className="py-2.5 pr-4 text-sm font-medium text-gray-900">
                    {gap.question}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        CATEGORY_COLORS[gap.category] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {gap.category}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-sm tabular-nums text-gray-600">
                    {gap.frequency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export { TopGapsTable }
