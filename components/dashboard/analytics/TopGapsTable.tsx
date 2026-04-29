'use client'

import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'

interface GapItem {
  topic: string
  category: string
  frequency: number
  gapScore: number
}

const MOCK_GAPS: GapItem[] = [
  { topic: 'Forklift certification renewal', category: 'Safety', frequency: 34, gapScore: 92 },
  { topic: 'Overtime pay calculation', category: 'HR', frequency: 28, gapScore: 87 },
  { topic: 'Chemical spill procedure', category: 'Safety', frequency: 22, gapScore: 85 },
  { topic: 'PTO rollover policy', category: 'HR', frequency: 19, gapScore: 78 },
  { topic: 'Loading dock protocol', category: 'Training', frequency: 15, gapScore: 71 },
]

const CATEGORY_COLORS: Record<string, string> = {
  Safety: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  HR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Training: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

function TopGapsTable() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5">
      <SectionHeader title="Top Unanswered Topics" subtitle="Questions Sidekick couldn't resolve" />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Topic
              </th>
              <th className="pb-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Category
              </th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Asks
              </th>
              <th className="pb-2 text-right text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Gap Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {MOCK_GAPS.map((gap) => (
              <tr key={gap.topic} className="group">
                <td className="py-2.5 pr-4 text-sm font-medium text-gray-900 dark:text-white">
                  {gap.topic}
                </td>
                <td className="py-2.5 pr-4">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      CATEGORY_COLORS[gap.category] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {gap.category}
                  </span>
                </td>
                <td className="py-2.5 text-right text-sm tabular-nums text-gray-600 dark:text-gray-400">
                  {gap.frequency}
                </td>
                <td className="py-2.5 text-right text-sm font-semibold tabular-nums text-red-600 dark:text-red-400">
                  {gap.gapScore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { TopGapsTable }
