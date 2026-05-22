'use client'

import { Lightbulb, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

interface KnowledgeGap {
  id: string
  question: string
  frequency: number
  category: string
}

interface KnowledgeGapsProps {
  gaps: KnowledgeGap[]
}

function KnowledgeGaps({ gaps }: KnowledgeGapsProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white [box-shadow:var(--card-shadow)] p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <Zap className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Generate from Knowledge Gaps
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Create policies based on unanswered worker questions
            </p>
          </div>
        </div>
        <Button className="bg-amber-500 hover:bg-amber-600 text-gray-900 border-transparent">
          <Zap className="mr-1.5 h-4 w-4" />
          Analyze Gaps
        </Button>
      </div>

      {gaps.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No knowledge gaps detected yet"
          description="Knowledge gaps will appear here when workers ask questions that your training documents don't cover."
        />
      ) : (
        <div>
          {gaps.map((gap) => (
            <div
              key={gap.id}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="text-sm text-gray-900">
                  {gap.question}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {gap.category}
                </p>
              </div>
              <span className="text-sm font-medium text-gray-500 shrink-0 ml-4">
                {gap.frequency} asks
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { KnowledgeGaps }
export type { KnowledgeGapsProps, KnowledgeGap }
