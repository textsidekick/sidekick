'use client'

import { BadgeCheck, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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

type WorkerStatus = 'verified' | 'pending'

interface WorkerItem {
  id: string
  name: string
  phone: string
  joinDate: string // ISO date string
  status: WorkerStatus
}

interface WorkersTableProps {
  workers: WorkerItem[]
}

function formatJoinDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function WorkersTable({ workers }: WorkersTableProps) {
  const verifiedCount = workers.filter((w) => w.status === 'verified').length

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-200 bg-white dark:bg-[#ffffff] [box-shadow:var(--card-shadow)] p-5">
      <SectionHeader
        title={`${workers.length} Workers`}
        action={
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            {verifiedCount} verified
          </span>
        }
      />

      {workers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No workers registered yet"
          description="Workers will appear here once they text your JOIN code to register with Sidekick."
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
                Phone
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Joined
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.map((worker) => (
              <TableRow
                key={worker.id}
                className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-200 dark:hover:bg-white/50"
              >
                <TableCell className="text-sm font-medium text-gray-900 dark:text-gray-900">
                  {worker.name}
                </TableCell>
                <TableCell className="font-mono text-sm text-gray-500 dark:text-gray-400">
                  {worker.phone}
                </TableCell>
                <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                  {formatJoinDate(worker.joinDate)}
                </TableCell>
                <TableCell>
                  {worker.status === 'verified' ? (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-transparent"
                    >
                      <BadgeCheck className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-600 dark:bg-white dark:text-gray-400 border-transparent"
                    >
                      Pending
                    </Badge>
                  )}
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

export { WorkersTable }
export type { WorkersTableProps, WorkerItem }
