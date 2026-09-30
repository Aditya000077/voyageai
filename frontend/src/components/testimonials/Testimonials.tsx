import React from 'react'
import { TestimonialCard } from './TestimonialCard'
import { TrustMetrics } from './TrustMetrics'
import { useTestimonials } from '../../hooks/useTestimonials'
import { Star } from 'lucide-react'

export const Testimonials: React.FC = () => {
  const { testimonials, loading } = useTestimonials()

  return (
    <section id="testimonials" className="relative py-24 overflow-hidden" style={{ background: '#020617' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(59,130,246,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3 text-purple-400 font-mono px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span>VOYAGER INTELLIGENCE REVIEWS</span>
          </div>
          <h2
            className="font-black text-white"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4vw, 52px)',
              letterSpacing: '-0.02em',
            }}
          >
            Trusted by <span className="gradient-text">Elite Travelers</span>
          </h2>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse p-6 space-y-4"
                style={{ minHeight: 220 }}
              >
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => <div key={s} className="w-4 h-4 rounded bg-slate-800" />)}
                </div>
                <div className="h-4 bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-800 rounded w-5/6" />
                <div className="h-4 bg-slate-800 rounded w-4/6" />
                <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                  <div className="w-11 h-11 rounded-full bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-800 rounded w-1/2" />
                    <div className="h-3 bg-slate-800 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </div>
        )}

        <TrustMetrics />
      </div>
    </section>
  )
}
