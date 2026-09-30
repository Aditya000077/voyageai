import React from 'react'
import { Sparkles, ArrowRight, Play } from 'lucide-react'

interface CTAProps {
  onOpenPlanner: () => void
}

export const CTA: React.FC<CTAProps> = ({ onOpenPlanner }) => {
  return (
    <section className="relative py-24 overflow-hidden" style={{ background: '#020617' }}>
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <div
          className="rounded-3xl p-8 sm:p-14 relative overflow-hidden border border-blue-500/20 shadow-2xl backdrop-blur-2xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(59,130,246,0.14) 0%, rgba(124,58,237,0.14) 50%, rgba(6,182,212,0.1) 100%)',
            boxShadow: '0 0 80px rgba(59,130,246,0.15), 0 40px 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* Inner Radial Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.2) 0%, transparent 60%)',
            }}
          />

          <div
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-4 text-blue-400 font-mono px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25"
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>LIMITED EARLY ACCESS · PRO VERSION</span>
          </div>

          <h2
            className="font-black mb-5 text-white"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5vw, 64px)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            Your Journey Starts
            <br />
            <span className="gradient-text">With One Prompt</span>
          </h2>

          <p
            className="text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed text-slate-300"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Join 2.4 million travelers who've discovered that the future of travel isn't a search engine — it's an intelligent conversation with an AI concierge that never sleeps.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenPlanner}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base text-white flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 0 30px rgba(59,130,246,0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 50px rgba(59,130,246,0.65)'
                e.currentTarget.style.transform = 'scale(1.04)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(59,130,246,0.4)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <span>Start for Free</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={onOpenPlanner}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-slate-900/60 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <Play size={16} className="text-blue-400 fill-blue-400" />
              <span>Watch AI Demo</span>
            </button>
          </div>

          <p
            className="mt-6 text-xs text-slate-500 font-mono"
          >
            No credit card required · Instant access · SOC 2 Type II certified
          </p>
        </div>
      </div>
    </section>
  )
}
