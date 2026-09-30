import React, { useState } from 'react'
import { useRouteAnalysis } from '../../hooks/useRouteAnalysis'
import { RouteCard } from './RouteCard'
import { ETAPanel } from './ETAPanel'
import { CrowdHeatmap } from './CrowdHeatmap'
import { CrowdAlertBanner } from './CrowdAlertBanner'
import { DESTINATIONS } from '../../data/destinations'
import {
  Navigation, RefreshCw, MapPin, ChevronDown,
  Cpu, Radio, Globe, Loader2, Clock
} from 'lucide-react'
import { formatPriceInRupees } from '../../utils/currencyUtils'

interface SmartNavPanelProps {
  userLat: number | null
  userLng: number | null
  userCity: string | null
}

export const SmartNavPanel: React.FC<SmartNavPanelProps> = ({ userLat, userLng, userCity }) => {
  const {
    routeData,
    etaData,
    crowdData,
    selectedRoute,
    loading,
    error,
    selectedDestId,
    setSelectedDestId,
    selectRoute,
    refresh,
    lastUpdated,
  } = useRouteAnalysis(userLat, userLng, userCity)

  const [destDropdownOpen, setDestDropdownOpen] = useState(false)
  const selectedDest = DESTINATIONS.find((d) => d.id === selectedDestId) ?? DESTINATIONS[0]

  // Alert logic: show if any non-recommended route is worse than recommended
  const nonRecommended = routeData?.routes.filter((r) => !r.is_recommended) ?? []
  const showAlert =
    routeData?.crowd_alert &&
    selectedRoute?.is_recommended &&
    nonRecommended.some((r) => r.crowd_level === 'HIGH')

  const alertFrom = nonRecommended.find((r) => r.crowd_level === 'HIGH')
  const alertTo   = routeData?.routes.find((r) => r.is_recommended)

  return (
    <section
      id="smart-nav"
      className="relative py-24 overflow-hidden"
      style={{ background: '#020617' }}
    >
      {/* Ambient glow blobs */}
      <div
        className="absolute top-0 left-1/4 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[500px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* ─── Section Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3 text-emerald-400 font-mono px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Cpu size={13} className="animate-pulse" />
              <span>SMART NAVIGATION INTELLIGENCE</span>
              <span
                className="w-2 h-2 rounded-full blink"
                style={{ background: '#10B981', boxShadow: '0 0 8px #10B981' }}
              />
              <span className="text-emerald-500/70">LIVE</span>
            </div>
            <h2
              className="font-black text-white leading-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 3.5vw, 48px)',
                letterSpacing: '-0.02em',
              }}
            >
              We Don't Just Show the Map.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #10B981, #06B6D4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                We Predict It.
              </span>
            </h2>
            <p className="mt-3 text-slate-400 max-w-xl text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              GPS location + real-time crowd density + AI/ML engine → optimal route + itemised ETA breakdown.
              Auto-refreshes every 60 seconds.
            </p>
          </div>

          {/* Origin GPS pill + refresh */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
              <MapPin size={13} className="text-emerald-400" />
              <span className="text-slate-300">
                FROM: <strong className="text-white">{userCity || 'Chengalpattu'}</strong>
              </span>
              {userLat && (
                <span className="text-slate-500 hidden sm:inline">
                  ({userLat.toFixed(2)}°, {userLng?.toFixed(2)}°)
                </span>
              )}
            </div>

            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-semibold transition-all duration-200 cursor-pointer"
              style={{
                background: 'rgba(16,185,129,0.1)',
                borderColor: 'rgba(16,185,129,0.3)',
                color: '#10B981',
              }}
            >
              {loading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <RefreshCw size={13} />
              )}
              Refresh
            </button>

            {lastUpdated && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                <Clock size={11} />
                <span>Updated {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* ─── Destination Selector ─── */}
        <div className="mb-8">
          <label className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2 block">
            Select Destination
          </label>
          <div className="relative inline-block w-full max-w-sm">
            <button
              onClick={() => setDestDropdownOpen(!destDropdownOpen)}
              className="w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer"
              style={{
                background: 'rgba(15,23,42,0.9)',
                borderColor: destDropdownOpen ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-emerald-400 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                    {selectedDest?.city}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">{selectedDest?.country}</div>
                </div>
              </div>
              <ChevronDown
                size={16}
                className="text-slate-400 transition-transform duration-200"
                style={{ transform: destDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>

            {destDropdownOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-2 rounded-2xl border overflow-hidden z-30 shadow-2xl"
                style={{
                  background: 'rgba(2,6,23,0.97)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  maxHeight: 300,
                  overflowY: 'auto',
                }}
              >
                {DESTINATIONS.map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => {
                      setSelectedDestId(dest.id)
                      setDestDropdownOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-slate-800/60 transition-colors cursor-pointer border-b border-slate-800/40 last:border-0"
                  >
                    <Navigation size={13} className="text-slate-500 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-white">{dest.city}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{dest.country} · {formatPriceInRupees(dest.price)}</div>
                    </div>
                    {dest.id === selectedDestId && (
                      <span
                        className="ml-auto text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}
                      >
                        SELECTED
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Error State ─── */}
        {error && (
          <div className="mb-6 px-5 py-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm flex items-center gap-3">
            <Radio size={16} className="animate-pulse" />
            <span>Navigation engine offline — {error}. Ensure backend is running on port 8000.</span>
          </div>
        )}

        {/* ─── Crowd Alert Banner ─── */}
        {showAlert && alertFrom && alertTo && (
          <div className="mb-6">
            <CrowdAlertBanner
              show={showAlert}
              fromRoute={alertFrom.name}
              toRoute={alertTo.name}
              savingsFormatted={routeData?.savings_formatted ?? ''}
              onSwitch={() => selectRoute(alertTo.name)}
            />
          </div>
        )}

        {/* ─── Loading Skeleton ─── */}
        {loading && !routeData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        )}

        {/* ─── Route Cards ─── */}
        {routeData && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                Route Options — {routeData.is_long_haul ? 'Long-Haul Flight' : 'Local Travel'} · {routeData.distance_km.toLocaleString()} km
              </span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                AI Best: {routeData.recommended_route}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {routeData.routes.map((route) => (
                <RouteCard
                  key={route.name}
                  route={route}
                  isSelected={selectedRoute?.name === route.name}
                  onSelect={() => selectRoute(route.name)}
                />
              ))}
            </div>
          </>
        )}

        {/* ─── ETA + Heatmap Grid ─── */}
        {(etaData || crowdData) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {etaData && <ETAPanel eta={etaData} loading={loading && !!etaData} />}
            {crowdData && <CrowdHeatmap heatmap={crowdData.heatmap} venue={crowdData.venue} />}
          </div>
        )}

        {/* ─── Crowd Timeline Bar Chart ─── */}
        {crowdData?.timeline && (
          <div
            className="mt-6 rounded-2xl p-5 border"
            style={{ background: 'rgba(2,6,23,0.9)', borderColor: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Radio size={14} className="text-blue-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400">
                6-HOUR CROWD FORECAST — {selectedDest?.city}
              </span>
              <span className="text-[10px] text-slate-600 font-mono ml-auto">
                Peak in: {crowdData.timeline.peak_in_hours}
              </span>
            </div>

            <div className="flex items-end gap-2 h-24">
              {crowdData.timeline.timeline.map((point) => {
                const pct = Math.min(100, (point.visitors / 2000) * 100)
                return (
                  <div key={point.label} className="flex flex-col items-center gap-1.5 flex-1">
                    <div
                      className="w-full rounded-t-md transition-all duration-500"
                      style={{ height: `${Math.max(8, pct)}%`, background: point.color, opacity: 0.8 }}
                      title={`${point.visitors} visitors`}
                    />
                    <span className="text-[9px] text-slate-500 font-mono">{point.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
