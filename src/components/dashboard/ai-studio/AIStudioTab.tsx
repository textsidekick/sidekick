'use client'

import { Sparkles } from 'lucide-react'
import { VideoUpload } from './VideoUpload'
import { KnowledgeGaps } from './KnowledgeGaps'
import { ContentCards } from './ContentCards'
import { StorageSidebar } from './StorageSidebar'

function AIStudioTab() {
  return (
    <div>
      {/* Page heading */}
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="h-6 w-6 text-purple-600" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Create Content
          </h2>
          <p className="text-sm text-gray-500">
            Generate training materials, policies, and guides from your facility knowledge
          </p>
        </div>
      </div>

      {/* Two-column layout: main content + storage sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main content */}
        <div className="space-y-6">
          <ContentCards />
          <VideoUpload />
          <KnowledgeGaps gaps={[]} />
        </div>

        {/* Sidebar */}
        <StorageSidebar />
      </div>
    </div>
  )
}

export { AIStudioTab }
