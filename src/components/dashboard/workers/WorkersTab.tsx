'use client'

import { RegistrationCard } from './RegistrationCard'
import { WorkersTable, MOCK_WORKERS } from './WorkersTable'

interface WorkersTabProps {
  showMockData?: boolean
}

function WorkersTab({ showMockData = false }: WorkersTabProps) {
  const workers = showMockData ? MOCK_WORKERS : []

  return (
    <div className="space-y-6">
      <RegistrationCard />
      <WorkersTable workers={workers} />
    </div>
  )
}

export { WorkersTab }
export type { WorkersTabProps }
