import React from 'react'
import { TRUST_METRICS } from '../../data/testimonials'

export const TrustMetrics: React.FC = () => {
  return (
    <div
      className="mt-12 rounded-2xl px-8 py-6 flex flex-wrap justify-between gap-6 items-center bg-slate-900/50 border border-slate-800 backdrop-blur-md"
    >
      {TRUST_METRICS.map((m) => (
        <div key={m.label} className="text-center flex-1 min-w-[140px]">
          <div
            className="text-2xl sm:text-3xl font-black mb-1"
            style={{ fontFamily: 'var(--font-display)', color: m.color }}
          >
            {m.val}
          </div>
          <div
            className="text-[11px] font-bold text-slate-400 font-mono tracking-wider"
          >
            {m.label.toUpperCase()}
          </div>
        </div>
      ))}
    </div>
  )
}
