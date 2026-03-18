'use client'

import {
  MessageSquare,
  Target,
  AlertTriangle,
  Activity,
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/shared/MetricCard'
import { HealthScoreCard } from './HealthScoreCard'
import { CategorySummary } from './CategorySummary'
import { AnswerSourcesChart } from './AnswerSourcesChart'
import { TopGapsTable } from './TopGapsTable'
import { QuestionsPerHourChart } from './QuestionsPerHourChart'
import { QuestionsChart } from './QuestionsChart'
import { ResolutionChart } from './ResolutionChart'
import { FeedCard } from './FeedCard'
import type { FeedItem } from './FeedCard'

const MOCK_RECENT_QUESTIONS: FeedItem[] = [
  { id: 'q1', text: 'How do I report a safety hazard in the warehouse?', timestamp: '2 min ago', category: 'Safety' },
  { id: 'q2', text: 'What is the overtime policy for weekends?', timestamp: '15 min ago', category: 'HR' },
  { id: 'q3', text: 'Where are the fire extinguishers on the loading dock?', timestamp: '32 min ago', category: 'Safety' },
  { id: 'q4', text: 'Can I swap my Tuesday shift with another worker?', timestamp: '1 hour ago', category: 'Scheduling' },
  { id: 'q5', text: 'What PPE is required for the chemical storage area?', timestamp: '2 hours ago', category: 'Safety' },
  { id: 'q6', text: 'How do I request time off for next week?', timestamp: '3 hours ago', category: 'HR' },
  { id: 'q7', text: 'What is the maximum weight for manual lifting?', timestamp: '4 hours ago', category: 'Safety' },
]

const MOCK_ACTIVITY: FeedItem[] = [
  { id: 'a1', text: 'Maria Garcia uploaded "Safety Training Manual"', timestamp: '10 min ago' },
  { id: 'a2', text: 'New worker registered: James Wilson', timestamp: '1 hour ago' },
  { id: 'a3', text: 'Alert #47 resolved by Team Lead', timestamp: '2 hours ago' },
  { id: 'a4', text: 'Knowledge base updated: Forklift Safety Guide', timestamp: '3 hours ago' },
  { id: 'a5', text: 'Carlos Rodriguez completed onboarding', timestamp: '5 hours ago' },
  { id: 'a6', text: 'New document synced from Google Drive', timestamp: 'Yesterday' },
  { id: 'a7', text: 'Weekly analytics report generated', timestamp: 'Yesterday' },
]

interface AnalyticsTabProps {
  showMockData?: boolean
}

function AnalyticsTab({ showMockData = false }: AnalyticsTabProps) {
  return (
    <div className="space-y-6">
      {/* Row 1: 4 KPI metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Questions Today"
          value={187}
          icon={MessageSquare}
          subtext="1,247 this week"
        />
        <MetricCard
          label="Answer Accuracy"
          value="94.2%"
          icon={Target}
          subtext="94.2% answered"
        />
        <MetricCard
          label="Open Issues"
          value={7}
          icon={AlertTriangle}
          iconClassName="h-5 w-5 text-amber-500"
          subtext="View all →"
        />
        <HealthScoreCard score={87} />
      </div>

      {/* Row 2: Questions per Hour chart (12a–11p, time range selector, refresh) */}
      <QuestionsPerHourChart />

      {/* Row 3: Three-column insight cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CategorySummary />
        <AnswerSourcesChart />
        <TopGapsTable />
      </div>

      {/* Row 4: Deep charts — questions by category + resolution rate */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <QuestionsChart />
        <ResolutionChart />
      </div>

      {/* Row 5: Feed cards — Recent Questions + Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FeedCard
          title="Recent Questions"
          icon={MessageSquare}
          items={showMockData ? MOCK_RECENT_QUESTIONS : []}
          emptyTitle="No questions yet"
          emptyDescription="Questions from your workers will appear here as they interact with Sidekick throughout the day."
          showSeeAll
          onSeeAll={() => {}}
        />
        <FeedCard
          title="Activity"
          icon={Activity}
          items={showMockData ? MOCK_ACTIVITY : []}
          emptyTitle="No recent activity"
          emptyDescription="Team activity like document uploads, worker registrations, and alert resolutions will show up here."
        />
      </div>
    </div>
  )
}

export { AnalyticsTab }
