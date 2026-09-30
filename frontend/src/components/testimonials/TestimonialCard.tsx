import React, { useState } from 'react'
import { Testimonial } from '../../types'
import { Star, ShieldCheck } from 'lucide-react'

interface TestimonialCardProps {
  t: Testimonial
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ t }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="rounded-2xl p-6 transition-all duration-300 border flex flex-col justify-between"
      style={{
        background: 'rgba(15, 23, 42, 0.65)',
        borderColor: hovered ? 'rgba(124, 58, 237, 0.4)' : 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 20px 50px rgba(0,0,0,0.4), 0 0 25px rgba(124,58,237,0.15)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>
        {/* Rating Stars */}
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
          ))}
        </div>

        {/* Quote text */}
        <blockquote
          className="text-sm leading-relaxed mb-6 text-slate-300"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          "{t.quote}"
        </blockquote>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
        <img
          src={t.avatar}
          alt={t.name}
          className="w-11 h-11 rounded-full object-cover border-2 border-purple-500/40"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-100 truncate" style={{ fontFamily: 'var(--font-body)' }}>
            {t.name}
          </div>
          <div className="text-xs text-slate-400 truncate" style={{ fontFamily: 'var(--font-body)' }}>
            {t.role}
          </div>
        </div>
        <div className="text-right shrink-0">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full font-mono block mb-1 border border-purple-500/30 bg-purple-500/10 text-purple-400"
          >
            {t.badge}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {t.trips} trips
          </span>
        </div>
      </div>
    </div>
  )
}
