import { useState, useEffect } from 'react'
import { destinationService } from '../services/destinationService'
import { Destination } from '../types'
import { DESTINATIONS } from '../data/destinations'

interface UseDestinationsReturn {
  destinations: Destination[]
  loading: boolean
  error: string | null
}

export function useDestinations(): UseDestinationsReturn {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchDestinations = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await destinationService.getAll()
        if (!cancelled) {
          // If backend returns data use it, otherwise fall back to local mock data
          setDestinations(data.results.length > 0 ? data.results : DESTINATIONS)
        }
      } catch {
        if (!cancelled) {
          // Graceful fallback: use local mock data if backend is unreachable
          console.warn('[VoyageAI] Backend unavailable — using local destination data.')
          setDestinations(DESTINATIONS)
          setError(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchDestinations()
    return () => { cancelled = true }
  }, [])

  return { destinations, loading, error }
}
