'use client'

import { HardDrive, Cloud, Building2, Monitor } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'

interface IntegrationItem {
  id: string
  name: string
  description: string
  icon: LucideIcon
  connected: boolean
}

const INTEGRATIONS: IntegrationItem[] = [
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Import documents from Google Drive',
    icon: HardDrive,
    connected: false,
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Import documents from Dropbox',
    icon: Cloud,
    connected: false,
  },
  {
    id: 'gusto',
    name: 'Gusto',
    description: 'Import documents from Gusto',
    icon: Building2,
    connected: false,
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    description: 'Import documents from Microsoft 365',
    icon: Monitor,
    connected: false,
  },
]

interface IntegrationsRowProps {}

function IntegrationsRow({}: IntegrationsRowProps) {
  return (
    <div>
      <SectionHeader title="Import from Integrations" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {INTEGRATIONS.map((integration) => {
          const Icon = integration.icon
          return (
            <div
              key={integration.id}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {integration.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {integration.description}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Connect
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { IntegrationsRow }
export type { IntegrationsRowProps }
