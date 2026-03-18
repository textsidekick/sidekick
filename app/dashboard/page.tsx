'use client'

import { useState } from 'react'
import { TopBar } from '@/components/dashboard/layout/TopBar'
import { SubHeader } from '@/components/dashboard/layout/SubHeader'
import { TabNav, type TabId } from '@/components/dashboard/layout/TabNav'
import { AnalyticsTab } from '@/components/dashboard/analytics/AnalyticsTab'
import { AlertsTab } from '@/components/dashboard/alerts/AlertsTab'
import { WorkersTab } from '@/components/dashboard/workers/WorkersTab'
import { DocumentsTab } from '@/components/dashboard/documents/DocumentsTab'
import { AIStudioTab } from '@/components/dashboard/ai-studio/AIStudioTab'


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
        {activeTab === 'documents' && <DocumentsTab showMockData={true} />}
        {activeTab === 'ai-studio' && <AIStudioTab showMockData={true} />}
        {activeTab === 'workers' && <WorkersTab showMockData={true} />}
      </div>
    </div>
  )
}
