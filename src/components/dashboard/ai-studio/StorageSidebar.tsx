'use client'

import { Clock } from 'lucide-react'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

function StorageSidebar() {
  return (
    <div className="space-y-6">
      {/* Recent Activity */}
      <div className="rounded-xl border border-gray-200 bg-white [box-shadow:var(--card-shadow)] p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <EmptyState
          icon={Clock}
          title="No recent activity"
          description="Activity from uploads, policy generation, and gap analysis will appear here"
        />
      </div>
    </div>
  )
}

export { StorageSidebar }
