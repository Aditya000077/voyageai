import React from 'react'
import { Mission } from '../../types'
import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Plane, Compass, Clock, User, ShieldCheck, Radio, Gauge } from 'lucide-react'

interface MissionModalProps {
  mission: Mission | null
  isOpen: boolean
  onClose: () => void
}

export const MissionModal: React.FC<MissionModalProps> = ({ mission, isOpen, onClose }) => {
  if (!mission) return null

  // Normalize: Django returns status_color (snake_case), local data uses statusColor (camelCase)
  const color = mission.statusColor ?? mission.status_color ?? '#06B6D4'
  const missionId = mission.mission_id ?? String(mission.id ?? 'UNKNOWN')

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Live Telemetry: ${missionId}`} maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Header Route Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge color={color}>{mission.status}</Badge>
              <span className="text-xs font-mono text-slate-400">{mission.flight}</span>
            </div>
            <h3 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {mission.destination}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">Origin: {mission.origin || 'International Hub'}</p>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Radio size={28} className="animate-pulse" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">FLIGHT PROGRESS</span>
            <span className="text-cyan-400 font-bold">{mission.progress}% COMPLETED</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${mission.progress}%`,
                background: `linear-gradient(90deg, ${color}, #3B82F6)`,
                boxShadow: `0 0 10px ${color}`,
              }}
            />
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-1">
              <User size={14} className="text-blue-400" />
              <span>PASSENGER</span>
            </div>
            <div className="text-sm font-bold text-white">{mission.passenger}</div>
            <div className="text-[11px] font-mono text-slate-400">Seat {mission.seat}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-1">
              <Clock size={14} className="text-cyan-400" />
              <span>ESTIMATED ARRIVAL</span>
            </div>
            <div className="text-sm font-bold text-white">{mission.eta}</div>
            <div className="text-[11px] font-mono text-emerald-400">On Schedule</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-1">
              <Plane size={14} className="text-purple-400" />
              <span>AIRCRAFT TYPE</span>
            </div>
            <div className="text-sm font-bold text-white truncate">{mission.aircraft || 'Airbus A350'}</div>
            <div className="text-[11px] font-mono text-slate-400">Alt: {mission.altitude}</div>
          </div>
        </div>

        {/* AI Concierge Active Protection Note */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
          <ShieldCheck size={20} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-bold text-emerald-400 block mb-0.5">VoyageAI Concierge Guard Active</span>
            This flight is continuously tracked by our predictive weather and slot allocation AI. Ground baggage transfers and hotel check-in at destination are automatically pre-confirmed.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-2 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close Radar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
