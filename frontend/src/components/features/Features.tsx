import React from 'react'
import { FEATURES } from '../../data/features'
import { FeatureCard } from './FeatureCard'
import { Cpu } from 'lucide-react'

export const Features: React.FC = () => {
  return (
    <section id="features" className="relative py-24 overflow-hidden" style={{ background: '#020617' }}>
      {/* Radial Background Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3 text-purple-400 font-mono px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20"
          >
            <Cpu size={14} />
            <span>INTELLIGENCE STACK v3.2</span>
          </div>
          <h2
            className="font-black mb-5 text-white"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4vw, 52px)',
              letterSpacing: '-0.02em',
            }}
          >
            Six AI Engines.
            <br />
            <span className="gradient-text">One Perfect Journey.</span>
          </h2>
          <p
            className="text-base leading-relaxed text-slate-400"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            VoyageAI isn't a travel website. It's a purpose-built AI architecture with six interconnected intelligence engines that collaborate in real time to engineer trips no human could.
          </p>
        </div>

        {/* 6-Engine Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
