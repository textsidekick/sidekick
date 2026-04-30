'use client'

import { useState } from 'react'
import { QrCode, Copy, Check } from 'lucide-react'
import { SectionHeader } from '@/components/dashboard/shared/SectionHeader'
import { Button } from '@/components/ui/button'
import { QRCodeModal } from '@/components/dashboard/workers/QRCodeModal'


interface RegistrationCardProps {
  joinCode?: string;
  smsNumber?: string;
}

function RegistrationCard({ joinCode = 'ABC123', smsNumber = '+1 (888) 707-4659' }: RegistrationCardProps) {
  const [qrOpen, setQrOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    try {
      navigator.clipboard.writeText(`JOIN ${joinCode}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may not be available
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-200 bg-white dark:bg-[#ffffff] [box-shadow:var(--card-shadow)] p-5">
      <SectionHeader
        title="Worker Registration"
        action={
          <Button variant="default" onClick={() => setQrOpen(true)}>
            <QrCode className="mr-1.5 h-4 w-4" />
            Show QR Code
          </Button>
        }
      />

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Workers text this to join:
          </p>
          <p className="font-mono text-2xl font-bold text-[#C96442] dark:text-[#C96442] tracking-wider">
            JOIN {joinCode}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Send to: {smsNumber}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      <QRCodeModal
        joinCode={joinCode}
        open={qrOpen}
        onOpenChange={setQrOpen}
      />
    </div>
  )
}

export { RegistrationCard }
export type { RegistrationCardProps }
