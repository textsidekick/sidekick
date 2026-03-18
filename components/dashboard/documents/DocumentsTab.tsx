'use client'

import { UploadZone } from './UploadZone'
import { IntegrationsRow } from './IntegrationsRow'
import { DocumentsTable, MOCK_DOCUMENTS } from './DocumentsTable'

interface DocumentsTabProps {
  showMockData?: boolean
}

function DocumentsTab({ showMockData = false }: DocumentsTabProps) {
  const documents = showMockData ? MOCK_DOCUMENTS : []

  return (
    <div className="space-y-6">
      <UploadZone />
      <IntegrationsRow />
      <DocumentsTable documents={documents} />
    </div>
  )
}

export { DocumentsTab }
export type { DocumentsTabProps }
