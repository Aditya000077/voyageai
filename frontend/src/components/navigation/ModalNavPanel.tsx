import React, { useState, useEffect } from 'react'
import { RouteCard } from './RouteCard'
import { ETAPanel } from './ETAPanel'
import { CrowdHeatmap } from './CrowdHeatmap'
import { CrowdAlertBanner } from './CrowdAlertBanner'
import { fetchRoutes, fetchETA, fetchCrowdAnalysis } from '../../services/navigationApi'
import type { RouteAnalysisResult, ETAResult, CrowdAnalysisResult, RouteOption } from '../../services/navigationApi'
import { Cpu, MapPin, RefreshCw, Loader2, Navigation } from 'lucide-react'

interface ModalNavPanelProps {
  /** The original user search query (e.g. "jaipur" or "paris luxury trip") */
  searchQuery: string
  userLat: number | null
  userLng: number | null
  userCity: string | null
}

/** Extract the most meaningful city/place word from a free-text query or itinerary destination string */
function extractCityFromQuery(query: string | undefined): string {
  if (!query) return ''

  // Handle destination strings with arrows like "Chengalpattu → Chennai" or "A → B"
  // Take the LAST segment (final destination), not the origin
  if (query.includes('→') || query.includes('->')) {
    const parts = query.split(/→|->/).map((s) => s.trim())
    query = parts[parts.length - 1] || parts[0]
  }

  // Handle itinerary destination strings like "Jaipur & Royal Rajasthan Palaces, India"
  // or "Agra Mughal Heritage & Taj Mahal Wonder, India"
  // Take the first meaningful word(s) before & or comma as the primary city
  if (query.includes(',')) {
    query = query.split(',')[0].trim()
  }
  if (query.includes(' & ')) {
    query = query.split(' & ')[0].trim()
  }
  if (query.includes('&')) {
    query = query.split('&')[0].trim()
  }

  // Strip common travel filler words
  const filler = /\b(luxury|trip|tour|visit|days?|nights?|under|budget|global|expedition|itinerary|heritage|ryokan|safari|beach|traditional|bespoke|private|5-star|tea|ceremony|bamboo|grooves?|chalets?|ski|hotel|resort|weeks?|planning|planner|ai|voyage|vueling|flight|fly|travel|travelling|mughal|wonder|royal|rajasthan|palaces?|imperial|sacred|valley|lake|coral|atolls?|golden|circle|nile|river|national|park|wildlife)\b/gi
  const cleaned = query.replace(filler, ' ').replace(/\s+/g, ' ').trim()

  // Take only the first meaningful word (the city name)
  const firstWord = cleaned.split(' ')[0]
  return firstWord || query.split(' ')[0] || query
}

/** Geocode a place name → { lat, lng, displayName } using OpenStreetMap Nominatim */
async function geocodePlace(query: string): Promise<{ lat: number; lng: number; name: string } | null> {
  try {
    const city = extractCityFromQuery(query)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.length) return null
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      name: data[0].display_name?.split(',')[0] ?? city,
    }
  } catch {
    return null
  }
}

export const ModalNavPanel: React.FC<ModalNavPanelProps> = ({
  searchQuery,
  userLat,
  userLng,
  userCity,
}) => {
  const [routeData, setRouteData]    = useState<RouteAnalysisResult | null>(null)
  const [etaData, setEtaData]        = useState<ETAResult | null>(null)
  const [crowdData, setCrowdData]    = useState<CrowdAnalysisResult | null>(null)
  const [selectedRoute, setSelected] = useState<RouteOption | null>(null)
  const [loading, setLoading]        = useState(false)
  const [error, setError]            = useState<string | null>(null)
  const [resolvedDest, setResolvedDest] = useState<{ lat: number; lng: number; name: string } | null>(null)

  const originLat = userLat ?? 12.6823
  const originLng = userLng ?? 79.9800

  const run = async (query: string) => {
    setLoading(true)
    setError(null)
    try {
      // Step 1: Geocode the user's query to real coordinates
      const cleanCity = extractCityFromQuery(query)
      let geo = await geocodePlace(query)
      // If first attempt fails, try with just the cleaned city word directly
      if (!geo && cleanCity && cleanCity !== query) {
        geo = await geocodePlace(cleanCity)
      }
      if (!geo) throw new Error(`Navigation unavailable — could not locate "${cleanCity}" on the map`)
      setResolvedDest(geo)

      // Step 2: Route calculation + crowd analysis in parallel
      const [routes, crowd] = await Promise.all([
        fetchRoutes(originLat, originLng, geo.lat, geo.lng, geo.name, userCity || ''),
        fetchCrowdAnalysis(originLat, originLng, geo.name),
      ])
      setRouteData(routes)
      setCrowdData(crowd)

      // Step 3: ETA for recommended route
      const rec = routes.routes.find((r) => r.is_recommended) ?? routes.routes[0]
      setSelected(rec)
      const eta = await fetchETA(rec.distance_km, rec.crowd_level, routes.is_long_haul, routes.is_regional)
      setEtaData(eta)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Navigation engine unavailable')
    } finally {
      setLoading(false)
    }
  }

  const selectRoute = async (routeName: string) => {
    if (!routeData) return
    const route = routeData.routes.find((r) => r.name === routeName)
    if (!route) return
    setSelected(route)
    setLoading(true)
    try {
      const eta = await fetchETA(route.distance_km, route.crowd_level, routeData.is_long_haul)
      setEtaData(eta)
    } finally {
      setLoading(false)
    }
  }

  // Re-run whenever searchQuery changes
  useEffect(() => { if (searchQuery) run(searchQuery) }, [searchQuery]) // eslint-disable-line

  const alertFrom = routeData?.routes.find((r) => !r.is_recommended && r.crowd_level === 'HIGH')
  const alertTo   = routeData?.routes.find((r) => r.is_recommended)
  const showAlert = routeData?.crowd_alert && selectedRoute?.is_recommended && !!alertFrom

  // Display name: use the geocoded city name
  const destDisplayName = resolvedDest?.name ?? extractCityFromQuery(searchQuery)

  return (
    <div className="space-y-5">
      {/* ─── Section divider header ─── */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            <Cpu size={14} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
              SMART NAVIGATION INTELLIGENCE
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin size={11} className="text-emerald-400" />
              <span>
                <strong className="text-white">{userCity || 'Mumbai'}</strong>
                {' → '}
                <strong className="text-white">{destDisplayName}</strong>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => run(searchQuery)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer"
          style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', color: '#10B981' }}
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl border border-red-500/25 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
          <Navigation size={13} className="shrink-0" />
          {error} — ensure Django is running on port 8000.
        </div>
      )}

      {/* Crowd alert banner */}
      {showAlert && alertFrom && alertTo && (
        <CrowdAlertBanner
          show={showAlert}
          fromRoute={alertFrom.name}
          toRoute={alertTo.name}
          savingsFormatted={routeData?.savings_formatted ?? ''}
          onSwitch={() => selectRoute(alertTo.name)}
        />
      )}

      {/* Loading skeleton */}
      {loading && !routeData && (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          ))}
        </div>
      )}

      {/* ─── Route Cards ─── */}
      {routeData && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              ROUTE OPTIONS —{' '}
              {!routeData.is_long_haul
                ? 'Local Road / Rail'
                : routeData.is_regional
                ? 'Regional Flight'
                : 'Long-Haul Flight'}{' '}
              · {routeData.distance_km.toLocaleString()} km
            </span>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              AI Best: {routeData.recommended_route}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {routeData.routes.map((route) => (
              <RouteCard
                key={route.name}
                route={route}
                isSelected={selectedRoute?.name === route.name}
                onSelect={() => selectRoute(route.name)}
              />
            ))}
          </div>
        </>
      )}

      {/* ─── ETA + Heatmap side-by-side ─── */}
      {(etaData || crowdData) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {etaData && <ETAPanel eta={etaData} loading={loading && !!etaData} />}
          {crowdData && <CrowdHeatmap heatmap={crowdData.heatmap} venue={crowdData.venue} />}
        </div>
      )}

      {/* ─── 6-Hour Crowd Forecast mini bar chart ─── */}
      {crowdData?.timeline && (
        <div
          className="rounded-2xl p-4 border"
          style={{ background: 'rgba(2,6,23,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400">
              6-HOUR CROWD FORECAST — {resolvedDest?.name ?? extractCityFromQuery(searchQuery)}
            </span>
            <span className="text-[10px] text-slate-600 font-mono">
              Peak: {crowdData.timeline.peak_in_hours}
            </span>
          </div>
          <div className="flex items-end gap-1.5 h-16">
            {crowdData.timeline.timeline.map((point) => {
              const pct = Math.min(100, (point.visitors / 2000) * 100)
              return (
                <div key={point.label} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-full rounded-t-sm transition-all duration-500"
                    style={{ height: `${Math.max(6, pct)}%`, background: point.color, opacity: 0.8 }}
                    title={`${point.visitors} visitors`}
                  />
                  <span className="text-[8px] text-slate-500 font-mono">{point.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
