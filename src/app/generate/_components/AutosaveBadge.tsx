'use client'

import { useEffect, useState } from 'react'

interface AutosaveBadgeProps {
  saved: boolean
  className?: string
}

export default function AutosaveBadge({ 
  saved, 
  className = '' 
}: AutosaveBadgeProps) {
  if (saved) {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-2 text-sm">
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
          <span className="text-green-700 font-medium">저장 완료(3초마다 자동)</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-2 text-sm text-gray-500">
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
        <span>자동 저장 준비 중…</span>
      </div>
    </div>
  )
}