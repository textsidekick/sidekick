'use client'

import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'

interface CategoryItem {
  name: string
  count: number
  color: string
}

const MOCK_CATEGORIES: CategoryItem[] = [
  { name: 'Safety & Compliance', count: 847, color: 'bg-red-400' },
  { name: 'Training & Procedures', count: 623, color: 'bg-blue-400' },
  { name: 'Schedule & Shifts', count: 412, color: 'bg-amber-400' },
  { name: 'HR & Benefits', count: 289, color: 'bg-emerald-400' },
  { name: 'Equipment & Tools', count: 156, color: 'bg-purple-400' },
]

function CategorySummary() {
  const total = MOCK_CATEGORIES.reduce((sum, c) => sum + c.count, 0)

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-200 bg-white dark:bg-[#ffffff] [box-shadow:var(--card-shadow)] p-5">
      <SectionHeader title="Question Categories" />
      <div className="space-y-3">
        {MOCK_CATEGORIES.map((cat) => (
          <div key={cat.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${cat.color}`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-600">
                {cat.name}
              </span>
            </div>
            <span className="rounded-md bg-gray-100 dark:bg-white px-2.5 py-1 text-sm font-semibold text-gray-900 dark:text-gray-900 tabular-nums">
              {cat.count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-200 flex justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Total</span>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-900 tabular-nums">
          {total.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export { CategorySummary }
