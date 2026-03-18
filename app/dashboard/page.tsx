'use client'

import { useState } from 'react'
import { FileText, Sparkles, Users } from 'lucide-react'
import { TopBar } from '@/components/dashboard/layout/TopBar'
import { SubHeader } from '@/components/dashboard/layout/SubHeader'
import { TabNav, type TabId } from '@/components/dashboard/layout/TabNav'
import { AnalyticsTab } from '@/components/dashboard/analytics/AnalyticsTab'
import { AlertsTab } from '@/components/dashboard/alerts/AlertsTab'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>('analytics')

  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      {/* Sticky TopBar */}
      <div className="sticky top-0 z-30">
        <TopBar />
      </div>

      {/* SubHeader (scrolls with content) */}
      <SubHeader />

      {/* TabNav (scrolls with content) */}
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab content area */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'analytics' && <AnalyticsTab showMockData={true} />}
        {activeTab === 'alerts' && <AlertsTab showMockData={true} />}
        {activeTab === 'documents' && (
          <EmptyState
            icon={FileText}
            title="Documents Coming Soon"
            description="Upload and manage training documents and integrations here. This tab is under construction."
          />
        )}
        {activeTab === 'ai-studio' && (
          <EmptyState
            icon={Sparkles}
            title="AI Studio Coming Soon"
            description="Create training content and analyze knowledge gaps here. This tab is under construction."
          />
        )}
        {activeTab === 'workers' && (
          <EmptyState
            icon={Users}
            title="Workers Coming Soon"
            description="Manage your team, view registration codes, and track worker status here. This tab is under construction."
          />
        )}
      </div>
    </div>
  )
}
