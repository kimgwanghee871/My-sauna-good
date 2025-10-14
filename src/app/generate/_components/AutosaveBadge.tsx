'use client'

import { useEffect, useState } from 'react'

interface AutosaveBadgeProps {
  isAutoSaving: boolean
  lastSaved: Date | null
  className?: string
}

export default function AutosaveBadge({ 
  isAutoSaving, 
  lastSaved, 
  className = '' 
}: AutosaveBadgeProps) {
  const [timeSinceLastSave, setTimeSinceLastSave] = useState<string>('')

  // Update time since last save every minute
  useEffect(() => {
    if (!lastSaved) return

    const updateTime = () => {
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - lastSaved.getTime()) / (1000 * 60))
      
      if (diffInMinutes === 0) {
        setTimeSinceLastSave('방금 전')
      } else if (diffInMinutes < 60) {
        setTimeSinceLastSave(`${diffInMinutes}분 전`)
      } else if (diffInMinutes < 1440) { // Less than 24 hours
        const hours = Math.floor(diffInMinutes / 60)
        setTimeSinceLastSave(`${hours}시간 전`)
      } else {
        setTimeSinceLastSave(lastSaved.toLocaleDateString())
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [lastSaved])

  if (isAutoSaving) {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-2 text-sm text-blue-600">
          <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
          <span className="font-medium">저장 중</span>
        </div>
      </div>
    )
  }

  if (lastSaved) {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <svg 
            className="w-3 h-3 text-green-500" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
          <span>
            <span className="font-medium text-green-600">저장됨</span>
            <span className="ml-1 text-gray-500">• {timeSinceLastSave}</span>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <svg 
          className="w-3 h-3" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <span>저장되지 않음</span>
      </div>
    </div>
  )
}