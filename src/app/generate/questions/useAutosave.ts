import { useEffect, useRef, useState } from 'react'

export function useAutosave<T>(key: string, data: T, delay = 3000) {
  const [saved, setSaved] = useState(false)
  const timer = useRef<NodeJS.Timeout | null>(null)
  const lastSavedData = useRef<string>('')

  useEffect(() => {
    const dataString = JSON.stringify(data)
    
    // Skip if data hasn't changed
    if (dataString === lastSavedData.current) {
      return
    }
    
    // Clear existing timer
    if (timer.current) {
      clearTimeout(timer.current)
    }
    
    // Set new timer
    timer.current = setTimeout(() => {
      try {
        localStorage.setItem(key, dataString)
        lastSavedData.current = dataString
        setSaved(true)
        
        // Hide save indicator after 2 seconds
        setTimeout(() => setSaved(false), 2000)
        
        // Analytics tracking could go here
        // analytics.track('qna_autosave', { key, completed: filled, elapsed: delay/1000 })
      } catch (error) {
        console.error('Autosave failed:', error)
        // toast.error('자동 저장에 실패했어요.')
      }
    }, delay)
    
    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }
  }, [key, data, delay])

  // Load saved data function
  const loadSavedData = (): T | null => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Failed to load saved data:', error)
      return null
    }
  }

  return { saved, loadSavedData }
}