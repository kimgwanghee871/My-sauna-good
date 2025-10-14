'use client'

import { useEffect, useState } from 'react'

interface ToastData {
  type: 'info' | 'error' | 'success' | 'warning'
  msg: string
  id: string
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  useEffect(() => {
    const handleToast = (e: any) => {
      const { type, msg } = e.detail || {}
      if (!type || !msg) return
      
      const id = Math.random().toString(36).substr(2, 9)
      const toast: ToastData = { type, msg, id }
      
      setToasts(prev => [...prev, toast])
      
      // 3초 후 자동 제거
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 3000)
    }

    window.addEventListener('toast', handleToast)
    return () => window.removeEventListener('toast', handleToast)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-slide-up ${
            toast.type === 'info' ? 'bg-blue-600' :
            toast.type === 'error' ? 'bg-red-600' :
            toast.type === 'success' ? 'bg-green-600' :
            'bg-yellow-600'
          }`}
        >
          {toast.msg}
        </div>
      ))}
    </div>
  )
}