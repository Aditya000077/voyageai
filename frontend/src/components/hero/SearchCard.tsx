import React, { useState } from 'react'
import { Sparkles, ArrowRight, User, Users, Heart, Home, Calendar, Wallet, Compass, Palmtree, Mountain, Utensils } from 'lucide-react'
import { TravelerType, BudgetTier, TravelStyle, TripFilters } from '../../types'

interface SearchCardProps {
  onPlanQuery: (query: string, filters?: Partial<TripFilters>) => void
  userCity?: string | null
  userLat?: number | null
  userLng?: number | null
}

export const SearchCard: React.FC<SearchCardProps> = ({
  onPlanQuery,
  userCity,
}) => {
  const [destination, setDestination] = useState('')
  const [travelerType, setTravelerType] = useState<TravelerType>('couple')
  const [days, setDays] = useState<number>(3)
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('moderate')
  const [travelStyle, setTravelStyle] = useState<TravelStyle>('culture')

  const travelerOptions: { id: TravelerType; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'solo', label: 'Solo Explorer', icon: User },
    { id: 'couple', label: 'Couple', icon: Heart },
    { id: 'family', label: 'Family with Kids', icon: Home },
    { id: 'friends', label: 'Friends Group', icon: Users },
  ]

  const durationOptions = [
    { days: 2, label: '1-2 Days (Weekend)' },
    { days: 3, label: '3-4 Days (Short Trip)' },
    { days: 5, label: '5-7 Days (Week)' },
    { days: 8, label: '8-10 Days (Extended)' },
  ]

  const budgetOptions: { id: BudgetTier; label: string; range: string }[] = [
    { id: 'budget', label: 'Budget / Backpacker', range: 'Under ₹15,000' },
    { id: 'moderate', label: 'Moderate / Comfort', range: '₹15,000 – ₹40,000' },
    { id: 'premium', label: 'Premium / Deluxe', range: '₹40,000 – ₹1,00,000' },
    { id: 'luxury', label: 'Luxury / 5-Star', range: '₹1,00,000+' },
  ]

  const styleOptions: { id: TravelStyle; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'culture', label: 'Heritage & Culture', icon: Compass },
    { id: 'nature', label: 'Nature & Scenic', icon: Mountain },
    { id: 'adventure', label: 'Adventure & Trekking', icon: Mountain },
    { id: 'relaxed', label: 'Beach & Relaxation', icon: Palmtree },
    { id: 'food', label: 'Food & Nightlife', icon: Utensils },
  ]

  const quickSuggestions = [
    ...(userCity ? [`📍 Weekend Getaway Near ${userCity}`] : ['📍 Weekend Nearby Getaway']),
    '💑 Romantic 3-Day Couple Escape in Jaipur',
    '👤 3-Day Solo Backpacking in Manali under ₹10,000',
    '👨‍👩‍👧 5-Day Family Trip in Kyoto',
    '🌊 Relaxed 4-Day Beach Trip in Goa',
  ]

  const buildPrompt = () => {
    const dest = destination.trim() || (userCity ? `near ${userCity}` : 'Kyoto')
    const budgetMap: Record<BudgetTier, string> = {
      budget: 'under ₹15,000',
      moderate: 'under ₹35,000',
      premium: 'under ₹75,000',
      luxury: 'under ₹1,50,000',
    }
    const styleLabelMap: Record<TravelStyle, string> = {
      culture: 'heritage and culture',
      nature: 'nature and scenic viewpoints',
      adventure: 'adventure and outdoor trekking',
      relaxed: 'relaxed beach and leisure',
      food: 'local food and culinary discovery',
    }
    return `${days} days ${travelerType} trip to ${dest} focusing on ${styleLabelMap[travelStyle]} ${budgetMap[budgetTier]}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const compiled = buildPrompt()
    onPlanQuery(compiled, {
      travelerType,
      days,
      budgetTier,
      travelStyle,
    })
  }

  const handleSuggestionClick = (s: string) => {
    setDestination(s.replace(/^[^\w]+/, '').trim())
    onPlanQuery(s)
  }

  return (
    <div
      className="rounded-3xl p-4 sm:p-6 gradient-border text-left w-full max-w-4xl mx-auto space-y-5"
      style={{
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 40px rgba(16,185,129,0.12)',
      }}
    >
      {/* Search Input Row */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Where do you want to go? e.g. Jaipur, Manali, Kyoto, Goa, Paris..."
            className="input-glow w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm transition-all duration-200 outline-none text-slate-100 placeholder:text-slate-500 bg-slate-900/90 border border-slate-800 focus:border-emerald-500/50"
            style={{ fontFamily: 'var(--font-body)' }}
          />
        </div>
        <button
          type="submit"
          className="px-7 py-3.5 rounded-2xl font-bold text-sm text-slate-950 flex items-center justify-center gap-2 transition-all duration-300 whitespace-nowrap cursor-pointer shadow-lg shadow-emerald-500/30 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <span>Plan Trip</span>
          <ArrowRight size={16} />
        </button>
      </form>

      {/* Interactive Trip Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4">
        {/* Row 1: Traveler Type */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User size={12} className="text-emerald-400" /> Who is Traveling?
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold capitalize">
              {travelerType}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {travelerOptions.map((opt) => {
              const Icon = opt.icon
              const isSelected = travelerType === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTravelerType(opt.id)}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon size={14} className={isSelected ? 'text-emerald-400' : 'text-slate-500'} />
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Row 2: Duration & Budget Tier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Duration */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar size={12} className="text-emerald-400" /> Duration
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {durationOptions.map((d) => {
                const isSelected = days === d.days
                return (
                  <button
                    key={d.days}
                    type="button"
                    onClick={() => setDays(d.days)}
                    className={`py-2 px-2.5 rounded-xl text-[11px] font-mono font-medium transition-all text-center cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Budget Tier */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wallet size={12} className="text-emerald-400" /> Budget Range
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {budgetOptions.map((b) => {
                const isSelected = budgetTier === b.id
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBudgetTier(b.id)}
                    className={`py-1.5 px-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[11px] font-mono font-semibold truncate">{b.label}</div>
                    <div className="text-[9px] font-mono opacity-70 truncate">{b.range}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Row 3: Trip Style / Vibe */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Compass size={12} className="text-emerald-400" /> Trip Style & Vibe
          </span>
          <div className="flex flex-wrap gap-1.5">
            {styleOptions.map((s) => {
              const Icon = s.icon
              const isSelected = travelStyle === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setTravelStyle(s.id)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon size={13} className={isSelected ? 'text-cyan-400' : 'text-slate-500'} />
                  <span>{s.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Live Filter Summary Preview */}
        <div className="pt-2 border-t border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 font-mono gap-1">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>AI Prompt Match:</span>
            <span className="text-emerald-300 font-semibold truncate max-w-md">
              {buildPrompt()}
            </span>
          </span>
          <span className="text-[10px] text-slate-500">Tailors hotel, activities & budget</span>
        </div>
      </div>

      {/* Quick Suggestions Chips */}
      <div className="flex items-center flex-wrap gap-2 pt-1">
        <span className="text-[11px] font-mono text-slate-400 mr-1">Popular Trips:</span>
        {quickSuggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSuggestionClick(s)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer bg-slate-900/70 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/40 hover:bg-emerald-500/10 flex items-center gap-1"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
