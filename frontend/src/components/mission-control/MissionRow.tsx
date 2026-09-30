import React, { useState } from 'react'
import { Mission } from '../../types'
import { Radio } from 'lucide-react'

interface MissionRowProps {
  mission: Mission
  onSelect: (mission: Mission) => void
}

export const MissionRow: React.FC<MissionRowProps> = ({ mission, onSelect }) => {
  const [hovered, setHovered] = useState(false)
  // Normalize: Django returns status_color (snake_case), local data uses statusColor (camelCase)
  const color = mission.statusColor ?? mission.status_color ?? '#06B6D4'

  return (
    <div
      className="rounded-xl px-5 py-4 transition-all duration-200 cursor-pointer border"
      style={{
        background: hovered ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.55)',
        borderColor: hovered ? `${color}55` : 'rgba(255, 255, 255, 0.07)',
        backdropFilter: 'blur(12px)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(mission)}
    >

      <div
        className="grid items-center gap-4"
        style={{ gridTemplateColumns: '110px 1.5fr 110px 120px 100px 100px' }}
      >
        {/* Mission ID */}
        <span
          className="text-xs font-bold font-mono flex items-center gap-1.5"
          style={{ color: '#3B82F6' }}
        >
          <Radio size={12} className="animate-pulse" />
          {mission.id}
        </span>

        {/* Route & Flight */}
        <div>
          <div className="text-sm font-bold text-slate-100 font-body">
            {mission.destination}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">
            {mission.flight} · {mission.altitude}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full blink"
            style={{ background: mission.statusColor, boxShadow: `0 0 8px ${mission.statusColor}` }}
          />
          <span
            className="text-xs font-bold font-mono"
            style={{ color: mission.statusColor }}
          >
            {mission.status}
          </span>
        </div>

        {/* Passenger */}
        <div>
          <div className="text-xs font-medium text-slate-200 font-body">
            {mission.passenger}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Seat {mission.seat}
          </div>
        </div>

        {/* ETA */}
        <span className="text-xs font-bold font-mono text-cyan-400">
          {mission.eta}
        </span>

        {/* Progress */}
        <div>
          <div className="text-xs mb-1 text-right text-slate-400 font-mono font-semibold">
            {mission.progress}%
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-slate-800">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${mission.progress}%`,
                background: `linear-gradient(90deg, ${mission.statusColor}, #3B82F6)`,
                boxShadow: `0 0 8px ${mission.statusColor}`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
