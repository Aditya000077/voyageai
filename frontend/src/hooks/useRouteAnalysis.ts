// src/hooks/useRouteAnalysis.ts
// Custom hook that manages route comparison + crowd + ETA state

import { useState, useEffect, useCallback } from 'react'
import {
  fetchRoutes,
  fetchETA,
  fetchCrowdAnalysis,
  RouteAnalysisResult,
  ETAResult,
  CrowdAnalysisResult,
  RouteOption,
} from '../services/navigationApi'
import { parseCoordsString } from '../utils/geoUtils'
import { DESTINATIONS } from '../data/destinations'

export interface UseRouteAnalysisReturn {
  routeData: RouteAnalysisResult | null
  etaData: ETAResult | null
  crowdData: CrowdAnalysisResult | null
  selectedRoute: RouteOption | null
  loading: boolean
  error: string | null
  selectedDestId: number
  setSelectedDestId: (id: number) => void
  selectRoute: (routeName: string) => void
  refresh: () => void
  lastUpdated: Date | null
}

export function useRouteAnalysis(
  userLat: number | null,
  userLng: number | null,
  userCity: string | null = null,
): UseRouteAnalysisReturn {
  const [selectedDestId, setSelectedDestId] = useState(DESTINATIONS[0]?.id ?? 1)
  const [routeData, setRouteData] = useState<RouteAnalysisResult | null>(null)
  const [etaData, setEtaData] = useState<ETAResult | null>(null)
  const [crowdData, setCrowdData] = useState<CrowdAnalysisResult | null>(null)
  const [selectedRouteName, setSelectedRouteName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const originLat = userLat ?? 12.6823
  const originLng = userLng ?? 79.9800

  const selectedDest = DESTINATIONS.find((d) => d.id === selectedDestId) ?? DESTINATIONS[0]

  const runAnalysis = useCallback(async () => {
    if (!selectedDest) return
    setLoading(true)
    setError(null)

    try {
      const coords = parseCoordsString(selectedDest.coords)
      if (!coords) throw new Error('Could not parse destination coordinates')

      const [routes, crowd] = await Promise.all([
        fetchRoutes(originLat, originLng, coords.latitude, coords.longitude, selectedDest.city, userCity || ''),
        fetchCrowdAnalysis(originLat, originLng, selectedDest.city),
      ])

      setRouteData(routes)
      setCrowdData(crowd)

      // Auto-select recommended route and fetch its ETA
      const recommended = routes.routes.find((r) => r.is_recommended) ?? routes.routes[0]
      setSelectedRouteName(recommended.name)

      const eta = await fetchETA(
        recommended.distance_km,
        recommended.crowd_level,
        routes.is_long_haul,
      )
      setEtaData(eta)
      setLastUpdated(new Date())
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Navigation analysis failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [selectedDestId, originLat, originLng, userCity]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    runAnalysis()
    // Auto-refresh every 60 seconds to simulate live crowd updates
    const interval = setInterval(runAnalysis, 60_000)
    return () => clearInterval(interval)
  }, [runAnalysis])

  const selectRoute = useCallback(
    async (routeName: string) => {
      if (!routeData) return
      setSelectedRouteName(routeName)
      const route = routeData.routes.find((r) => r.name === routeName)
      if (!route) return
      setLoading(true)
      try {
        const eta = await fetchETA(route.distance_km, route.crowd_level, routeData.is_long_haul)
        setEtaData(eta)
      } catch {
        // keep previous ETA on error
      } finally {
        setLoading(false)
      }
    },
    [routeData],
  )

  const selectedRoute =
    routeData?.routes.find((r) => r.name === selectedRouteName) ?? routeData?.routes[0] ?? null

  return {
    routeData,
    etaData,
    crowdData,
    selectedRoute,
    loading,
    error,
    selectedDestId,
    setSelectedDestId,
    selectRoute,
    refresh: runAnalysis,
    lastUpdated,
  }
}
