'use client'

import { AlertMetrics, MOCK_ALERTS } from './AlertMetrics'
import { AlertCharts } from './AlertCharts'
import { AlertsTable } from './AlertsTable'

interface AlertsTabProps {
  showMockData?: boolean
}

function AlertsTab({ showMockData = false }: AlertsTabProps) {
  const alerts = showMockData ? MOCK_ALERTS : []

  return (
    <div className="space-y-6">
      <AlertMetrics alerts={alerts} />
      <AlertCharts alerts={alerts} />
      <AlertsTable alerts={alerts} />
    </div>
  )
}

export { AlertsTab }
export type { AlertsTabProps }
