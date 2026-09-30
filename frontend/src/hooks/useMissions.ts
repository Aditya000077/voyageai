import { useState, useEffect } from 'react'
import { missionService } from '../services/missionService'
import { Mission } from '../types'
import { MISSIONS } from '../data/missions'

interface UseMissionsReturn {
  missions: Mission[]
  loading: boolean
  error: string | null
}

export function useMissions(): UseMissionsReturn {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchMissions = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await missionService.getAll()
        if (!cancelled) {
          setMissions(data.results.length > 0 ? data.results : MISSIONS)
        }
      } catch {
        if (!cancelled) {
          console.warn('[VoyageAI] Backend unavailable — using local mission data.')
          setMissions(MISSIONS)
          setError(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchMissions()
    return () => { cancelled = true }
  }, [])

  return { missions, loading, error }
}
