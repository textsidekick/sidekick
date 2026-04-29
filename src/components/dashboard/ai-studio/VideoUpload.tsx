'use client'

import { useRef, useState } from 'react'
import { Upload, Video } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoUploadProps {}

function VideoUpload({}: VideoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] p-5">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
          <Video className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Video Walkthrough
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Upload a video walkthrough of your facility to train the AI
          </p>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept=".mp4,.mov"
        className="hidden"
      />
      <div
        className={cn(
          'border-2 border-dashed rounded-xl bg-white dark:bg-[var(--card-bg)] min-h-[180px] flex flex-col items-center justify-center gap-3 transition-colors duration-150 cursor-pointer',
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
        <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500" />
        <div className="text-center">
          <p className="text-base font-medium text-gray-700 dark:text-gray-300">
            Upload facility walkthrough video
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            MP4, MOV up to 100MB &middot; 1-5 minutes recommended
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          💡 Tips for best results:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-sm text-gray-500 dark:text-gray-400">
          <li>Walk through each area at a steady pace</li>
          <li>Narrate what you&apos;re showing as you go</li>
          <li>Cover all key work areas and equipment</li>
          <li>Keep the video between 1-5 minutes</li>
        </ul>
      </div>
    </div>
  )
}

export { VideoUpload }
export type { VideoUploadProps }
