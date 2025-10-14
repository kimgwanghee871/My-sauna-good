'use client'

import { useState } from 'react'

interface QnaFieldProps {
  id: string
  label: string
  placeholder: string
  hint?: string
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
  type = 'textarea',
  required = false,
  value,
  onChange,
  error,
  maxLength
}: QnaFieldProps) {
  const [isFocused, setIsFocused] = useState(false)
  
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
          aria-describedby={hint ? `${id}-hint` : undefined}
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
          aria-describedby={hint ? `${id}-hint` : undefined}
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