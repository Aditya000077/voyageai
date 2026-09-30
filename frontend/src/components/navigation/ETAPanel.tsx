import React from 'react'
import { ETAResult } from '../../services/navigationApi'
import { Clock, TrendingUp, Users, Timer, AlertCircle } from 'lucide-react'

interface ETAPanelProps {
  eta: ETAResult
  loading?: boolean
}

const BREAKDOWN_ICONS: Record<string, React.ElementType> = {
  base_travel:   Clock,
  traffic_delay: TrendingUp,
  crowd_delay:   Users,
  entry_wait:    Timer,
}

export const ETAPanel: React.FC<ETAPanelProps> = ({ eta, loading }) => {
  if (loading) {
    return (
      <div className="rounded-2xl p-5 border border-slate-800 bg-slate-900/50 space-y-3 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 rounded-xl bg-slate-800/80" />
        ))}
      </div>
    )
  }

  const breakdownItems = [
    { key: 'base_travel',   ...eta.breakdown.base_travel },
    { key: 'traffic_delay', ...eta.breakdown.traffic_delay },
    { key: 'crowd_delay',   ...eta.breakdown.crowd_delay },
    { key: 'entry_wait',    ...eta.breakdown.entry_wait },
  ]

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'rgba(2,6,23,0.9)', borderColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b flex items-center justify-between"
        style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(15,23,42,0.6)' }}
      >
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-amber-400 animate-pulse" />
          <span className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            ETA Breakdown
          </span>
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full"
            style={{ background: `${eta.crowd_color}20`, color: eta.crowd_color, border: `1px solid ${eta.crowd_color}40` }}
          >
            {eta.crowd_icon} {eta.crowd_level}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">{eta.time_of_day}</span>
      </div>

      {/* Breakdown rows */}
      <div className="px-5 py-4 space-y-3">
        {breakdownItems.map((item, idx) => {
          const Icon = BREAKDOWN_ICONS[item.key] ?? Clock
          const isDelay = item.prefix === '+'
          return (
            <div key={item.key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: isDelay ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)' }}
                >
                  <Icon size={14} style={{ color: isDelay ? '#F87171' : '#34D399' }} />
                </div>
                <span className="text-xs text-slate-300 truncate" style={{ fontFamily: 'var(--font-body)' }}>
                  {item.label}
                </span>
              </div>
              <span
                className="text-sm font-bold font-mono shrink-0"
                style={{ color: isDelay ? '#FCA5A5' : '#6EE7B7' }}
              >
                {item.prefix}{item.formatted}
              </span>
            </div>
          )
        })}

        {/* Divider */}
        <div className="border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">Total ETA</span>
            <div className="text-right">
              <div
                className="text-2xl font-black"
                style={{
                  fontFamily: 'var(--font-display)',
                  background: 'linear-gradient(135deg, #F8FAFC, #60A5FA)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {eta.total_formatted}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Range: {eta.confidence_range}
              </div>
            </div>
          </div>
        </div>

        {/* Advisory */}
        <div
          className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs leading-relaxed"
          style={{
            background: `${eta.crowd_color}10`,
            border: `1px solid ${eta.crowd_color}30`,
            color: eta.crowd_color,
            fontFamily: 'var(--font-body)',
          }}
        >
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          <span>{eta.advisory}</span>
        </div>
      </div>
    </div>
  )
}
