'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { type AttachmentFile } from '../../lib/schemas/qset.schema'

interface AttachmentConfig {
  title: string
  subtitle: string
  note: string
  recommend_badge: string
  allowed_mimes: string[]
  max_files: number
  max_total_mb: number
  cta_upload: string
  cta_remove: string
}

interface AttachmentSectionProps {
  rc: AttachmentConfig
  onChange: (files: AttachmentFile[]) => void
}

export default function AttachmentSection({ rc, onChange }: AttachmentSectionProps) {
  const [files, setFiles] = useState<AttachmentFile[]>([])
  const [busy, setBusy] = useState(false)

  // Supabase client 초기화 (환경변수 체크)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables not found')
    return <div className="p-4 text-red-600">Supabase 설정이 필요합니다.</div>
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // 검증
    const totalSize = files.reduce((sum, f) => sum + f.size, 0) + file.size
    
    if (files.length >= rc.max_files) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { type: 'error', msg: `최대 ${rc.max_files}개까지 첨부 가능합니다` }
      }))
      return
    }
    
    if (totalSize > rc.max_total_mb * 1024 * 1024) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { type: 'error', msg: `총 ${rc.max_total_mb}MB 이하로 제한됩니다` }
      }))
      return
    }
    
    if (!rc.allowed_mimes.includes(file.type)) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { type: 'error', msg: 'PDF/DOCX 형식만 허용됩니다' }
      }))
      return
    }

    setBusy(true)
    
    try {
      // 파일 업로드 경로 생성
      const timestamp = Date.now()
      const sanitizedName = file.name.replace(/\s/g, '_').replace(/[^a-zA-Z0-9._-]/g, '')
      const path = `user/${timestamp}_${sanitizedName}`
      
      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(path, file, { upsert: false })
      
      if (error) {
        throw error
      }
      
      // Public URL 생성
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${data.path}`
      
      // 새 파일 추가
      const newFile: AttachmentFile = {
        name: file.name,
        size: file.size,
        mime: file.type,
        url
      }
      
      const updatedFiles = [...files, newFile]
      setFiles(updatedFiles)
      onChange(updatedFiles)
      
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { type: 'success', msg: '파일이 성공적으로 업로드되었습니다' }
      }))
      
    } catch (error) {
      console.error('Upload error:', error)
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { type: 'error', msg: '업로드에 실패했습니다' }
      }))
    } finally {
      setBusy(false)
      // 파일 input 초기화
      e.target.value = ''
    }
  }

  function removeFile(index: number) {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onChange(updatedFiles)
  }

  return (
    <section className="border rounded-xl p-6 bg-gradient-to-br from-blue-50/30 to-indigo-50/20 border-blue-100">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-medium text-gray-900">
              {rc.title}
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              {rc.recommend_badge}
            </span>
          </div>
          <p className="text-sm text-gray-600">{rc.subtitle}</p>
        </div>
      </div>
      
      {/* Note */}
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-800">
          <span className="font-medium">📋 참고:</span> {rc.note}
        </p>
      </div>

      {/* Upload Area */}
      <div className="space-y-4">
        <div>
          <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
            <div className="text-center">
              <span className="text-sm text-gray-600">
                📎 {rc.cta_upload}
              </span>
              <span className="block text-xs text-gray-400 mt-1">
                PDF, DOCX (최대 {rc.max_total_mb}MB)
              </span>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx"
              onChange={handleUpload}
              disabled={busy || files.length >= rc.max_files}
            />
          </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">첨부된 파일</h4>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg">
                      {file.mime === 'application/pdf' ? '📄' : '📝'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)}MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    {rc.cta_remove}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Loading State */}
        {busy && (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">업로드 중...</span>
          </div>
        )}
      </div>
    </section>
  )
}