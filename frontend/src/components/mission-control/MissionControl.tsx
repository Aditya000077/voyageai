import React, { useState } from 'react'
import { SYSTEM_STATUSES } from '../../data/missions'
import { MissionRow } from './MissionRow'
import { MissionModal } from './MissionModal'
import { Mission } from '../../types'
import { useLiveClock } from '../../hooks/useLiveClock'
import { useMissions } from '../../hooks/useMissions'
import { Radio, Clock, Activity, Loader2 } from 'lucide-react'

export const MissionControl: React.FC = () => {
  const { utcString } = useLiveClock()
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const { missions, loading } = useMissions()

  return (
    <section id="mission-control" className="relative py-24 overflow-hidden" style={{ background: '#020617' }}>
      {/* Side Ambient Glows */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-2 text-cyan-400 font-mono px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20"
            >
              <Radio size={14} className="animate-pulse text-cyan-400" />
              <span>LIVE MISSION CONTROL</span>
            </div>
            <h2
              className="font-black text-white"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 3.5vw, 44px)',
                letterSpacing: '-0.02em',
              }}
            >
              Active Telemetry & Flights
            </h2>
          </div>

          {/* Live UTC Clock */}
          <div className="text-right hidden md:block font-mono text-cyan-400">
            <div className="text-2xl font-bold flex items-center justify-end gap-2">
              <Clock size={20} className="animate-pulse" />
              <span>{utcString}</span>
            </div>
            <div className="text-[11px] text-cyan-500/70 font-semibold tracking-wider">
              REAL-TIME MISSION CLOCK
            </div>
          </div>
        </div>

        {/* Mission Table Column Labels */}
        <div
          className="hidden md:grid gap-4 mb-3 px-5 text-xs font-bold uppercase tracking-widest text-slate-500 font-mono"
          style={{ gridTemplateColumns: '110px 1.5fr 110px 120px 100px 100px' }}
        >
          <span>MISSION ID</span>
          <span>ROUTE & AIRCRAFT</span>
          <span>STATUS</span>
          <span>PASSENGER</span>
          <span>ETA (UTC)</span>
          <span className="text-right">PROGRESS</span>
        </div>

        {/* Mission Rows */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {missions.map((mission) => (
              <MissionRow
                key={mission.id ?? mission.mission_id}
                mission={mission}
                onSelect={(m) => setSelectedMission(m)}
              />
            ))}
          </div>
        )}

        {/* System Health Status Bar */}
        <div
          className="mt-6 rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Activity size={16} className="text-blue-400" />
            <span className="font-bold text-slate-200">CORE INTELLIGENCE NODES:</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            {SYSTEM_STATUSES.map((sys) => (
              <div key={sys.label} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full blink"
                  style={{ background: sys.color, boxShadow: `0 0 6px ${sys.color}` }}
                />
                <span
                  className="text-xs text-slate-400 font-mono"
                >
                  {sys.label}
                </span>
                <span
                  className="text-xs font-bold font-mono"
                  style={{ color: sys.color }}
                >
                  {sys.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Telemetry Detail Modal */}
      <MissionModal
        mission={selectedMission}
        isOpen={!!selectedMission}
        onClose={() => setSelectedMission(null)}
      />
    </section>
  )
}
