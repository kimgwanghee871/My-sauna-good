'use client'

import { useState } from 'react'
// Simple chevron icons (no external dependency)
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
)

interface QnaFieldProps {
  id: string
  label: string
  placeholder: string
  hint?: string
  why?: string
  how?: string
  example?: string
  type?: 'text' | 'textarea' | 'number'
  required?: boolean
  value: string
  onChange: (value: string) => void
  error?: string
  maxLength?: number
}

export default function QnaField({
  id,
  label,
  placeholder,
  hint,
  why,
  how,
  example,
  type = 'textarea',
  required = false,
  value,
  onChange,
  error,
  maxLength
}: QnaFieldProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isGuideExpanded, setIsGuideExpanded] = useState(false)
  const hasGuide = why || how || example
  
  const inputClasses = `
    w-full px-4 py-3 border rounded-lg transition-colors duration-200 
    ${error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
    }
    focus:ring-2 focus:outline-none
  `

  return (
    <div className="space-y-2">
      {/* 레이블 */}
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* 힌트 */}
      {hint && (
        <p className="text-sm text-gray-600" id={`${id}-hint`}>
          {hint}
        </p>
      )}

      {/* 가이드 (why/how/example) */}
      {hasGuide && (
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => setIsGuideExpanded(!isGuideExpanded)}
            className="w-full px-3 py-2 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            aria-expanded={isGuideExpanded}
            aria-controls={`${id}-guide`}
          >
            <span className="font-medium">💡 작성 가이드</span>
            {isGuideExpanded ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
          
          {isGuideExpanded && (
            <div id={`${id}-guide`} className="px-3 pb-3 space-y-2 border-t border-gray-100">
              {why && (
                <div>
                  <p className="text-xs font-medium text-blue-700 mb-1">왜 필요한가</p>
                  <p className="text-xs text-gray-600">{why}</p>
                </div>
              )}
              {how && (
                <div>
                  <p className="text-xs font-medium text-green-700 mb-1">이렇게 쓰면 좋아요</p>
                  <p className="text-xs text-gray-600">{how}</p>
                </div>
              )}
              {example && (
                <div>
                  <p className="text-xs font-medium text-purple-700 mb-1">예시</p>
                  <p className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded">
                    {example}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 입력 필드 */}
      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={inputClasses}
          rows={4}
          maxLength={maxLength}
          aria-describedby={[hint && `${id}-hint`, hasGuide && isGuideExpanded && `${id}-guide`].filter(Boolean).join(' ') || undefined}
          aria-invalid={!!error}
        />
      ) : (
        <input
          type={type}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={inputClasses}
          maxLength={maxLength}
          aria-describedby={[hint && `${id}-hint`, hasGuide && isGuideExpanded && `${id}-guide`].filter(Boolean).join(' ') || undefined}
          aria-invalid={!!error}
        />
      )}

      {/* 글자수 및 에러 */}
      <div className="flex justify-between items-center">
        <div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
        {maxLength && (
          <div className="text-xs text-gray-500">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  )
}