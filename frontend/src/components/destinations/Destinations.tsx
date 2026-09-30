import React, { useState, useRef, useMemo } from 'react'
import { DestinationCard } from './DestinationCard'
import { DestinationModal } from './DestinationModal'
import { InteractiveMap } from '../location/InteractiveMap'
import { Destination } from '../../types'
import { useDestinations } from '../../hooks/useDestinations'
import { useGeoLocation } from '../../hooks/useGeoLocation'
import { parseCoordsString, calculateHaversineDistance } from '../../utils/geoUtils'
import { Sparkles, ChevronLeft, ChevronRight, ArrowRight, Search, Globe, Filter, Navigation, Compass } from 'lucide-react'

interface DestinationsProps {
  onGenerateItinerary: (destName: string) => void
  userLat?: number | null
  userLng?: number | null
  userCity?: string | null
}

export const Destinations: React.FC<DestinationsProps> = ({
  onGenerateItinerary,
  userLat = 12.6823,
  userLng = 79.9800,
  userCity = 'Chengalpattu',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)
  const { destinations, loading, error } = useDestinations()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [sortByProximity, setSortByProximity] = useState(false)
  const [showMap, setShowMap] = useState(false)

  const regionTabs = [
    { id: 'All', label: 'All Destinations', icon: Globe },
    { id: 'Asia', label: 'Asia-Pacific ⛩️', icon: Sparkles },
    { id: 'Europe', label: 'Europe & Alps 🏔️', icon: Sparkles },
    { id: 'Americas', label: 'Americas 🏙️', icon: Sparkles },
    { id: 'Africa', label: 'Africa & Middle East 🦁', icon: Sparkles },
    { id: 'Island', label: 'Nordic & Atolls 🌌', icon: Sparkles },
  ]

  const filteredDestinations = useMemo(() => {
    let result = destinations.filter((dest) => {
      // Search match
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        dest.city.toLowerCase().includes(query) ||
        dest.country.toLowerCase().includes(query) ||
        dest.badge.toLowerCase().includes(query) ||
        (dest.highlights && dest.highlights.some((h) => h.toLowerCase().includes(query)))

      // Region match
      let matchesRegion = true
      if (selectedRegion === 'Asia') {
        matchesRegion = ['Japan', 'Indonesia'].includes(dest.country)
      } else if (selectedRegion === 'Europe') {
        matchesRegion = ['Greece & Italy', 'Switzerland', 'France'].includes(dest.country)
      } else if (selectedRegion === 'Americas') {
        matchesRegion = ['USA', 'Brazil & Argentina', 'Peru'].includes(dest.country)
      } else if (selectedRegion === 'Africa') {
        matchesRegion = ['Tanzania', 'Egypt'].includes(dest.country)
      } else if (selectedRegion === 'Island') {
        matchesRegion = ['Iceland', 'Maldives'].includes(dest.country)
      }

      return matchesSearch && matchesRegion
    })

    // Sort by GPS Proximity if enabled
    if (sortByProximity && userLat && userLng) {
      result = [...result].sort((a, b) => {
        const coordsA = parseCoordsString(a.coords)
        const coordsB = parseCoordsString(b.coords)
        if (!coordsA || !coordsB) return 0

        const distA = calculateHaversineDistance({ latitude: userLat, longitude: userLng }, coordsA)
        const distB = calculateHaversineDistance({ latitude: userLat, longitude: userLng }, coordsB)
        return distA - distB
      })
    }

    return result
  }, [destinations, searchQuery, selectedRegion, sortByProximity, userLat, userLng])

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section id="destinations" className="relative py-24 overflow-hidden" style={{ background: '#020617' }}>
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div
              className="text-xs font-semibold uppercase tracking-widest mb-3 text-blue-400 flex items-center gap-2"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <Sparkles size={14} />
              <span>AI CURATED GLOBAL DESTINATIONS</span>
              <span
                className="w-2 h-2 rounded-full blink"
                style={{
                  background: loading ? '#F59E0B' : '#10B981',
                  boxShadow: `0 0 6px ${loading ? '#F59E0B' : '#10B981'}`,
                }}
              />
              <span className="text-[10px] font-mono" style={{ color: loading ? '#F59E0B' : '#10B981' }}>
                {loading ? 'FETCHING...' : `${filteredDestinations.length} OF ${destinations.length} DESTINATIONS`}
              </span>
            </div>
            <h2
              className="font-black leading-tight text-white"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 4vw, 52px)',
                letterSpacing: '-0.02em',
              }}
            >
              Handpicked by <span className="gradient-text-blue">Intelligence</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Toggle GPS Map */}
            <button
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 text-xs font-mono font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer border ${
                showMap
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Compass size={14} className={showMap ? 'animate-spin' : ''} />
              <span>{showMap ? 'Hide GPS Map' : 'View GPS Map'}</span>
            </button>

            {/* Sort by GPS Distance Toggle */}
            <button
              onClick={() => setSortByProximity(!sortByProximity)}
              className={`flex items-center gap-2 text-xs font-mono font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer border ${
                sortByProximity
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Navigation size={13} />
              <span>{sortByProximity ? 'Sorted by Distance ✓' : 'Sort by Distance'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleScroll('left')}
                className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-blue-500/50 transition-colors cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-blue-500/50 transition-colors cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Interactive GPS Map Drawer */}
        {showMap && (
          <div className="mt-6 mb-8 animate-fade-in">
            <InteractiveMap
              userLat={userLat}
              userLng={userLng}
              userCity={userCity}
              destinations={destinations}
              onSelectDestination={(d) => setSelectedDestination(d)}
            />
          </div>
        )}

        {/* Search Bar & Region Filter Controls */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 p-2 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl">
          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {regionTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedRegion(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedRegion === tab.id
                    ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400 shadow-md shadow-blue-500/10'
                    : 'bg-slate-950/40 border border-slate-800/50 text-slate-400 hover:text-slate-200'
                }`}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location, hotel, or guide..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-all"
              style={{ fontFamily: 'var(--font-body)' }}
            />
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex gap-6 px-6 max-w-7xl mx-auto overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="shrink-0 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
              style={{ width: 320, height: 420 }}
            >
              <div className="h-52 bg-slate-800/50 rounded-t-2xl mb-4" />
              <div className="px-5 space-y-3">
                <div className="h-5 bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-800 rounded w-1/2" />
                <div className="h-4 bg-slate-800 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Destination Cards Carousel */}
      {!loading && filteredDestinations.length > 0 && (
        <div
          ref={scrollRef}
          className="scroll-x flex gap-6 px-6 pb-6 max-w-7xl mx-auto"
        >
          {filteredDestinations.map((dest) => (
            <DestinationCard
              key={dest.id}
              dest={dest}
              userLat={userLat}
              userLng={userLng}
              onSelect={(destination) => setSelectedDestination(destination)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredDestinations.length === 0 && (
        <div className="max-w-md mx-auto my-12 text-center p-8 rounded-2xl bg-slate-900/40 border border-slate-800">
          <Filter size={32} className="mx-auto text-slate-500 mb-3" />
          <h4 className="text-lg font-bold text-white mb-1">No Matching Destinations</h4>
          <p className="text-xs text-slate-400 mb-4">
            Try adjusting your search query or region filter to discover luxury sanctuaries.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedRegion('All')
              setSortByProximity(false)
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-500/20 border border-blue-500/40 text-blue-400 hover:bg-blue-500/30 transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Destination Detail Modal */}
      <DestinationModal
        destination={selectedDestination}
        isOpen={!!selectedDestination}
        onClose={() => setSelectedDestination(null)}
        onGenerateItinerary={onGenerateItinerary}
      />
    </section>
  )
}
