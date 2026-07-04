'use client'

import { useRef } from 'react'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'
import { Download } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface QRCodeModalProps {
  joinCode: string
  smsNumber: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function QRCodeModal({ joinCode, smsNumber, open, onOpenChange }: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const normalizedNumber = smsNumber.replace(/[^0-9+]/g, '')
  const qrValue = `sms:${normalizedNumber}?body=${encodeURIComponent(`JOIN ${joinCode}`)}`

  function handleDownload() {
    try {
      const canvas = canvasRef.current
      if (!canvas) return
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = 'sidekick-qr-code.png'
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      // Silently fail — canvas may not be ready
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Team QR Code</DialogTitle>
          <DialogDescription>
            Workers scan this code to open their default SMS app with your join text prefilled
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center rounded-lg bg-white p-4">
          <QRCodeSVG value={qrValue} size={200} level="M" />
        </div>

        <div style={{ display: 'none' }}>
          <QRCodeCanvas
            ref={canvasRef}
            value={qrValue}
            size={200}
            level="M"
          />
        </div>

        <div className="text-center text-xs text-gray-500">
          Opens a text to {smsNumber} with <span className="font-mono">JOIN {joinCode}</span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-1.5 h-4 w-4" />
            Download PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { QRCodeModal }
export type { QRCodeModalProps }
