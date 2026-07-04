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

function RegistrationCard({ joinCode, smsNumber = '+1 (888) 707-4659' }: RegistrationCardProps) {
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
    <div className="rounded-xl border border-gray-200 bg-white p-5">
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
          <p className="text-xs text-gray-400">
            Workers text this to join:
          </p>
          {joinCode ? (
            <p className="font-mono text-2xl font-bold text-[#C96442] tracking-wider">
              JOIN {joinCode}
            </p>
          ) : (
            <div className="h-8 w-32 bg-gray-100 animate-pulse rounded" />
          )}
          <p className="text-xs text-gray-400">
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

      {joinCode && (
        <QRCodeModal
          joinCode={joinCode}
          smsNumber={smsNumber}
          open={qrOpen}
          onOpenChange={setQrOpen}
        />
      )}
    </div>
  )
}

export { RegistrationCard }
export type { RegistrationCardProps }
