import { useState, useEffect, useCallback } from 'react'
import { healthService } from '../services/testimonialService'

type ApiStatus = 'checking' | 'online' | 'offline'

export function useApiStatus(pollIntervalMs = 30000) {
  const [status, setStatus] = useState<ApiStatus>('checking')
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const check = useCallback(async () => {
    try {
      await healthService.check()
      setStatus('online')
    } catch {
      setStatus('offline')
    } finally {
      setLastChecked(new Date())
    }
  }, [])

  useEffect(() => {
    check()
    const interval = setInterval(check, pollIntervalMs)
    return () => clearInterval(interval)
  }, [check, pollIntervalMs])

  return { status, lastChecked, refresh: check }
}
