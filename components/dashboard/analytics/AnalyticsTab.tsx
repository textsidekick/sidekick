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

function AnalyticsTab() {
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
          items={[]}
          emptyTitle="No questions yet"
          emptyDescription="Questions from your workers will appear here as they interact with Sidekick throughout the day."
          showSeeAll
          onSeeAll={() => {}}
        />
        <FeedCard
          title="Activity"
          icon={Activity}
          items={[]}
          emptyTitle="No recent activity"
          emptyDescription="Team activity like document uploads, worker registrations, and alert resolutions will show up here."
        />
      </div>
    </div>
  )
}

export { AnalyticsTab }
