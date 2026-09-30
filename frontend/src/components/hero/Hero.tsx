import React from 'react'
import { ParticleField } from './ParticleField'
import { SearchCard } from './SearchCard'
import { LocationBadge } from '../location/LocationBadge'
import { useGeoLocation } from '../../hooks/useGeoLocation'
import { STATS } from '../../data/testimonials'
import { Stat, TripFilters } from '../../types'
import { Compass, TrendingUp, Globe, Star, Sparkles } from 'lucide-react'

interface HeroProps {
  onPlanQuery: (query: string, filters?: Partial<TripFilters>) => void
  geo: ReturnType<typeof useGeoLocation>
}


export const Hero: React.FC<HeroProps> = ({ onPlanQuery, geo }) => {
  const { cityName, latitude, longitude, detected, loading, error, detectLocation, setCustomLocation } = geo


  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass': return Compass
      case 'TrendingUp': return TrendingUp
      case 'Globe': return Globe
      case 'Star': return Star
      default: return Sparkles
    }
  }

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 grid-pattern overflow-hidden"
      style={{ background: '#020617' }}
    >
      <ParticleField />

      {/* Radial Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.06) 40%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Status Pill & Live GPS Location Badge */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-950/20 shadow-lg shadow-emerald-500/10"
          >
            <span
              className="w-2.5 h-2.5 rounded-full blink bg-emerald-400"
              style={{ boxShadow: '0 0 10px #10B981' }}
            />
            <span
              className="text-xs font-semibold text-emerald-400 tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              GLOBAL EDITION ONLINE · WORLDWIDE AI TRAVEL CONCIERGE
            </span>
          </div>

          {/* Live GPS Location Badge with Manual Edit */}
          <LocationBadge
            cityName={cityName}
            latitude={latitude}
            longitude={longitude}
            detected={detected}
            loading={loading}
            error={error}
            onDetect={detectLocation}
            onSetCustomLocation={setCustomLocation}
          />
        </div>

        {/* Main Headline */}
        <h1
          className="font-black leading-none mb-6 tracking-tight text-slate-100"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(44px, 7vw, 80px)',
            letterSpacing: '-0.03em',
          }}
        >
          <span className="gradient-text block">Explore The Entire World</span>
          <span>with Autonomous AI</span>
        </h1>

        <p
          className="text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed text-slate-300"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          VoyageAI’s intelligent travel platform. Whether you're traveling solo, as a couple, with family, or with friends — on a backpacker budget or a comfort escape — craft your perfect trip in seconds.
        </p>


        {/* Interactive Search Card */}
        <SearchCard
          onPlanQuery={onPlanQuery}
          userCity={cityName}
          userLat={latitude}
          userLng={longitude}
        />

        {/* Live Metrics Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat: Stat) => {
            const Icon = getIcon(stat.icon)
            return (
              <div
                key={stat.label}
                className="text-center p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-2 text-emerald-400">
                  <Icon size={20} />
                </div>
                <div
                  className="text-3xl font-black mb-1"
                  style={{
                    fontFamily: 'var(--font-display)',
                    background: 'linear-gradient(135deg, #F8FAFC, #10B981)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-[11px] font-semibold uppercase tracking-widest text-slate-400"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Fade Gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #020617)' }}
      />
    </section>
  )
}
