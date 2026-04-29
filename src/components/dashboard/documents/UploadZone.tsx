'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadZoneProps {}

function UploadZone({}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
        multiple
        className="hidden"
      />
      <div
        className={cn(
          'border-2 border-dashed rounded-xl bg-white dark:bg-[var(--card-bg)] min-h-[160px] flex flex-col items-center justify-center gap-3 transition-colors duration-150 cursor-pointer',
          isDragOver
            ? 'border-blue-400 bg-blue-50/30 dark:border-blue-600'
            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50/30 dark:hover:border-blue-700'
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Drop files here or click to upload
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            PDF, Word, Excel, or text files
          </p>
        </div>
      </div>
    </div>
  )
}

export { UploadZone }
export type { UploadZoneProps }
