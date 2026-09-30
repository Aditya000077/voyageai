import React from 'react'
import { HeatmapCell, VenueStatus } from '../../services/navigationApi'
import { Users, TrendingUp, TrendingDown, Minus, Clock, Star } from 'lucide-react'

interface CrowdHeatmapProps {
  heatmap: HeatmapCell[]
  venue: VenueStatus
}

export const CrowdHeatmap: React.FC<CrowdHeatmapProps> = ({ heatmap, venue }) => {
  const TrendIcon =
    venue.trend === 'RISING' ? TrendingUp :
    venue.trend === 'DECLINING' ? TrendingDown : Minus

  // Map lat/lng to a normalised grid for display
  const lats = heatmap.map((c) => c.lat)
  const lngs = heatmap.map((c) => c.lng)
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  const latRange = maxLat - minLat || 1
  const lngRange = maxLng - minLng || 1

  const toSvg = (lat: number, lng: number) => ({
    x: ((lng - minLng) / lngRange) * 340 + 30,
    y: ((maxLat - lat)  / latRange) * 180 + 20,
  })

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'rgba(2,6,23,0.9)', borderColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-3"
        style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(15,23,42,0.6)' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-blue-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400">
              CROWD HEATMAP
            </span>
          </div>
          <h4 className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            {venue.destination} — Live Density
          </h4>
        </div>

        {/* Visitor count + trend */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div
              className="text-2xl font-black"
              style={{ fontFamily: 'var(--font-display)', color: venue.crowd_color }}
            >
              {venue.current_visitors.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">ESTIMATED VISITORS</div>
          </div>
          <div
            className="flex flex-col items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: `${venue.crowd_color}15`, border: `1px solid ${venue.crowd_color}35` }}
          >
            <TrendIcon size={18} style={{ color: venue.trend_color }} />
          </div>
        </div>
      </div>

      {/* SVG Heatmap Canvas */}
      <div className="relative bg-slate-950 mx-5 my-4 rounded-xl overflow-hidden" style={{ height: 220 }}>
        <svg className="w-full h-full" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid meet">
          <defs>
            {heatmap.map((cell, i) => (
              <radialGradient key={`grad-${i}`} id={`heatGrad-${i}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={cell.color} stopOpacity={cell.opacity} />
                <stop offset="100%" stopColor={cell.color} stopOpacity={0} />
              </radialGradient>
            ))}
          </defs>

          {/* Subtle grid */}
          <pattern id="hgrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          </pattern>
          <rect width="400" height="220" fill="url(#hgrid)" />

          {/* Heatmap blobs */}
          {heatmap.map((cell, i) => {
            const pt = toSvg(cell.lat, cell.lng)
            return (
              <ellipse
                key={`heat-${i}`}
                cx={pt.x}
                cy={pt.y}
                rx={cell.radius}
                ry={cell.radius * 0.75}
                fill={`url(#heatGrad-${i})`}
              />
            )
          })}

          {/* Crowd level dots on top */}
          {heatmap.filter((_, i) => i % 4 === 0).map((cell, i) => {
            const pt = toSvg(cell.lat, cell.lng)
            return (
              <circle
                key={`dot-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={3}
                fill={cell.color}
                fillOpacity={0.9}
              />
            )
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 right-3 flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
          {[['#10B981', '🟢 Low'], ['#F59E0B', '🟡 Med'], ['#EF4444', '🔴 High']].map(([color, label]) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="text-[10px] text-slate-400 font-mono">{label.split(' ')[1]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status strip */}
      <div
        className="grid grid-cols-3 divide-x divide-slate-800/40 mx-5 mb-5 rounded-xl overflow-hidden border"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        {[
          {
            icon: <span style={{ color: venue.crowd_color }} className="text-base">{venue.crowd_emoji}</span>,
            label: 'Status',
            value: venue.crowd_level,
            color: venue.crowd_color,
          },
          {
            icon: <Clock size={14} className="text-amber-400" />,
            label: 'Est. Wait',
            value: `${venue.estimated_wait_minutes} min`,
            color: '#F59E0B',
          },
          {
            icon: <Star size={14} className="text-emerald-400" />,
            label: 'Best Time',
            value: venue.best_visit_window.split('–')[0].trim(),
            color: '#10B981',
          },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center justify-center py-3 gap-1 bg-slate-900/50">
            {item.icon}
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{item.label}</span>
            <span className="text-xs font-bold" style={{ color: item.color, fontFamily: 'var(--font-mono)' }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Trend note */}
      <div
        className="mx-5 mb-5 flex items-center gap-2 text-xs px-3 py-2 rounded-xl"
        style={{
          background: `${venue.trend_color}10`,
          border: `1px solid ${venue.trend_color}30`,
          color: venue.trend_color,
          fontFamily: 'var(--font-body)',
        }}
      >
        <TrendIcon size={13} />
        <span>{venue.trend_detail}</span>
        <span className="ml-auto text-slate-500 text-[10px] font-mono">{venue.observation_time}</span>
      </div>
    </div>
  )
}
