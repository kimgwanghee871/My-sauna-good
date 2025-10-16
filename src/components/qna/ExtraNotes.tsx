'use client'

import { useState, useEffect } from 'react'

interface ExtraNotesConfig {
  extra_notes_label: string
  extra_notes_placeholder: string
}

interface ExtraNotesProps {
  rc: ExtraNotesConfig
  onChange: (notes: string) => void
  initialValue?: string
}

export default function ExtraNotes({ rc, onChange, initialValue = '' }: ExtraNotesProps) {
  const [notes, setNotes] = useState(initialValue)
  const [charCount, setCharCount] = useState(initialValue.length)
  
  const MAX_CHARS = 1000

  useEffect(() => {
    setNotes(initialValue)
    setCharCount(initialValue.length)
  }, [initialValue])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value
    if (value.length <= MAX_CHARS) {
      setNotes(value)
      setCharCount(value.length)
      onChange(value)
    }
  }

  return (
    <section className="border rounded-xl p-6 bg-gradient-to-br from-green-50/30 to-emerald-50/20 border-green-100">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          {rc.extra_notes_label}
        </h3>
        <p className="text-sm text-gray-600">
          AI가 참고할 수 있는 추가 맥락이나 강조하고 싶은 포인트를 자유롭게 작성해 주세요.
        </p>
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <textarea
          value={notes}
          onChange={handleChange}
          placeholder={rc.extra_notes_placeholder}
          className="w-full min-h-[120px] p-4 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-y"
          rows={5}
        />
        
        {/* Character Counter */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">
            💡 예시: "특히 환경 친화적인 측면을 강조해 주세요", "B2B 고객 중심으로 분석 부탁드립니다"
          </span>
          <span className={`font-medium ${charCount > MAX_CHARS * 0.9 ? 'text-orange-600' : 'text-gray-500'}`}>
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}자
          </span>
        </div>
      </div>
    </section>
  )
}