'use client'

import { RegistrationCard } from './RegistrationCard'
import { WorkersTable } from './WorkersTable'

interface WorkersTabProps {
  joinCode?: string;
}

function WorkersTab({ joinCode }: WorkersTabProps) {
  return (
    <div className="space-y-6">
      <RegistrationCard joinCode={joinCode} />
      <WorkersTable workers={[]} />
    </div>
  )
}

export { WorkersTab }
export type { WorkersTabProps }
