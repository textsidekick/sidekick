'use client'

import type { LucideIcon } from 'lucide-react'
import { BarChart3, ShieldAlert, FileText, Users, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type TabId = 'analytics' | 'alerts' | 'documents' | 'workers'

interface TabNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

interface TabDefinition {
  id: TabId
  label: string
  icon: LucideIcon
}

const TABS: TabDefinition[] = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'alerts', label: 'Alerts', icon: ShieldAlert },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'workers', label: 'Workers', icon: Users },
]

function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-200 bg-white dark:bg-[#ffffff]">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.id
                  ? 'border-[#C96442] text-gray-900 dark:text-gray-900'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-600'
              )}
              onClick={() => onTabChange(tab.id)}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <Button>
          <LayoutGrid className="h-4 w-4" />
          Invite Workers
        </Button>
      </div>
    </div>
  )
}

export { TabNav }
export type { TabNavProps, TabId }
