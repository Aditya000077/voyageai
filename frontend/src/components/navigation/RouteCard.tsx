import React from 'react'
import { RouteOption } from '../../services/navigationApi'
import { CheckCircle, Plane, MapPin, Clock, Users, Navigation, Train } from 'lucide-react'

interface RouteCardProps {
  route: RouteOption
  isSelected: boolean
  onSelect: () => void
}

const CROWD_BG: Record<string, string> = {
  LOW:    'rgba(16,185,129,0.08)',
  MEDIUM: 'rgba(245,158,11,0.08)',
  HIGH:   'rgba(239,68,68,0.08)',
}

const CROWD_BORDER: Record<string, string> = {
  LOW:    'rgba(16,185,129,0.35)',
  MEDIUM: 'rgba(245,158,11,0.35)',
  HIGH:   'rgba(239,68,68,0.35)',
}

export const RouteCard: React.FC<RouteCardProps> = ({ route, isSelected, onSelect }) => {
  const crowdColor  = route.crowd_color
  const crowdBg     = CROWD_BG[route.crowd_level]  ?? 'rgba(100,100,100,0.08)'
  const crowdBorder = CROWD_BORDER[route.crowd_level] ?? 'rgba(100,100,100,0.3)'

  const isRail = route.label.toLowerCase().includes('rail') ||
                 route.label.toLowerCase().includes('train') ||
                 route.description.toLowerCase().includes('train')

  return (
    <button
      onClick={onSelect}
      className="relative flex flex-col gap-3 p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer w-full"
      style={{
        background: isSelected
          ? 'rgba(59,130,246,0.12)'
          : 'rgba(15,23,42,0.80)',
        borderColor: isSelected ? '#3B82F6' : 'rgba(255,255,255,0.08)',
        boxShadow: isSelected ? '0 0 0 1px #3B82F6, 0 0 24px rgba(59,130,246,0.2)' : 'none',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Recommended badge */}
      {route.is_recommended && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white"
          style={{ background: 'linear-gradient(135deg,#10B981,#06B6D4)', boxShadow: '0 0 12px rgba(16,185,129,0.5)' }}
        >
          <CheckCircle size={10} />
          AI Recommended
        </div>
      )}

      {/* Route name + transport icon */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: isSelected ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.05)' }}
          >
            {isRail ? (
              <Train size={15} className={isSelected ? 'text-blue-400' : 'text-slate-400'} />
            ) : route.distance_km > 500 ? (
              <Plane size={15} className={isSelected ? 'text-blue-400' : 'text-slate-400'} />
            ) : (
              <Navigation size={15} className={isSelected ? 'text-blue-400' : 'text-slate-400'} />
            )}
          </div>
          <div>
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">{route.name}</div>
            <div className="text-sm font-bold text-white leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
              {route.label}
            </div>
            {route.description && (
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                {route.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Distance */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <MapPin size={12} className="text-slate-500" />
        <span>{route.distance_km.toLocaleString()} km</span>
      </div>

      {/* Crowd level badge */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
        style={{ background: crowdBg, border: `1px solid ${crowdBorder}` }}
      >
        <Users size={12} style={{ color: crowdColor }} />
        <span className="text-xs font-bold" style={{ color: crowdColor, fontFamily: 'var(--font-mono)' }}>
          {route.crowd_label}
        </span>
        <span className="text-[10px] text-slate-500 ml-auto">+{route.crowd_delay_minutes}min crowd</span>
      </div>

      {/* ETA */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-amber-400" />
          <span className="text-[11px] text-slate-400 font-mono">Total ETA</span>
        </div>
        <span
          className="text-xl font-black"
          style={{
            fontFamily: 'var(--font-display)',
            color: isSelected ? '#60A5FA' : '#F8FAFC',
          }}
        >
          {route.total_duration_formatted}
        </span>
      </div>

      {/* Selection ring glow */}
      {isSelected && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: 'inset 0 0 20px rgba(59,130,246,0.1)' }}
        />
      )}
    </button>
  )
}
