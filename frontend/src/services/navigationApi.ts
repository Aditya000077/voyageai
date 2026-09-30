// src/services/navigationApi.ts
// API service for VoyageAI Smart Navigation endpoints

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export interface RouteOption {
  name: string
  label: string
  description: string
  distance_km: number
  base_duration_minutes: number
  base_duration_formatted: string
  crowd_level: 'LOW' | 'MEDIUM' | 'HIGH'
  crowd_label: string
  crowd_color: string
  crowd_delay_minutes: number
  traffic_delay_minutes: number
  wait_minutes: number
  total_minutes: number
  total_duration_formatted: string
  is_recommended: boolean
}

export interface RouteAnalysisResult {
  ok: boolean
  origin: { lat: number; lng: number }
  destination: { name: string; lat: number; lng: number }
  distance_km: number
  is_long_haul: boolean
  is_regional: boolean
  routes: RouteOption[]
  recommended_route: string
  savings_minutes: number
  savings_formatted: string
  crowd_alert: boolean
}

export interface ETABreakdown {
  label: string
  minutes: number
  formatted: string
  prefix: string
}

export interface ETAResult {
  ok: boolean
  distance_km: number
  crowd_level: 'LOW' | 'MEDIUM' | 'HIGH'
  crowd_color: string
  crowd_icon: string
  time_of_day: string
  breakdown: {
    base_travel: ETABreakdown
    traffic_delay: ETABreakdown
    crowd_delay: ETABreakdown
    entry_wait: ETABreakdown
  }
  total_minutes: number
  total_formatted: string
  confidence_range: string
  advisory: string
  time_saved_vs_high_crowd: number
}

export interface HeatmapCell {
  lat: number
  lng: number
  density: number
  level: 'LOW' | 'MEDIUM' | 'HIGH'
  color: string
  emoji: string
  radius: number
  opacity: number
}

export interface VenueStatus {
  destination: string
  current_visitors: number
  crowd_level: 'LOW' | 'MEDIUM' | 'HIGH'
  crowd_color: string
  crowd_emoji: string
  trend: 'RISING' | 'STABLE' | 'DECLINING'
  trend_symbol: string
  trend_color: string
  trend_detail: string
  best_visit_window: string
  estimated_wait_minutes: number
  observation_time: string
}

export interface CrowdAnalysisResult {
  ok: boolean
  venue: VenueStatus
  heatmap: HeatmapCell[]
  timeline: {
    destination: string
    timeline: Array<{ label: string; hour: string; visitors: number; level: string; color: string }>
    peak_in_hours: string
  }
}

// ─── API Calls with Offline Fallbacks ────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371.0
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  return 2 * R * Math.asin(Math.sqrt(a))
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) return `${hours}h ${mins.toString().padStart(2, '0')}m`
  return `${mins} min`
}

function generateFallbackRoutes(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  destName: string,
  originName?: string,
): RouteAnalysisResult {
  const dist = haversineKm(originLat, originLng, destLat, destLng)
  const isLocal = dist < 500
  const isRegional = dist >= 500 && dist <= 3000
  const isLongHaul = dist > 500

  // Check if origin is Chengalpattu or near it (~12.68, 79.98)
  const isChengalpattu =
    (originName && originName.toLowerCase().includes('chengalpattu')) ||
    haversineKm(originLat, originLng, 12.6823, 79.9800) < 25

  let routes: RouteOption[] = []

  if (isLocal) {
    routes = [
      {
        name: 'Route A',
        label: 'Expressway (Fastest)',
        description: `National Highway / Expressway — shortest drive time to ${destName}`,
        distance_km: Math.round(dist * 1.1),
        base_duration_minutes: Math.round((dist / 80) * 60),
        base_duration_formatted: formatDuration(Math.round((dist / 80) * 60)),
        crowd_level: 'HIGH',
        crowd_label: '🔴 High Crowd',
        crowd_color: '#EF4444',
        crowd_delay_minutes: 25,
        traffic_delay_minutes: 15,
        wait_minutes: 10,
        total_minutes: Math.round((dist / 80) * 60 + 50),
        total_duration_formatted: formatDuration(Math.round((dist / 80) * 60 + 50)),
        is_recommended: false,
      },
      {
        name: 'Route B',
        label: 'State Highway (Scenic)',
        description: `Scenic bypass — avoids city bottlenecks and heavy toll congestion near ${destName}`,
        distance_km: Math.round(dist * 1.22),
        base_duration_minutes: Math.round((dist / 70) * 60),
        base_duration_formatted: formatDuration(Math.round((dist / 70) * 60)),
        crowd_level: 'MEDIUM',
        crowd_label: '🟡 Moderate',
        crowd_color: '#F59E0B',
        crowd_delay_minutes: 12,
        traffic_delay_minutes: 8,
        wait_minutes: 5,
        total_minutes: Math.round((dist / 70) * 60 + 25),
        total_duration_formatted: formatDuration(Math.round((dist / 70) * 60 + 25)),
        is_recommended: true,
      },
      {
        name: 'Route C',
        label: isChengalpattu ? 'Express Rail (Chengalpattu Jn)' : 'Intercity Express Rail',
        description: `Express train to ${destName} — eco-friendly, predictable schedule`,
        distance_km: Math.round(dist * 1.15),
        base_duration_minutes: Math.round((dist / 75) * 60),
        base_duration_formatted: formatDuration(Math.round((dist / 75) * 60)),
        crowd_level: 'LOW',
        crowd_label: '🟢 Low Crowd',
        crowd_color: '#10B981',
        crowd_delay_minutes: 5,
        traffic_delay_minutes: 3,
        wait_minutes: 4,
        total_minutes: Math.round((dist / 75) * 60 + 12),
        total_duration_formatted: formatDuration(Math.round((dist / 75) * 60 + 12)),
        is_recommended: false,
      },
    ]
  } else if (isChengalpattu) {
    // Chengalpattu has NO airport -> Cab to Chennai MAA + Flight or Train from Chengalpattu Jn!
    routes = [
      {
        name: 'Route B',
        label: 'Cab to MAA + Via Delhi (DEL)',
        description: `Cab (~47 km) to Chennai Airport (MAA) → 1-stop connection via Delhi (DEL) to ${destName}`,
        distance_km: Math.round(dist * 1.08 + 47),
        base_duration_minutes: Math.round((dist / 700) * 60 + 115),
        base_duration_formatted: formatDuration(Math.round((dist / 700) * 60 + 115)),
        crowd_level: 'LOW',
        crowd_label: '🟢 Low Crowd',
        crowd_color: '#10B981',
        crowd_delay_minutes: 6,
        traffic_delay_minutes: 4,
        wait_minutes: 8,
        total_minutes: Math.round((dist / 700) * 60 + 133),
        total_duration_formatted: formatDuration(Math.round((dist / 700) * 60 + 133)),
        is_recommended: true,
      },
      {
        name: 'Route A',
        label: 'Cab to MAA + Direct Flight',
        description: `Cab/road (~47 km, 55m) from Chengalpattu to Chennai Airport (MAA) → Non-stop flight to ${destName}`,
        distance_km: Math.round(dist + 47),
        base_duration_minutes: Math.round((dist / 750) * 60 + 85),
        base_duration_formatted: formatDuration(Math.round((dist / 750) * 60 + 85)),
        crowd_level: 'HIGH',
        crowd_label: '🔴 High Crowd',
        crowd_color: '#EF4444',
        crowd_delay_minutes: 32,
        traffic_delay_minutes: 18,
        wait_minutes: 25,
        total_minutes: Math.round((dist / 750) * 60 + 160),
        total_duration_formatted: formatDuration(Math.round((dist / 750) * 60 + 160)),
        is_recommended: false,
      },
      {
        name: 'Route C',
        label: 'Express Rail (Chengalpattu Jn)',
        description: `Superfast Express train from Chengalpattu Junction (CGL) to ${destName} — zero airport check-in stress`,
        distance_km: Math.round(dist * 1.15),
        base_duration_minutes: Math.round((dist / 80) * 60),
        base_duration_formatted: formatDuration(Math.round((dist / 80) * 60)),
        crowd_level: 'MEDIUM',
        crowd_label: '🟡 Moderate',
        crowd_color: '#F59E0B',
        crowd_delay_minutes: 15,
        traffic_delay_minutes: 5,
        wait_minutes: 10,
        total_minutes: Math.round((dist / 80) * 60 + 30),
        total_duration_formatted: formatDuration(Math.round((dist / 80) * 60 + 30)),
        is_recommended: false,
      },
    ]
  } else {
    // Normal city with airport
    routes = [
      {
        name: 'Route B',
        label: 'Via Delhi (DEL)',
        description: `1-stop connection via Delhi (DEL) — less crowded terminal to ${destName}`,
        distance_km: Math.round(dist * 1.08),
        base_duration_minutes: Math.round((dist / 750) * 60 + 65),
        base_duration_formatted: formatDuration(Math.round((dist / 750) * 60 + 65)),
        crowd_level: 'LOW',
        crowd_label: '🟢 Low Crowd',
        crowd_color: '#10B981',
        crowd_delay_minutes: 6,
        traffic_delay_minutes: 4,
        wait_minutes: 8,
        total_minutes: Math.round((dist / 750) * 60 + 83),
        total_duration_formatted: formatDuration(Math.round((dist / 750) * 60 + 83)),
        is_recommended: true,
      },
      {
        name: 'Route A',
        label: 'Direct Flight',
        description: `Direct non-stop flight to ${destName} — peak capacity`,
        distance_km: Math.round(dist),
        base_duration_minutes: Math.round((dist / 750) * 60 + 35),
        base_duration_formatted: formatDuration(Math.round((dist / 750) * 60 + 35)),
        crowd_level: 'HIGH',
        crowd_label: '🔴 High Crowd',
        crowd_color: '#EF4444',
        crowd_delay_minutes: 32,
        traffic_delay_minutes: 18,
        wait_minutes: 25,
        total_minutes: Math.round((dist / 750) * 60 + 110),
        total_duration_formatted: formatDuration(Math.round((dist / 750) * 60 + 110)),
        is_recommended: false,
      },
      {
        name: 'Route C',
        label: 'Via Mumbai (BOM)',
        description: `1-stop connection via Mumbai (BOM) to ${destName}`,
        distance_km: Math.round(dist * 1.12),
        base_duration_minutes: Math.round((dist / 750) * 60 + 75),
        base_duration_formatted: formatDuration(Math.round((dist / 750) * 60 + 75)),
        crowd_level: 'MEDIUM',
        crowd_label: '🟡 Moderate',
        crowd_color: '#F59E0B',
        crowd_delay_minutes: 16,
        traffic_delay_minutes: 10,
        wait_minutes: 12,
        total_minutes: Math.round((dist / 750) * 60 + 113),
        total_duration_formatted: formatDuration(Math.round((dist / 750) * 60 + 113)),
        is_recommended: false,
      },
    ]
  }

  const rec = routes.find((r) => r.is_recommended) ?? routes[0]

  return {
    ok: true,
    origin: { lat: originLat, lng: originLng },
    destination: { name: destName, lat: destLat, lng: destLng },
    distance_km: Math.round(dist * 10) / 10,
    is_long_haul: isLongHaul,
    is_regional: isRegional,
    routes,
    recommended_route: rec.name,
    savings_minutes: 26,
    savings_formatted: '26 min',
    crowd_alert: true,
  }
}

function generateFallbackETA(
  distanceKm: number,
  crowdLevel: string,
  isLongHaul: boolean,
): ETAResult {
  const baseTravelMins = Math.max(30, Math.round(distanceKm / (isLongHaul ? 12 : 1.2)))
  const crowdDelayMins = crowdLevel === 'HIGH' ? 35 : crowdLevel === 'MEDIUM' ? 15 : 5
  const trafficDelayMins = crowdLevel === 'HIGH' ? 20 : crowdLevel === 'MEDIUM' ? 10 : 3
  const entryWaitMins = crowdLevel === 'HIGH' ? 25 : crowdLevel === 'MEDIUM' ? 12 : 5
  const totalMins = baseTravelMins + crowdDelayMins + trafficDelayMins + entryWaitMins

  return {
    ok: true,
    distance_km: distanceKm,
    crowd_level: (crowdLevel as 'LOW' | 'MEDIUM' | 'HIGH') || 'MEDIUM',
    crowd_color: crowdLevel === 'HIGH' ? '#EF4444' : crowdLevel === 'MEDIUM' ? '#F59E0B' : '#10B981',
    crowd_icon: '👥',
    time_of_day: 'Peak Hours',
    breakdown: {
      base_travel: { label: 'Base Transit Time', minutes: baseTravelMins, formatted: formatDuration(baseTravelMins), prefix: '' },
      traffic_delay: { label: 'Traffic & Signals', minutes: trafficDelayMins, formatted: formatDuration(trafficDelayMins), prefix: '+' },
      crowd_delay: { label: 'Crowd Bottlenecks', minutes: crowdDelayMins, formatted: formatDuration(crowdDelayMins), prefix: '+' },
      entry_wait: { label: 'Security & Entry Wait', minutes: entryWaitMins, formatted: formatDuration(entryWaitMins), prefix: '+' },
    },
    total_minutes: totalMins,
    total_formatted: formatDuration(totalMins),
    confidence_range: `±${Math.round(totalMins * 0.08)} min`,
    advisory: crowdLevel === 'HIGH' ? 'High crowd active — reserve entry slot ahead' : 'Optimal arrival window',
    time_saved_vs_high_crowd: 30,
  }
}

function generateFallbackCrowd(lat: number, lng: number, destination: string): CrowdAnalysisResult {
  return {
    ok: true,
    venue: {
      destination,
      current_visitors: 1240,
      crowd_level: 'MEDIUM',
      crowd_color: '#F59E0B',
      crowd_emoji: '🟡',
      trend: 'STABLE',
      trend_symbol: '→',
      trend_color: '#F59E0B',
      trend_detail: 'Crowd density expected to taper off by 4 PM',
      best_visit_window: '2:30 PM - 4:00 PM',
      estimated_wait_minutes: 15,
      observation_time: new Date().toLocaleTimeString(),
    },
    heatmap: Array.from({ length: 12 }, (_, i) => ({
      lat: lat + (Math.random() - 0.5) * 0.01,
      lng: lng + (Math.random() - 0.5) * 0.01,
      density: Math.floor(Math.random() * 80) + 20,
      level: i % 3 === 0 ? 'HIGH' : i % 2 === 0 ? 'MEDIUM' : 'LOW',
      color: i % 3 === 0 ? '#EF4444' : i % 2 === 0 ? '#F59E0B' : '#10B981',
      emoji: i % 3 === 0 ? '🔴' : i % 2 === 0 ? '🟡' : '🟢',
      radius: Math.floor(Math.random() * 20) + 10,
      opacity: 0.7,
    })),
    timeline: {
      destination,
      timeline: [
        { label: '10:00', hour: '10:00', visitors: 450, level: 'LOW', color: '#10B981' },
        { label: '12:00', hour: '12:00', visitors: 1100, level: 'MEDIUM', color: '#F59E0B' },
        { label: '14:00', hour: '14:00', visitors: 1850, level: 'HIGH', color: '#EF4444' },
        { label: '16:00', hour: '16:00', visitors: 1400, level: 'MEDIUM', color: '#F59E0B' },
        { label: '18:00', hour: '18:00', visitors: 900, level: 'MEDIUM', color: '#F59E0B' },
        { label: '20:00', hour: '20:00', visitors: 350, level: 'LOW', color: '#10B981' },
      ],
      peak_in_hours: '2 hours',
    },
  }
}

export async function fetchRoutes(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  destName: string,
  originName?: string,
): Promise<RouteAnalysisResult> {
  try {
    const res = await fetch(`${BASE_URL}/routes/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin_lat: originLat,
        origin_lng: originLng,
        dest_lat: destLat,
        dest_lng: destLng,
        dest_name: destName,
        origin_name: originName || '',
      }),
    })
    if (res.ok) return await res.json()
  } catch (err) {
    console.warn('Backend offline, using fallback routes:', err)
  }
  return generateFallbackRoutes(originLat, originLng, destLat, destLng, destName, originName)
}

export async function fetchETA(
  distanceKm: number,
  crowdLevel: string,
  isLongHaul: boolean,
  isRegional = false,
): Promise<ETAResult> {
  const now = new Date()
  const baseSpeed = !isLongHaul ? 80 : isRegional ? 750 : 900
  try {
    const res = await fetch(`${BASE_URL}/eta/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        distance_km: distanceKm,
        crowd_level: crowdLevel,
        time_of_day: now.getUTCHours(),
        day_of_week: now.getUTCDay(),
        base_speed_kmh: baseSpeed,
        is_long_haul: isLongHaul,
      }),
    })
    if (res.ok) return await res.json()
  } catch (err) {
    console.warn('Backend offline, using fallback ETA:', err)
  }
  return generateFallbackETA(distanceKm, crowdLevel, isLongHaul)
}

export async function fetchCrowdAnalysis(
  lat: number,
  lng: number,
  destination: string,
): Promise<CrowdAnalysisResult> {
  try {
    const res = await fetch(`${BASE_URL}/crowd/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, destination }),
    })
    if (res.ok) return await res.json()
  } catch (err) {
    console.warn('Backend offline, using fallback crowd analysis:', err)
  }
  return generateFallbackCrowd(lat, lng, destination)
}

