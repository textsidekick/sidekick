'use client'

import { Sparkles } from 'lucide-react'
import { VideoUpload } from './VideoUpload'
import { KnowledgeGaps, MOCK_GAPS } from './KnowledgeGaps'
import { ContentCards } from './ContentCards'
import { StorageSidebar } from './StorageSidebar'

interface AIStudioTabProps {
  showMockData?: boolean
}

function AIStudioTab({ showMockData = false }: AIStudioTabProps) {
  const gaps = showMockData ? MOCK_GAPS : []

  return (
    <div>
      {/* Page heading — unique to AI Studio */}
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create Content
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate training materials, policies, and guides from your facility knowledge
          </p>
        </div>
      </div>

      {/* Two-column layout: main content + storage sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main content */}
        <div className="space-y-6">
          <ContentCards showMockData={showMockData} />
          <VideoUpload />
          <KnowledgeGaps gaps={gaps} />
        </div>

        {/* Sidebar */}
        <StorageSidebar showMockData={showMockData} />
      </div>
    </div>
  )
}

export { AIStudioTab }
export type { AIStudioTabProps }
