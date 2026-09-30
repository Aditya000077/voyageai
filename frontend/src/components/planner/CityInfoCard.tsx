import React, { useEffect, useState } from 'react'
import { destinationService } from '../../services/destinationService'
import { Destination } from '../../types'
import {
  MapPin, Star, CalendarDays, Hotel, CheckCircle2,
  Globe, Loader2, Info,
} from 'lucide-react'
import { formatPriceInRupees } from '../../utils/currencyUtils'

interface CityInfoCardProps {
  /** The raw destination string from the generated itinerary, e.g. "Kyoto & Nara, Japan" */
  destinationName: string
}

export const CityInfoCard: React.FC<CityInfoCardProps> = ({ destinationName }) => {
  const [dest, setDest] = useState<Destination | null>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!destinationName) return
    let cancelled = false

    const fetchCity = async () => {
      setLoading(true)
      setDest(null)
      setNotFound(false)
      try {
        const res = await destinationService.searchByCity(destinationName)
        if (cancelled) return
        if (res.found && res.destination) {
          setDest(res.destination)
        } else {
          setNotFound(true)
        }
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchCity()
    return () => { cancelled = true }
  }, [destinationName])

  if (loading) {
    return (
      <div
        className="flex items-center gap-3 px-5 py-4 rounded-2xl border"
        style={{ background: 'rgba(2,6,23,0.85)', borderColor: 'rgba(16,185,129,0.2)' }}
      >
        <Loader2 size={16} className="text-emerald-400 animate-spin shrink-0" />
        <span className="text-xs font-mono text-slate-400">Loading destination intel…</span>
      </div>
    )
  }

  if (notFound || !dest) return null

  const highlights: string[] = Array.isArray(dest.highlights)
    ? (dest.highlights as unknown as string[])
    : []

  // snake_case fallbacks from Django
  const bestSeason = (dest as any).best_season ?? dest.bestSeason
  const hotelRec   = (dest as any).hotel_recommendation ?? dest.hotelRecommendation

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: 'rgba(16,185,129,0.25)', background: 'rgba(2,6,23,0.9)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.08) 100%)', borderBottom: '1px solid rgba(16,185,129,0.2)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.35)' }}
          >
            <Globe size={15} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
              DESTINATION INTEL
            </div>
            <div className="text-sm font-bold text-white leading-tight">
              {dest.city}
              <span className="ml-1.5 text-xs font-normal text-slate-400">· {dest.country}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Rating */}
          <div className="flex items-center gap-1 text-xs font-mono">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-amber-400 font-bold">{dest.rating}</span>
            <span className="text-slate-500">({dest.reviews?.toLocaleString()})</span>
          </div>
          {/* Tag */}
          {dest.tag && (
            <span
              className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full"
              style={{ background: `${dest.tagColor ?? '#3B82F6'}22`, color: dest.tagColor ?? '#3B82F6', border: `1px solid ${dest.tagColor ?? '#3B82F6'}44` }}
            >
              {dest.tag}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Left — description + highlights */}
        <div className="space-y-4">
          {/* Description */}
          {dest.description && (
            <div className="flex gap-2.5">
              <Info size={14} className="text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">{dest.description}</p>
            </div>
          )}

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
                TOP EXPERIENCES
              </div>
              {highlights.map((h: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — meta stats */}
        <div className="space-y-3">

          {/* Price & Duration chips */}
          <div className="flex flex-wrap gap-2">
            {dest.price && (
              <div
                className="px-3 py-2 rounded-xl flex-1 text-center"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-0.5">From</div>
                <div className="text-sm font-black text-emerald-400">{formatPriceInRupees(dest.price)}</div>
              </div>
            )}
            {dest.duration && (
              <div
                className="px-3 py-2 rounded-xl flex-1 text-center"
                style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}
              >
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-0.5">Duration</div>
                <div className="text-sm font-black text-cyan-400">{dest.duration}</div>
              </div>
            )}
          </div>

          {/* Best Season */}
          {bestSeason && (
            <div
              className="flex items-start gap-2.5 p-3 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <CalendarDays size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 mb-0.5">Best Season</div>
                <div className="text-xs text-slate-300">{bestSeason}</div>
              </div>
            </div>
          )}

          {/* Hotel Recommendation */}
          {hotelRec && (
            <div
              className="flex items-start gap-2.5 p-3 rounded-xl"
              style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)' }}
            >
              <Hotel size={14} className="text-violet-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-violet-400 mb-0.5">Recommended Stays</div>
                <div className="text-xs text-slate-300">{hotelRec}</div>
              </div>
            </div>
          )}

          {/* Temp & Badge */}
          <div className="flex items-center gap-2">
            {dest.temp && (
              <span
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
              >
                🌡 {dest.temp}
              </span>
            )}
            {dest.badge && (
              <span
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}
              >
                ✦ {dest.badge}
              </span>
            )}
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 ml-auto">
              <MapPin size={11} className="text-emerald-400" />
              <span>{dest.country}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
