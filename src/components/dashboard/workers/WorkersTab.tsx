'use client'

import { RegistrationCard } from './RegistrationCard'
import { WorkersTable, MOCK_WORKERS } from './WorkersTable'

interface WorkersTabProps {
  joinCode?: string;
  showMockData?: boolean
}

function WorkersTab({ joinCode, showMockData = false }: WorkersTabProps) {
  const workers = showMockData ? MOCK_WORKERS : []

  return (
    <div className="space-y-6">
      <RegistrationCard joinCode={joinCode} />
      <WorkersTable workers={workers} />
    </div>
  )
}

export { WorkersTab }
export type { WorkersTabProps }
