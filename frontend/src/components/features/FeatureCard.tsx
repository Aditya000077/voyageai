import React, { useState } from 'react'
import { Feature } from '../../types'
import { Cpu, TrendingUp, Bot, BrainCircuit, Sun, Sparkles, CheckCircle2 } from 'lucide-react'

interface FeatureCardProps {
  feature: Feature
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  const [hovered, setHovered] = useState(false)

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return Cpu
      case 'TrendingUp': return TrendingUp
      case 'Bot': return Bot
      case 'BrainCircuit': return BrainCircuit
      case 'Sun': return Sun
      case 'Sparkles':
      default: return Sparkles
    }
  }

  const Icon = getIcon(feature.icon)

  return (
    <div
      className="rounded-2xl p-6 transition-all duration-300 relative overflow-hidden flex flex-col justify-between border"
      style={{
        background: hovered ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.6)',
        borderColor: hovered ? `${feature.accent}55` : 'rgba(255, 255, 255, 0.08)',
        boxShadow: hovered ? `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${feature.accent}20` : 'none',
        backdropFilter: 'blur(16px)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Ambient hover glow */}
      {hovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 20% 20%, ${feature.accent}12 0%, transparent 65%)`,
          }}
        />
      )}

      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between mb-5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-transform duration-300"
            style={{
              background: `${feature.accent}18`,
              border: `1px solid ${feature.accent}35`,
              color: feature.accent,
              boxShadow: hovered ? `0 0 20px ${feature.accent}40` : 'none',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
            }}
          >
            <Icon size={24} />
          </div>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full font-mono border"
            style={{
              background: `${feature.accent}14`,
              color: feature.accent,
              borderColor: `${feature.accent}30`,
            }}
          >
            {feature.metric}
          </span>
        </div>

        <div
          className="text-[11px] font-bold uppercase tracking-widest mb-2 font-mono"
          style={{ color: feature.accent }}
        >
          {feature.label}
        </div>

        <h3
          className="text-lg font-bold mb-3 text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {feature.title}
        </h3>

        <p
          className="text-sm leading-relaxed text-slate-400 mb-4"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {feature.desc}
        </p>
      </div>

      {/* Feature Bullet Points */}
      {feature.detailPoints && (
        <div className="pt-4 border-t border-slate-800/80 space-y-1.5">
          {feature.detailPoints.map((pt, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 size={13} style={{ color: feature.accent }} className="shrink-0" />
              <span className="truncate">{pt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
