import React from 'react'
import { AlertTriangle, ArrowRight, Zap } from 'lucide-react'

interface CrowdAlertBannerProps {
  show: boolean
  fromRoute: string
  toRoute: string
  savingsFormatted: string
  onSwitch: () => void
}

export const CrowdAlertBanner: React.FC<CrowdAlertBannerProps> = ({
  show,
  fromRoute,
  toRoute,
  savingsFormatted,
  onSwitch,
}) => {
  if (!show) return null

  return (
    <div
      className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 rounded-2xl border overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.06))',
        borderColor: 'rgba(245,158,11,0.4)',
        boxShadow: '0 0 30px rgba(245,158,11,0.08)',
        animation: 'pulse-border 2s ease-in-out infinite',
      }}
    >
      {/* Animated left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: 'linear-gradient(to bottom, #F59E0B, #EF4444)' }}
      />

      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
      >
        <AlertTriangle size={18} className="text-amber-400" />
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-amber-300" style={{ fontFamily: 'var(--font-display)' }}>
            ⚠️ Crowd Rising on {fromRoute}
          </span>
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30"
          >
            🔴 HIGH CROWD
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
          {toRoute} is currently less crowded — switching saves approximately{' '}
          <strong className="text-emerald-400">{savingsFormatted}</strong>.
        </p>
      </div>

      {/* Switch CTA */}
      <button
        onClick={onSwitch}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all duration-200 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #10B981, #06B6D4)',
          color: 'white',
          boxShadow: '0 0 16px rgba(16,185,129,0.35)',
          fontFamily: 'var(--font-body)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 24px rgba(16,185,129,0.6)'; e.currentTarget.style.transform = 'scale(1.04)' }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 16px rgba(16,185,129,0.35)'; e.currentTarget.style.transform = 'scale(1)' }}
      >
        <Zap size={13} />
        Switch to {toRoute}
        <ArrowRight size={13} />
      </button>
    </div>
  )
}
