'use client'

import { FileText, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'
import { EmptyState } from '@/components/dashboard/shared/EmptyState'

interface DocumentItem {
  id: string
  name: string
  type: string
  size: string
  uploadDate: string
}

interface DocumentsTableProps {
  documents: DocumentItem[]
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const TYPE_BADGE_CLASSES: Record<string, string> = {
  PDF: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-transparent',
  Word: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-[#0060F0] border-transparent',
  Excel: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border-transparent',
  Text: 'bg-gray-100 text-gray-600 dark:bg-white dark:text-gray-400 border-transparent',
}

function DocumentsTable({ documents }: DocumentsTableProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-200 bg-white dark:bg-[#ffffff] [box-shadow:var(--card-shadow)] p-5">
      <SectionHeader
        title={`${documents.length} Documents`}
        action={
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents uploaded"
          description="Upload training documents, safety manuals, or policies. They'll appear here once added."
        />
      ) : (
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 hover:bg-transparent dark:border-gray-200">
              <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Name
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Type
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Size
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Uploaded
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow
                key={doc.id}
                className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-200 dark:hover:bg-white/50"
              >
                <TableCell className="text-sm font-medium text-gray-900 dark:text-gray-900">
                  {doc.name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={TYPE_BADGE_CLASSES[doc.type] ?? TYPE_BADGE_CLASSES.Text}
                  >
                    {doc.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                  {doc.size}
                </TableCell>
                <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(doc.uploadDate)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      )}
    </div>
  )
}

export { DocumentsTable }
export type { DocumentsTableProps, DocumentItem }
