'use client'

import { useState } from 'react'
import { Building } from 'lucide-react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

interface SubHeaderProps {
  // Self-contained — no props needed currently
}

const MOCK_COMPANIES = [
  { value: 'sunrise-cafe', label: 'Sunrise Cafe' },
  { value: 'metro-warehouse', label: 'Metro Warehouse' },
  { value: 'downtown-retail', label: 'Downtown Retail' },
] as const

function SubHeader({}: SubHeaderProps) {
  const [company, setCompany] = useState('sunrise-cafe')

  return (
    <div className="bg-white dark:bg-[var(--card-bg)]">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-3">
        {/* Left: Tagline */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          An overview of how your team is using Sidekick.
        </p>

        {/* Right: Company Selector */}
        <Select value={company} onValueChange={(value) => { if (value) setCompany(value) }}>
          <SelectTrigger className="w-[200px] border-gray-200 dark:border-gray-700 bg-transparent">
            <Building className="h-4 w-4 text-gray-500 shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MOCK_COMPANIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export { SubHeader }
export type { SubHeaderProps }
