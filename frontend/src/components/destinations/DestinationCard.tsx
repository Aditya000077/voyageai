import React, { useState } from 'react'
import { Destination } from '../../types'
import { parseCoordsString, calculateHaversineDistance, formatDistance } from '../../utils/geoUtils'
import { formatPriceInRupees } from '../../utils/currencyUtils'
import { Star, MapPin, ArrowRight, Navigation } from 'lucide-react'

interface DestinationCardProps {
  dest: Destination
  userLat?: number | null
  userLng?: number | null
  onSelect: (dest: Destination) => void
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  dest,
  userLat,
  userLng,
  onSelect
}) => {
  const [hovered, setHovered] = useState(false)

  // Calculate live Haversine distance from user's current GPS position
  const distanceLabel = React.useMemo(() => {
    if (!userLat || !userLng) return null
    const destCoords = parseCoordsString(dest.coords)
    if (!destCoords) return null

    const distKm = calculateHaversineDistance(
      { latitude: userLat, longitude: userLng },
      destCoords
    )
    return formatDistance(distKm)
  }, [dest.coords, userLat, userLng])

  return (
    <div
      className="dest-card shrink-0 rounded-2xl overflow-hidden cursor-pointer card-hover border border-slate-800 transition-all duration-300 flex flex-col justify-between"
      style={{
        width: 320,
        background: '#0F172A',
        boxShadow: hovered
          ? `0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${dest.tagColor}22`
          : '0 8px 30px rgba(0,0,0,0.4)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(dest)}
    >
      {/* Top Image Box */}
      <div className="relative overflow-hidden" style={{ height: 220 }}>
        <img
          src={dest.image}
          alt={`${dest.city}, ${dest.country}`}
          className="dest-img w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
          }}
        />

        {/* Tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md"
            style={{
              background: `${dest.tagColor}22`,
              borderColor: `${dest.tagColor}55`,
              color: dest.tagColor,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {dest.tag}
          </span>
        </div>

        {/* Badge */}
        <div
          className="absolute top-3 right-3 text-[11px] px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-200 backdrop-blur-md"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {dest.badge}
        </div>

        {/* AI Score Box */}
        <div className="absolute bottom-3 right-3">
          <div
            className="flex flex-col items-center justify-center rounded-xl px-3 py-1.5 bg-slate-950/80 border border-slate-800 backdrop-blur-md"
          >
            <span
              className="text-[9px] font-bold tracking-wider"
              style={{ color: dest.tagColor, fontFamily: 'var(--font-mono)' }}
            >
              AI SCORE
            </span>
            <span
              className="text-lg font-black text-white leading-none"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {dest.score}
            </span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3
                className="text-xl font-bold text-slate-100"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {dest.city}
              </h3>
              <p
                className="text-xs text-slate-400"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {dest.country} · {dest.temp}
              </p>
            </div>
            <div className="text-right">
              <div
                className="text-xl font-extrabold text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {formatPriceInRupees(dest.price)}
              </div>
              <div
                className="text-[11px] text-slate-400"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {dest.duration}
              </div>
            </div>
          </div>

          {/* GPS Coords & Distance Badge */}
          <div className="space-y-1 mb-3">
            <div className="text-xs flex items-center gap-1.5 text-slate-400 font-mono">
              <MapPin size={12} style={{ color: dest.tagColor }} />
              <span>{dest.coords}</span>
            </div>

            {distanceLabel && (
              <div className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                <Navigation size={10} />
                <span>📍 {distanceLabel} from you</span>
              </div>
            )}
          </div>
        </div>

        {/* Rating & Button */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span
                className="text-sm font-semibold text-white"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {dest.rating}
              </span>
              <span
                className="text-xs text-slate-400"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                ({dest.reviews.toLocaleString()})
              </span>
            </div>
          </div>

          <button
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
            style={{
              background: hovered ? `${dest.tagColor}22` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${hovered ? `${dest.tagColor}55` : 'rgba(255,255,255,0.08)'}`,
              color: hovered ? dest.tagColor : 'rgba(248,250,252,0.7)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <span>Explore with AI</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
