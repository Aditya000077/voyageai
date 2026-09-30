import React, { useState, useMemo } from 'react'
import { Destination } from '../../types'
import { parseCoordsString, calculateHaversineDistance, formatDistance } from '../../utils/geoUtils'
import { WORLD_CONTINENT_PATHS } from './worldMapData'
import {
  Navigation,
  Compass,
  Sparkles,
  ExternalLink,
  Layers,
  ZoomIn,
  Globe2,
  Crosshair,
  MapPin,
  Clock,
  ArrowUpRight
} from 'lucide-react'

interface InteractiveMapProps {
  userLat: number | null
  userLng: number | null
  userCity: string | null
  destinations: Destination[]
  onSelectDestination: (dest: Destination) => void
}

type MapViewMode = 'world' | 'regional'

// Clean display names for city nodes
const getCleanCityName = (city: string): string => {
  if (city.includes('New York')) return 'New York'
  if (city.includes('Machu Picchu')) return 'Machu Picchu'
  if (city.includes('Kyoto')) return 'Kyoto'
  if (city.includes('Santorini')) return 'Santorini'
  if (city.includes('Zermatt')) return 'Zermatt'
  if (city.includes('Paris')) return 'Paris'
  if (city.includes('Reykjavik')) return 'Reykjavik'
  if (city.includes('Serengeti')) return 'Serengeti'
  if (city.includes('Cairo')) return 'Cairo'
  if (city.includes('Bali')) return 'Bali'
  if (city.includes('Amritsar')) return 'Amritsar'
  if (city.includes('Jaipur')) return 'Jaipur'
  if (city.includes('Goa')) return 'Goa'
  if (city.includes('Chennai')) return 'Chennai'
  if (city.includes('Maldives')) return 'Maldives'
  return city.split('&')[0].trim()
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  userLat,
  userLng,
  userCity,
  destinations,
  onSelectDestination,
}) => {
  const [selectedPin, setSelectedPin] = useState<Destination | null>(null)
  const [hoveredPin, setHoveredPin] = useState<Destination | null>(null)
  const [viewMode, setViewMode] = useState<MapViewMode>('world')
  const [showFlightArcs, setShowFlightArcs] = useState(true)

  const activeLat = userLat || 12.6823
  const activeLng = userLng || 79.9800

  // ─── Proximity Calculations & Sorting ───
  const destinationsWithDistance = useMemo(() => {
    return destinations
      .map((d) => {
        const coords = parseCoordsString(d.coords)
        const distKm = coords
          ? calculateHaversineDistance({ latitude: activeLat, longitude: activeLng }, coords)
          : 99999
        return {
          ...d,
          parsedCoords: coords,
          distKm,
          cleanName: getCleanCityName(d.city),
        }
      })
      .sort((a, b) => a.distKm - b.distKm)
  }, [destinations, activeLat, activeLng])

  // Nearest destination
  const nearestDest = destinationsWithDistance[0]

  // ─── Coordinate Transformations ───
  // World Mode: 800 x 420 px (Global Mercator / Equirectangular)
  // Regional Mode: South Asia / Indian Ocean bounding box (0° to 36°N, 66° to 96°E)
  const getSvgCoords = (lat: number, lng: number, mode: MapViewMode) => {
    if (mode === 'regional') {
      // Regional bounds: lat [0, 36] -> y [390, 30], lng [66, 96] -> x [40, 760]
      const minLat = 0
      const maxLat = 36
      const minLng = 66
      const maxLng = 96
      const x = ((lng - minLng) / (maxLng - minLng)) * 720 + 40
      const y = ((maxLat - lat) / (maxLat - minLat)) * 360 + 30
      return {
        x: Math.max(25, Math.min(775, x)),
        y: Math.max(25, Math.min(395, y)),
        inBounds: lat >= -2 && lat <= 38 && lng >= 63 && lng <= 99,
      }
    } else {
      // World projection bounds
      const x = ((lng + 180) / 360) * 800
      const latRad = (lat * Math.PI) / 180
      const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2))
      const y = 210 - (mercN / Math.PI) * 170
      return {
        x,
        y: Math.max(25, Math.min(395, y)),
        inBounds: true,
      }
    }
  }

  const userPoint = getSvgCoords(activeLat, activeLng, viewMode)

  // ─── Non-Overlapping Label Anchor Offsets ───
  const getLabelStyle = (cityName: string, isRegional: boolean) => {
    if (isRegional) {
      switch (cityName) {
        case 'Amritsar':
          return { dx: 0, dy: -14, anchor: 'middle' as const }
        case 'Jaipur':
          return { dx: -14, dy: -6, anchor: 'end' as const }
        case 'Goa':
          return { dx: -14, dy: 4, anchor: 'end' as const }
        case 'Chennai':
          return { dx: 16, dy: -2, anchor: 'start' as const }
        case 'Maldives':
          return { dx: 0, dy: 18, anchor: 'middle' as const }
        default:
          return { dx: 0, dy: -12, anchor: 'middle' as const }
      }
    } else {
      // World View: carefully spaced quadrants so Indian nodes & European nodes never clash
      switch (cityName) {
        case 'Amritsar':
          return { dx: -6, dy: -14, anchor: 'end' as const }
        case 'Jaipur':
          return { dx: -12, dy: -4, anchor: 'end' as const }
        case 'Goa':
          return { dx: -12, dy: 8, anchor: 'end' as const }
        case 'Chennai':
          return { dx: 14, dy: -2, anchor: 'start' as const }
        case 'Maldives':
          return { dx: 0, dy: 16, anchor: 'middle' as const }
        case 'Paris':
          return { dx: -10, dy: -10, anchor: 'end' as const }
        case 'Zermatt':
          return { dx: 10, dy: 10, anchor: 'start' as const }
        case 'New York':
          return { dx: 0, dy: -12, anchor: 'middle' as const }
        case 'Machu Picchu':
          return { dx: -8, dy: 14, anchor: 'end' as const }
        case 'Reykjavik':
          return { dx: 0, dy: -12, anchor: 'middle' as const }
        case 'Santorini':
          return { dx: 12, dy: -4, anchor: 'start' as const }
        case 'Cairo':
          return { dx: 12, dy: 6, anchor: 'start' as const }
        case 'Serengeti':
          return { dx: 12, dy: 6, anchor: 'start' as const }
        case 'Kyoto':
          return { dx: 12, dy: 0, anchor: 'start' as const }
        case 'Bali':
          return { dx: 12, dy: 4, anchor: 'start' as const }
        default:
          return { dx: 0, dy: -12, anchor: 'middle' as const }
      }
    }
  }

  // Active pin (selected or hovered)
  const activePin = hoveredPin || selectedPin

  return (
    <div className="rounded-3xl p-5 sm:p-6 border border-slate-800/90 bg-slate-950/95 backdrop-blur-2xl space-y-4 shadow-2xl">
      {/* Top Header & Telemetry Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-400 font-mono mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Compass size={14} className="text-emerald-400" />
            <span>REAL-TIME GPS PROXIMITY RADAR · 360° LIVE TELEMETRY</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Interactive GPS Radar & Global Nodes
          </h3>
        </div>

        {/* View Controls & GPS Status */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Your GPS Coordinates badge */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
            <Navigation size={13} className="text-emerald-400 shrink-0" />
            <span>
              GPS: <strong className="text-white">{userCity || 'Chengalpattu'}</strong> ({activeLat.toFixed(2)}°, {activeLng.toFixed(2)}°)
            </span>
          </div>

          {/* Nearest Destination pill */}
          {nearestDest && (
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/25 text-emerald-300">
              <Crosshair size={12} className="text-emerald-400" />
              <span>Nearest: <strong className="text-white">{nearestDest.cleanName}</strong> ({formatDistance(nearestDest.distKm)})</span>
            </div>
          )}

          {/* Mode Switcher: World vs Regional */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('world')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer font-bold ${
                viewMode === 'world'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe2 size={13} />
              <span>World Radar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('regional')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer font-bold ${
                viewMode === 'regional'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ZoomIn size={13} />
              <span>Regional Focus</span>
            </button>
          </div>

          {/* Toggle Flight Arcs */}
          <button
            type="button"
            onClick={() => setShowFlightArcs(!showFlightArcs)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              showFlightArcs
                ? 'bg-slate-800 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
            title="Toggle Flight Path Beams"
          >
            <Layers size={14} />
          </button>
        </div>
      </div>

      {/* SVG Canvas World Radar Visualizer */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800/90 bg-slate-950 h-80 sm:h-[440px] shadow-inner select-none">
        <svg className="w-full h-full" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice">
          <defs>
            {/* Aerospace Grid Pattern */}
            <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.5" />
            </pattern>

            {/* Radar Center Glow */}
            <radialGradient id="radarPulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>

            {/* Radar Sweep Gradient */}
            <linearGradient id="radarSweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
            </linearGradient>

            <linearGradient id="radarConeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Deep Ocean Background & Grid */}
          <rect width="800" height="420" fill="#020617" />
          <rect width="800" height="420" fill="url(#radarGrid)" />

          {/* Latitude / Longitude Graticule Reference Lines */}
          <line x1="0" y1="210" x2="800" y2="210" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="400" y1="0" x2="400" y2="420" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="0.8" strokeDasharray="3 3" />

          {/* ─── REAL WORLD CONTINENT VECTOR LANDMASSES (World Mode) ─── */}
          {viewMode === 'world' && (
            <g className="world-continents">
              {WORLD_CONTINENT_PATHS.map((cont) => (
                <path
                  key={cont.id}
                  d={cont.d}
                  fill="rgba(30, 41, 59, 0.55)"
                  stroke="rgba(51, 65, 85, 0.7)"
                  strokeWidth="1"
                  className="transition-colors hover:fill-slate-800"
                />
              ))}
            </g>
          )}

          {/* ─── REGIONAL LAND OUTLINE (Regional Focus Mode) ─── */}
          {viewMode === 'regional' && (
            <g className="regional-landmass">
              {/* Stylized Indian Subcontinent Outline in Regional coordinates */}
              <path
                d="M 220 50 L 320 40 L 480 50 L 600 90 L 640 160 L 590 220 L 530 260 L 450 330 L 420 370 L 390 330 L 300 240 L 250 180 L 180 130 Z"
                fill="rgba(16, 185, 129, 0.08)"
                stroke="rgba(16, 185, 129, 0.3)"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              {/* Arabian Sea & Bay of Bengal Water Labels */}
              <text x="140" y="270" fill="rgba(148, 163, 184, 0.25)" fontSize="12" fontFamily="var(--font-mono)" letterSpacing="4">
                ARABIAN SEA
              </text>
              <text x="580" y="270" fill="rgba(148, 163, 184, 0.25)" fontSize="12" fontFamily="var(--font-mono)" letterSpacing="4">
                BAY OF BENGAL
              </text>
              <text x="350" y="410" fill="rgba(148, 163, 184, 0.25)" fontSize="12" fontFamily="var(--font-mono)" letterSpacing="4">
                INDIAN OCEAN
              </text>
            </g>
          )}

          {/* ─── CONCENTRIC RADAR PROXIMITY RINGS FROM USER GPS ─── */}
          <g>
            <circle cx={userPoint.x} cy={userPoint.y} r="50" fill="url(#radarPulse)" />
            <circle cx={userPoint.x} cy={userPoint.y} r="100" stroke="rgba(16,185,129,0.25)" strokeWidth="1" fill="none" strokeDasharray="3 3" />
            <circle cx={userPoint.x} cy={userPoint.y} r="180" stroke="rgba(16,185,129,0.18)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
            <circle cx={userPoint.x} cy={userPoint.y} r="260" stroke="rgba(16,185,129,0.12)" strokeWidth="1" fill="none" strokeDasharray="4 4" />

            {/* Distance Indicators on Radar Rings */}
            <text x={userPoint.x + 104} y={userPoint.y - 4} fill="#10B981" fontSize="8" fontFamily="var(--font-mono)" opacity="0.65">
              {viewMode === 'world' ? '1,500 KM' : '500 KM'}
            </text>
            <text x={userPoint.x + 184} y={userPoint.y - 4} fill="#10B981" fontSize="8" fontFamily="var(--font-mono)" opacity="0.55">
              {viewMode === 'world' ? '3,500 KM' : '1,500 KM'}
            </text>
            <text x={userPoint.x + 264} y={userPoint.y - 4} fill="#10B981" fontSize="8" fontFamily="var(--font-mono)" opacity="0.45">
              {viewMode === 'world' ? '6,000 KM' : '2,500 KM'}
            </text>

            {/* Rotating 360° Military Radar Sweep Beam */}
            <g transform={`translate(${userPoint.x}, ${userPoint.y})`}>
              <g className="animate-radar-sweep">
                <line x1="0" y1="0" x2="260" y2="0" stroke="url(#radarSweepGrad)" strokeWidth="1.5" />
                <path d="M 0 0 L 260 0 A 260 260 0 0 1 245 88 Z" fill="url(#radarConeGrad)" />
              </g>
            </g>
          </g>

          {/* ─── FLIGHT CONNECTION BEAMS / ARCS ─── */}
          {showFlightArcs &&
            destinationsWithDistance.map((d) => {
              if (!d.parsedCoords) return null
              const pt = getSvgCoords(d.parsedCoords.latitude, d.parsedCoords.longitude, viewMode)
              if (viewMode === 'regional' && !pt.inBounds) return null

              const isHighlighted = selectedPin?.id === d.id || hoveredPin?.id === d.id
              const midX = (userPoint.x + pt.x) / 2
              const midY = Math.min(userPoint.y, pt.y) - 20 // Arc curvature

              return (
                <g key={`arc-${d.id}`}>
                  <path
                    d={`M ${userPoint.x} ${userPoint.y} Q ${midX} ${midY} ${pt.x} ${pt.y}`}
                    fill="none"
                    stroke={isHighlighted ? '#10B981' : d.tagColor || '#38BDF8'}
                    strokeWidth={isHighlighted ? 2 : 1}
                    strokeOpacity={isHighlighted ? 0.9 : 0.35}
                    strokeDasharray={isHighlighted ? 'none' : '3 4'}
                    className="transition-all duration-300"
                  />
                </g>
              )
            })}

          {/* ─── DESTINATION LOCATION NODES & SMART LABELS ─── */}
          {destinationsWithDistance.map((d) => {
            if (!d.parsedCoords) return null
            const pt = getSvgCoords(d.parsedCoords.latitude, d.parsedCoords.longitude, viewMode)
            if (viewMode === 'regional' && !pt.inBounds) return null

            const isSelected = selectedPin?.id === d.id
            const isHovered = hoveredPin?.id === d.id
            const labelStyle = getLabelStyle(d.cleanName, viewMode === 'regional')

            return (
              <g
                key={`node-${d.id}`}
                transform={`translate(${pt.x}, ${pt.y})`}
                className="cursor-pointer group"
                onClick={() => {
                  setSelectedPin(d)
                  onSelectDestination(d)
                }}
                onMouseEnter={() => setHoveredPin(d)}
                onMouseLeave={() => setHoveredPin(null)}
              >
                {/* Node Outer Pulsing Wave */}
                <circle
                  r={isSelected || isHovered ? '14' : '7'}
                  fill={d.tagColor || '#38BDF8'}
                  fillOpacity={isSelected || isHovered ? '0.4' : '0.2'}
                  className={isSelected || isHovered ? 'animate-ping' : ''}
                />

                {/* Node Center Dot */}
                <circle
                  r={isSelected || isHovered ? '6' : '3.5'}
                  fill={isSelected || isHovered ? '#FFFFFF' : d.tagColor || '#38BDF8'}
                  stroke="#020617"
                  strokeWidth="1.5"
                  className="transition-all"
                />

                {/* City Label with Anti-Collision Stroke */}
                <text
                  x={labelStyle.dx}
                  y={labelStyle.dy}
                  textAnchor={labelStyle.anchor}
                  fill={isSelected || isHovered ? '#10B981' : '#F8FAFC'}
                  stroke="#020617"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                  paintOrder="stroke fill"
                  fontSize={isSelected || isHovered ? '11' : '10'}
                  fontWeight="bold"
                  fontFamily="var(--font-mono)"
                  className="pointer-events-none transition-all drop-shadow"
                >
                  {d.cleanName}
                </text>
              </g>
            )
          })}

          {/* ─── USER LIVE GPS MARKER PIN ─── */}
          <g transform={`translate(${userPoint.x}, ${userPoint.y})`}>
            {/* Outer Pulsing Green Ring */}
            <circle r="18" fill="#10B981" fillOpacity="0.2" className="animate-ping" />
            <circle r="10" fill="#10B981" fillOpacity="0.4" />
            <circle r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />

            {/* User Label */}
            <text
              x="12"
              y="16"
              textAnchor="start"
              fill="#10B981"
              stroke="#020617"
              strokeWidth="4"
              strokeLinejoin="round"
              paintOrder="stroke fill"
              fontSize="10"
              fontWeight="bold"
              fontFamily="var(--font-mono)"
            >
              📍 YOU ({userCity || 'GPS Origin'})
            </text>
          </g>
        </svg>

        {/* ─── Active Floating Destination HUD Overlay ─── */}
        {activePin && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md p-3.5 rounded-2xl bg-slate-950/95 border border-emerald-500/40 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3 min-w-0">
              {activePin.image && (
                <img
                  src={activePin.image}
                  alt={activePin.city}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-800"
                />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-xs font-bold text-white truncate">{activePin.city}, {activePin.country}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {activePin.score}% MATCH
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Navigation size={10} />
                    {activePin.distKm ? formatDistance(activePin.distKm) : 'Direct'} from GPS
                  </span>
                  <span>·</span>
                  <span>{activePin.price}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectDestination(activePin)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1 cursor-pointer shrink-0 transition-colors shadow-md shadow-emerald-500/20"
            >
              <span>Explore</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Proximity Radar Node Chips */}
      <div className="pt-1 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono scroll-x">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
          <Crosshair size={12} className="text-emerald-400" /> PROXIMITY SORT:
        </span>
        {destinationsWithDistance.slice(0, 6).map((dest) => (
          <button
            key={`chip-${dest.id}`}
            type="button"
            onClick={() => {
              setSelectedPin(dest)
              onSelectDestination(dest)
            }}
            className={`px-2.5 py-1 rounded-lg border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              selectedPin?.id === dest.id
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="font-semibold">{dest.cleanName}</span>
            <span className="text-[10px] text-slate-500">
              ({formatDistance(dest.distKm)})
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
