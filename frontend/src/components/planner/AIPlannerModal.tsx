import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { plannerService } from '../../services/plannerService'
import { GeneratedItinerary, ItineraryDay, TripFilters, TravelerType, BudgetTier, TravelStyle } from '../../types'
import { ModalNavPanel } from '../navigation/ModalNavPanel'
import { CityInfoCard } from './CityInfoCard'
import {
  Sparkles, CheckCircle2, Loader2, ShieldCheck,
  Download, Hotel, AlertCircle, Edit3, Plus, Trash2,
  Clock, Check, RotateCcw, X, Calendar, MapPin, Camera,
  Send, Bot, User, Edit2, MessageSquare, SlidersHorizontal,
  Users, Heart, Baby, Compass, IndianRupee, MapPinOff
} from 'lucide-react'
import { formatPriceInRupees } from '../../utils/currencyUtils'
import { getPlacePhoto, fetchPlacePhoto, CURATED_PLACE_PRESETS } from '../../utils/placeImages'

// ─── Dynamic Place Image Component ──────────────────────────────────────────
// Loads the best-matching landmark photo for any city/place in the world.
// Uses the curated dictionary first (instant), then falls back to Wikipedia API.
const DynamicPlaceImage: React.FC<{
  src: string
  placeText: string
  city: string
  slot: 'morning' | 'afternoon' | 'evening'
  alt: string
  className?: string
}> = ({ src, placeText, city, slot, alt, className = '' }) => {
  const [imgSrc, setImgSrc] = React.useState(src)
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    setLoaded(false)
    setImgSrc(src)
    let cancelled = false

    const GENERIC_PREFIXES = [
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
      'https://images.unsplash.com/photo-1488085061387-422e29b40080',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
    ]
    const isGeneric = !src || GENERIC_PREFIXES.some(g => src.startsWith(g))

    if (isGeneric) {
      fetchPlacePhoto(placeText, city, slot).then((url) => {
        if (!cancelled && url && url !== src) setImgSrc(url)
        if (!cancelled) setLoaded(true)
      })
    } else {
      setLoaded(true)
    }

    return () => { cancelled = true }
  }, [placeText, city, slot, src])

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onLoad={() => setLoaded(true)}
      onError={(e) => {
        const slotFallback = slot === 'evening'
          ? 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&h=600&fit=crop&auto=format'
          : slot === 'afternoon'
            ? 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&h=600&fit=crop&auto=format'
            : 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop&auto=format'
        ;(e.target as HTMLImageElement).src = slotFallback
      }}
      style={{ opacity: loaded ? 1 : 0.7, transition: 'opacity 0.4s ease' }}
    />
  )
}

interface AIPlannerModalProps {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
  initialFilters?: TripFilters
  userLat?: number | null
  userLng?: number | null
  userCity?: string | null
  onUpdateCity?: (city: string, lat?: number, lng?: number) => void
}

interface ChatMessageItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
  modifiedItinerary?: boolean
}

const DURATION_PRESETS = [
  '1 hr',
  '1.5 hrs',
  '2 hrs',
  '2.5 hrs',
  '3 hrs',
  '4 hrs',
  'Half Day (5h)',
  'Full Day (8h)',
]

export const AIPlannerModal: React.FC<AIPlannerModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '3 days heritage and cultural journey in Jaipur',
  initialFilters,
  userLat = null,
  userLng = null,
  userCity = null,
  onUpdateCity,
}) => {
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<TripFilters>({
    traveler_type: initialFilters?.traveler_type || 'couple',
    days: initialFilters?.days || 3,
    budget_tier: initialFilters?.budget_tier || 'moderate',
    travel_style: initialFilters?.travel_style || 'cultural',
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null)
  const [originalItinerary, setOriginalItinerary] = useState<GeneratedItinerary | null>(null)
  const [activeDayTab, setActiveDayTab] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [locationError, setLocationError] = useState<{
    searched: string
    message: string
    suggestions: string[]
  } | null>(null)

  // View Mode: 'plan' = day-by-day itinerary; 'chat' = conversational AI concierge chatbot
  const [activeViewMode, setActiveViewMode] = useState<'plan' | 'chat'>('plan')
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatSending, setIsChatSending] = useState(false)

  // Origin Departure City Editing inside Modal
  const [isEditingOrigin, setIsEditingOrigin] = useState(false)
  const [originInput, setOriginInput] = useState(userCity || 'Chengalpattu')

  // Editing state
  const [isEditing, setIsEditing] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null)

  const steps = [
    `Parsing travel prompt & preferences (${filters.traveler_type.toUpperCase()} · ${filters.budget_tier.toUpperCase()} BUDGET)...`,
    'Verifying global destination via Google Maps & GIS atlas...',
    'Checking weather patterns, seasonal timings & crowd-free hours...',
    'Curating daily itinerary, personalized activities & cost estimates...',
    'Synthesising custom itinerary with AI match score!',
  ]

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    if (initialFilters) {
      setFilters((prev) => ({ ...prev, ...initialFilters }))
    }
  }, [initialFilters])

  useEffect(() => {
    if (isOpen) {
      const activePrompt = initialQuery || query
      setQuery(activePrompt)
      const activeF = initialFilters ? { ...filters, ...initialFilters } : filters
      runAIGeneration(activePrompt, activeF)
    } else {
      setIsGenerating(false)
      setGenerationStep(0)
      setItinerary(null)
      setOriginalItinerary(null)
      setIsEditing(false)
      setNotification(null)
      setError(null)
      setLocationError(null)
    }
  }, [isOpen])

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const animateSteps = () => {
    setGenerationStep(0)
    const timings = [600, 1400, 2200, 3000]
    timings.forEach((delay, idx) => {
      setTimeout(() => setGenerationStep(idx + 1), delay)
    })
  }

  const normalizeDay = (d: any, index: number): ItineraryDay => ({
    day: d.day ?? index + 1,
    title: d.title ?? `Day ${index + 1}: Highlights & Exploration`,
    morning: d.morning ?? 'Morning exploration and landmark sightseeing.',
    morning_time: d.morning_time ?? '09:00 AM – 11:30 AM (2.5 hrs)',
    morning_duration: d.morning_duration ?? '2.5 hrs',
    morning_image: getPlacePhoto(d.morning_image, d.morning, 'morning', query),
    afternoon: d.afternoon ?? 'Afternoon cultural experience and relaxation.',
    afternoon_time: d.afternoon_time ?? '01:30 PM – 04:30 PM (3 hrs)',
    afternoon_duration: d.afternoon_duration ?? '3 hrs',
    afternoon_image: getPlacePhoto(d.afternoon_image, d.afternoon, 'afternoon', query),
    evening: d.evening ?? 'Evening dining and promenade.',
    evening_time: d.evening_time ?? '06:30 PM – 09:00 PM (2.5 hrs)',
    evening_duration: d.evening_duration ?? '2.5 hrs',
    evening_image: getPlacePhoto(d.evening_image, d.evening, 'evening', query),
    stay: d.stay ?? 'Curated Stay / Hotel',
  })

  const runAIGeneration = async (searchPrompt: string, overrideFilters?: TripFilters) => {
    setIsGenerating(true)
    setItinerary(null)
    setOriginalItinerary(null)
    setIsEditing(false)
    setNotification(null)
    setError(null)
    setLocationError(null)
    setActiveDayTab(1)
    animateSteps()

    const activeF = overrideFilters || filters

    try {
      // Call the real Django backend with prompt + user GPS location + dynamic filters
      const result = await plannerService.generateItinerary({
        prompt: searchPrompt,
        save_result: true,
        user_latitude: userLat,
        user_longitude: userLng,
        user_city: userCity,
        traveler_type: activeF.traveler_type,
        budget_tier: activeF.budget_tier,
        travel_style: activeF.travel_style,
        days: activeF.days,
        budget: activeF.budget,
      })

      // Wait a minimum of 3.5 s so the animation can finish
      await new Promise((res) => setTimeout(res, 3500))

      const rawDays = result.days ?? result.days_data ?? []
      const normalizedDays = rawDays.map(normalizeDay)
      const normalizedItinerary = {
        ...result,
        days: normalizedDays,
        days_data: normalizedDays,
      }

      setItinerary(normalizedItinerary)
      setOriginalItinerary(JSON.parse(JSON.stringify(normalizedItinerary)))
      setChatMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hello! I'm your VoyageAI Concierge. I've designed your personalized trip for ${normalizedItinerary.destination} (${normalizedItinerary.duration}) tailored for a ${activeF.traveler_type} trip with ${activeF.budget_tier} budget. Feel free to ask me for recommendations or instruct me to adjust activities, change stays, or add days!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } catch (err: any) {
      const errData = err?.response?.data
      if (errData?.location_not_found) {
        setLocationError({
          searched: errData.searched_location || 'Specified location',
          message: errData.error || `Location "${errData.searched_location}" was not found on Google Maps.`,
          suggestions: errData.suggestions || ['Perth', 'Paris', 'Jaipur'],
        })
      } else {
        setError(err.message || 'Backend unreachable — please make sure the Django server is running on port 8000.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendChatMessage = async (presetText?: string) => {
    const text = (presetText || chatInput).trim()
    if (!text || isChatSending) return

    const userMsg: ChatMessageItem = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setChatMessages((prev) => [...prev, userMsg])
    if (!presetText) setChatInput('')
    setIsChatSending(true)

    try {
      const resp = await plannerService.chatRefine({
        message: text,
        current_itinerary: itinerary,
        chat_history: chatMessages.map((m) => ({ role: m.role, content: m.content })),
        user_city: userCity,
        user_latitude: userLat,
        user_longitude: userLng,
        traveler_type: filters.traveler_type,
        budget_tier: filters.budget_tier,
        travel_style: filters.travel_style,
        days: filters.days,
        budget: filters.budget,
      })

      const assistantMsg: ChatMessageItem = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: resp.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modifiedItinerary: resp.modify_itinerary,
      }
      setChatMessages((prev) => [...prev, assistantMsg])

      if (resp.modify_itinerary && resp.updated_itinerary) {
        const rawDays = resp.updated_itinerary.days ?? resp.updated_itinerary.days_data ?? []
        const normalizedDays = rawDays.map(normalizeDay)
        const updated = {
          ...itinerary,
          ...resp.updated_itinerary,
          days: normalizedDays,
          days_data: normalizedDays,
        }
        setItinerary(updated)
        setNotification({
          type: 'success',
          message: '✨ AI Concierge updated your itinerary! Switch to Daily Plan to review.',
        })
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: `I'm analyzing your request for ${itinerary?.destination || 'your trip'}. You can also use the Edit Itinerary button in the Daily Plan tab to directly adjust any activity or time duration.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setIsChatSending(false)
    }
  }

  const handleReGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    runAIGeneration(query, filters)
  }


  // Get current active days array safely
  const currentDays: ItineraryDay[] = itinerary?.days ?? itinerary?.days_data ?? []

  // ─── ADD DAY ───
  const handleAddDay = () => {
    if (!itinerary) return
    const nextDayNum = currentDays.length + 1
    const lastStay = currentDays.length > 0 ? currentDays[currentDays.length - 1].stay : 'Curated Stay / Hotel'

    const newDay: ItineraryDay = {
      day: nextDayNum,
      title: `Day ${nextDayNum}: Local Heritage & Hidden Gems`,
      morning: 'Morning guided walk through local historical landmarks and vibrant artisanal markets.',
      morning_time: '09:00 AM – 11:30 AM (2.5 hrs)',
      morning_duration: '2.5 hrs',
      morning_image: getPlacePhoto(null, 'heritage landmark market', 'morning', itinerary.destination),
      afternoon: 'Afternoon scenic discovery, boutique artisan workshops, and specialty café relaxation.',
      afternoon_time: '01:30 PM – 04:30 PM (3 hrs)',
      afternoon_duration: '3 hrs',
      afternoon_image: getPlacePhoto(null, 'scenic viewpoint boutique cafe', 'afternoon', itinerary.destination),
      evening: 'Sunset promenade followed by authentic regional gourmet tasting dinner.',
      evening_time: '06:30 PM – 09:00 PM (2.5 hrs)',
      evening_duration: '2.5 hrs',
      evening_image: getPlacePhoto(null, 'sunset promenade gourmet dinner', 'evening', itinerary.destination),
      stay: lastStay,
    }

    const updatedDays = [...currentDays, newDay]
    const updatedDuration = `${nextDayNum} Days / ${Math.max(1, nextDayNum - 1)} Nights`

    setItinerary({
      ...itinerary,
      duration: updatedDuration,
      days: updatedDays,
      days_data: updatedDays,
    })

    setActiveDayTab(nextDayNum)
    setIsEditing(true)
    setNotification({
      type: 'success',
      message: `Added Day ${nextDayNum}! You can now edit places and estimated visit times below.`,
    })
  }

  // ─── REDUCE / DELETE DAY ───
  const handleDeleteDay = (dayNum: number) => {
    if (!itinerary) return
    if (currentDays.length <= 1) {
      setNotification({
        type: 'error',
        message: 'Your itinerary must contain at least 1 day.',
      })
      return
    }

    // Filter out the day and re-index remaining days
    const remainingDays = currentDays
      .filter((d) => d.day !== dayNum)
      .map((d, idx) => ({
        ...d,
        day: idx + 1,
        title: d.title.replace(/^Day \d+:/, `Day ${idx + 1}:`),
      }))

    const updatedDuration = `${remainingDays.length} Days / ${Math.max(1, remainingDays.length - 1)} Nights`

    setItinerary({
      ...itinerary,
      duration: updatedDuration,
      days: remainingDays,
      days_data: remainingDays,
    })

    // Adjust active tab if the deleted day was active or out of bounds
    if (activeDayTab >= dayNum) {
      setActiveDayTab(Math.max(1, Math.min(activeDayTab - 1, remainingDays.length)))
    }

    setNotification({
      type: 'info',
      message: `Removed Day ${dayNum}. Total duration updated to ${remainingDays.length} Days.`,
    })
  }

  // ─── EDIT DAY FIELDS (Places, Title, Stay) ───
  const handleUpdateDayField = (dayNum: number, field: keyof ItineraryDay, value: string) => {
    if (!itinerary) return
    const updatedDays = currentDays.map((d) => {
      if (d.day === dayNum) {
        return { ...d, [field]: value }
      }
      return d
    })

    setItinerary({
      ...itinerary,
      days: updatedDays,
      days_data: updatedDays,
    })
  }

  // ─── EDIT TIME MARK (Preset Quick Selector) ───
  const handleSelectPresetDuration = (
    dayNum: number,
    slot: 'morning' | 'afternoon' | 'evening',
    preset: string
  ) => {
    if (!itinerary) return
    const durationField = `${slot}_duration` as keyof ItineraryDay
    const timeField = `${slot}_time` as keyof ItineraryDay

    let defaultStartTime = '09:00 AM'
    if (slot === 'afternoon') defaultStartTime = '01:30 PM'
    if (slot === 'evening') defaultStartTime = '06:30 PM'

    const updatedDays = currentDays.map((d) => {
      if (d.day === dayNum) {
        return {
          ...d,
          [durationField]: preset,
          [timeField]: `${defaultStartTime} (${preset} visit)`,
        }
      }
      return d
    })

    setItinerary({
      ...itinerary,
      days: updatedDays,
      days_data: updatedDays,
    })
  }

  // ─── SAVE EDIT ───
  const handleSaveEdit = async () => {
    setIsEditing(false)
    setNotification({
      type: 'success',
      message: '✅ Itinerary customized successfully! All days, places & visit times saved.',
    })

    // If there is an ID from backend, attempt to update it
    if (itinerary?.id && !itinerary.id.startsWith('itin-')) {
      try {
        await plannerService.updateItinerary(itinerary.id, {
          duration: itinerary.duration,
          days_data: itinerary.days,
        })
      } catch (err) {
        // Local state remains updated even if backend patch fails
      }
    }
  }

  // ─── RESET TO AI ORIGINAL ───
  const handleResetOriginal = () => {
    if (originalItinerary) {
      setItinerary(JSON.parse(JSON.stringify(originalItinerary)))
      setActiveDayTab(1)
      setIsEditing(false)
      setNotification({
        type: 'info',
        message: 'Restored the original AI-generated itinerary.',
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="VoyageAI Global Neural Generator" maxWidth="max-w-4xl">
      <div className="space-y-6">

        {/* Prompt Re-entry bar */}
        <form onSubmit={handleReGenerate} className="flex gap-2">
          <div className="relative flex-1">
            <Sparkles size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your global travel prompt..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <Button type="submit" variant="primary" disabled={isGenerating}>
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>{isGenerating ? 'Generating…' : 'Generate'}</span>
          </Button>
        </form>

        {/* Interactive Trip Filter Customizer Bar */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] font-mono text-slate-400 mr-0.5 flex items-center gap-1 font-semibold">
              <SlidersHorizontal size={13} className="text-emerald-400" /> FILTERS:
            </span>

            {/* Traveler Selector */}
            <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1">
              <select
                aria-label="Traveler Type"
                value={filters.traveler_type}
                onChange={(e) => setFilters(prev => ({ ...prev, traveler_type: e.target.value as TravelerType }))}
                className="bg-transparent text-emerald-300 text-xs font-mono focus:outline-none cursor-pointer"
              >
                <option value="solo" className="bg-slate-950 text-white">👤 Solo Explorer</option>
                <option value="couple" className="bg-slate-950 text-white">💑 Couple / Duo</option>
                <option value="family" className="bg-slate-950 text-white">👨‍👩‍👧 Family with Kids</option>
                <option value="friends" className="bg-slate-950 text-white">🎒 Friends Group</option>
              </select>
            </div>

            {/* Days Selector */}
            <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1">
              <select
                aria-label="Trip Duration"
                value={filters.days}
                onChange={(e) => setFilters(prev => ({ ...prev, days: Number(e.target.value) }))}
                className="bg-transparent text-cyan-300 text-xs font-mono focus:outline-none cursor-pointer"
              >
                <option value={2} className="bg-slate-950 text-white">📅 2 Days (Weekend)</option>
                <option value={3} className="bg-slate-950 text-white">📅 3 Days (Short Trip)</option>
                <option value={5} className="bg-slate-950 text-white">📅 5 Days (Full Week)</option>
                <option value={7} className="bg-slate-950 text-white">📅 7 Days (Expedition)</option>
                <option value={10} className="bg-slate-950 text-white">📅 10 Days (Grand Tour)</option>
              </select>
            </div>

            {/* Budget Selector */}
            <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1">
              <select
                aria-label="Budget Range"
                value={filters.budget_tier}
                onChange={(e) => setFilters(prev => ({ ...prev, budget_tier: e.target.value as BudgetTier }))}
                className="bg-transparent text-amber-300 text-xs font-mono focus:outline-none cursor-pointer"
              >
                <option value="budget" className="bg-slate-950 text-white">💰 Budget (&lt; ₹15,000)</option>
                <option value="moderate" className="bg-slate-950 text-white">💳 Moderate (₹15k–₹40k)</option>
                <option value="premium" className="bg-slate-950 text-white">✨ Premium (₹40k–₹1L)</option>
                <option value="luxury" className="bg-slate-950 text-white">👑 Luxury (₹1L+)</option>
              </select>
            </div>

            {/* Style Selector */}
            <div className="flex items-center bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1">
              <select
                aria-label="Trip Vibe & Style"
                value={filters.travel_style}
                onChange={(e) => setFilters(prev => ({ ...prev, travel_style: e.target.value as TravelStyle }))}
                className="bg-transparent text-purple-300 text-xs font-mono focus:outline-none cursor-pointer"
              >
                <option value="cultural" className="bg-slate-950 text-white">🏛️ Culture & Heritage</option>
                <option value="nature" className="bg-slate-950 text-white">🌿 Nature & Scenic</option>
                <option value="adventure" className="bg-slate-950 text-white">🧗 Adventure & Trek</option>
                <option value="beach" className="bg-slate-950 text-white">🏖️ Beach & Relaxation</option>
                <option value="foodie" className="bg-slate-950 text-white">🍜 Food & Nightlife</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => runAIGeneration(query, filters)}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer transition-all ml-auto"
            title="Apply selected filters and re-generate trip"
          >
            <RotateCcw size={12} className={isGenerating ? 'animate-spin' : ''} />
            <span>Apply Filters</span>
          </button>
        </div>

        {/* Notification / Alert toast */}
        {notification && (
          <div
            className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-mono transition-all animate-fadeIn ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : notification.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="p-1 hover:bg-white/10 rounded cursor-pointer transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Location Verification Alert Card (Google Maps validation) */}
        {locationError && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-3 animate-fadeIn">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <MapPinOff size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white">Location Not Found on Google Maps</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Geocoding Atlas Verification
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    <strong className="text-amber-300">"{locationError.searched}"</strong> was not detected as an existing city or travel destination on the map.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLocationError(null)}
                className="p-1 hover:bg-white/10 rounded cursor-pointer transition-colors text-slate-400 hover:text-white shrink-0"
              >
                <X size={14} />
              </button>
            </div>

            {/* Clickable Alternative Suggestions */}
            {locationError.suggestions && locationError.suggestions.length > 0 && (
              <div className="pt-2.5 border-t border-amber-500/20 space-y-2">
                <span className="text-[11px] font-mono text-slate-400 block font-semibold">
                  Did you mean one of these real destinations?
                </span>
                <div className="flex flex-wrap gap-2">
                  {locationError.suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        const regex = new RegExp(locationError.searched, 'gi')
                        const newQuery = query.replace(regex, sug)
                        setQuery(newQuery)
                        setLocationError(null)
                        runAIGeneration(newQuery)
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                    >
                      <Sparkles size={12} className="text-emerald-400" />
                      <span>{sug}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-mono">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* AI Step-by-step streaming animation */}
        {isGenerating && (
          <div className="p-8 rounded-2xl bg-slate-900/90 border border-emerald-500/30 text-center space-y-6 shadow-xl backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 animate-pulse">
              <Sparkles size={32} />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Global Engine Orchestration in Progress
              </h4>
              <p className="text-xs font-mono text-emerald-400">
                Connecting to VoyageAI Global Engine — processing prompt against 12,000+ worldwide routes…
              </p>
            </div>
            <div className="space-y-2.5 max-w-md mx-auto text-left">
              {steps.map((st, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  {idx < generationStep ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  ) : idx === generationStep ? (
                    <Loader2 size={16} className="text-emerald-400 animate-spin shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-700 shrink-0 inline-block" />
                  )}
                  <span className={idx <= generationStep ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                    {st}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Itinerary */}
        {!isGenerating && itinerary && (
          <div className="space-y-6">

            {/* Header summary card with Edit Mode Toggle */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge color="#10B981">{itinerary.ai_match_score ?? itinerary.aiMatchScore}% AI MATCH</Badge>
                  {itinerary.llm_provider && (
                    <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1">
                      <Sparkles size={10} className="text-cyan-400" />
                      {itinerary.llm_provider}
                    </span>
                  )}
                  <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    {itinerary.duration}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    · {currentDays.length} {currentDays.length === 1 ? 'Day' : 'Days'} Total
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  {itinerary.destination}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-lg">{itinerary.summary}</p>

                {/* Origin Departure City Editor */}
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <MapPin size={12} className="text-emerald-400" /> Departing from:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOriginInput(userCity || 'Chengalpattu')
                      setIsEditingOrigin(!isEditingOrigin)
                    }}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-emerald-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer border border-emerald-500/20 transition-colors"
                    title="Change Departure Location"
                  >
                    <span className="font-semibold">{userCity || 'Chengalpattu'}</span>
                    <Edit2 size={10} className="text-slate-400" />
                  </button>
                </div>

                {/* Origin Location Editor Popover */}
                {isEditingOrigin && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-emerald-500/40 shadow-xl space-y-2 max-w-sm animate-fadeIn">
                    <div className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center justify-between">
                      <span>Select or Type Origin City:</span>
                      <span className="text-slate-500">Live GPS Route Sync</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={originInput}
                        onChange={(e) => setOriginInput(e.target.value)}
                        placeholder="e.g. Chengalpattu, Chennai, Jaipur..."
                        className="bg-slate-900 border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg text-white font-mono flex-1 focus:border-emerald-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (originInput.trim() && onUpdateCity) {
                            onUpdateCity(originInput.trim())
                            setIsEditingOrigin(false)
                            setNotification({
                              type: 'success',
                              message: `Origin updated to ${originInput.trim()}! Navigation routes updated.`,
                            })
                          }
                        }}
                        className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingOrigin(false)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {['Chengalpattu', 'Chennai', 'Jaipur', 'Bengaluru', 'Mumbai', 'Delhi'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            if (onUpdateCity) {
                              onUpdateCity(preset)
                              setOriginInput(preset)
                              setIsEditingOrigin(false)
                              setNotification({
                                type: 'success',
                                message: `Origin updated to ${preset}! Navigation routes updated.`,
                              })
                            }
                          }}
                          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-emerald-500/20 hover:text-emerald-300 border border-slate-800 text-[10px] font-mono text-slate-300 cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0 w-full sm:w-auto">
                <div className="text-right bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 shrink-0 w-full sm:w-auto">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Estimated Trip Cost</span>
                  <span className="text-2xl font-black text-emerald-400" style={{ fontFamily: 'var(--font-display)' }}>
                    {formatPriceInRupees(itinerary.estimated_cost ?? itinerary.estimatedCost)}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-300/80 block capitalize">
                    {filters.budget_tier} Tier · {filters.traveler_type === 'solo' ? 'Solo Traveler' : filters.traveler_type === 'couple' ? 'Couple' : filters.traveler_type === 'family' ? 'Family (Kids)' : 'Friends Group'}
                  </span>
                </div>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveViewMode('plan')
                    setIsEditing(!isEditing)
                  }}
                  className={`px-4 py-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    isEditing
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                  }`}
                >
                  <Edit3 size={15} />
                  <span>{isEditing ? 'Editing Mode' : 'Edit Itinerary'}</span>
                </button>
              </div>
            </div>

            {/* ─── Mode Switcher Bar: Plan vs Chatbot ─── */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveViewMode('plan')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeViewMode === 'plan'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar size={14} />
                <span>Daily Itinerary ({currentDays.length} Days)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveViewMode('chat')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
                  activeViewMode === 'chat'
                    ? 'bg-gradient-to-r from-emerald-500/25 to-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles size={14} className="text-emerald-400" />
                <span>AI Travel Concierge Chatbot</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            </div>

            {/* ─── View Content: Chatbot vs Daily Plan ─── */}
            {activeViewMode === 'chat' ? (
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl">
                {/* Chat Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
                      <Bot size={17} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        VoyageAI Travel Concierge
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Interactive AI Assistant
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Ask travel questions or instruct the AI to modify any part of your {itinerary.destination} itinerary in natural language.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveViewMode('plan')}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>View Daily Plan</span> &rarr;
                  </button>
                </div>

                {/* Chat Message List */}
                <div className="h-[360px] overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 text-xs shadow">
                          <Sparkles size={13} />
                        </div>
                      )}
                      <div
                        className={`max-w-lg rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-sm shadow-md'
                            : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-sm shadow-inner'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>

                        {msg.modifiedItinerary && (
                          <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={12} /> Itinerary modified by AI
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveViewMode('plan')}
                              className="text-[10px] font-mono font-bold text-cyan-300 hover:underline cursor-pointer"
                            >
                              Switch to Daily Plan &rarr;
                            </button>
                          </div>
                        )}

                        <div className={`text-[10px] font-mono ${msg.role === 'user' ? 'text-emerald-200/80' : 'text-slate-500'} text-right`}>
                          {msg.time}
                        </div>
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 text-xs">
                          <User size={13} />
                        </div>
                      )}
                    </div>
                  ))}

                  {isChatSending && (
                    <div className="flex gap-3 justify-start items-center">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                        <Loader2 size={13} className="animate-spin" />
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>AI Concierge is analyzing your request and updating itinerary...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Suggestion Chips */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-400 block">Suggested Inquiries & Instructions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      '🍛 Recommend authentic local food & rooftop cafes',
                      '✨ Make Day 2 more relaxed with sunset views',
                      '➕ Add an extra day for shopping & artisan crafts',
                      '🏛️ What are the top 3 historical monuments?',
                      '💰 Adjust budget to ₹35,000',
                      '🎒 What should I pack for this trip?',
                    ].map((promptText) => (
                      <button
                        key={promptText}
                        type="button"
                        onClick={() => handleSendChatMessage(promptText)}
                        disabled={isChatSending}
                        className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-300 border border-slate-700 text-[11px] text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {promptText}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendChatMessage()
                  }}
                  className="flex gap-2 pt-1"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`Ask AI about ${itinerary.destination} or instruct changes (e.g. "Swap day 2 afternoon for royal palace")...`}
                    disabled={isChatSending}
                    className="flex-1 bg-slate-950 border border-slate-700 text-xs px-4 py-3 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isChatSending || !chatInput.trim()}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-md shadow-emerald-500/10 shrink-0"
                  >
                    {isChatSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    <span>Send</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                {/* AI Chat Prompt Helper */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-emerald-400 shrink-0" />
                    <span>Want the AI to modify any day or recommend food & transport?</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveViewMode('chat')}
                    className="font-mono text-cyan-400 hover:text-cyan-300 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                  >
                    <span>Chat with AI Concierge</span> &rarr;
                  </button>
                </div>



            {/* ─── Edit Mode Top Controls Bar ─── */}
            {isEditing && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/40 border border-amber-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                        Interactive Itinerary Customizer Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Add or reduce days, edit places & activities, and set visit time marks so travelers know their visit duration.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleAddDay}
                      className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      <Plus size={14} />
                      <span>+ Add Day</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-emerald-500/40 flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Check size={14} />
                      <span>Save Changes</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetOriginal}
                      title="Revert all changes to AI generated original"
                      className="px-3 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <RotateCcw size={13} />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── City Info from Uploaded Database ─── */}
            <CityInfoCard destinationName={itinerary.destination} />

            {/* ─── Day Tabs Bar ─── */}
            <div>
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
                {currentDays.map((d) => (
                  <div key={d.day} className="relative group shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveDayTab(d.day)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-2 ${
                        activeDayTab === d.day
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>Day {d.day}</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        ({d.title?.split(' ')[0] || 'Plan'})
                      </span>
                    </button>

                    {/* Quick remove button in edit mode */}
                    {isEditing && currentDays.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteDay(d.day)
                        }}
                        title={`Delete Day ${d.day}`}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500/80 text-white flex items-center justify-center text-[10px] hover:bg-red-600 cursor-pointer shadow transition-all opacity-80 group-hover:opacity-100"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ))}

                {/* Quick Add Day Button in Tabs Bar */}
                <button
                  type="button"
                  onClick={handleAddDay}
                  className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900/70 border border-dashed border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  title="Add a new day to this itinerary"
                >
                  <Plus size={13} />
                  <span>Add Day</span>
                </button>
              </div>

              {/* ─── Active Day Detail Card ─── */}
              {currentDays
                .filter((d) => d.day === activeDayTab)
                .map((d) => (
                  <div
                    key={d.day}
                    className={`p-5 rounded-2xl bg-slate-900/60 border mt-4 space-y-5 transition-all ${
                      isEditing ? 'border-emerald-500/40 bg-slate-900/80' : 'border-slate-800'
                    }`}
                  >
                    {/* Day Title & Day Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                      {isEditing ? (
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                            <Edit3 size={12} /> Day {d.day} Title:
                          </label>
                          <input
                            type="text"
                            value={d.title.replace(/^Day\s*\d+\s*:\s*/i, '')}
                            onChange={(e) => handleUpdateDayField(d.day, 'title', e.target.value)}
                            placeholder="Enter day title / highlight..."
                            className="w-full bg-slate-950 border border-slate-700 px-3.5 py-2 rounded-xl text-white font-bold text-sm focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                            Day {d.day}: {d.title.replace(/^Day\s*\d+\s*:\s*/i, '')}
                          </h4>
                        </div>
                      )}

                      {/* Day Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isEditing && currentDays.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteDay(d.day)}
                            className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 cursor-pointer transition-all flex items-center gap-1.5"
                          >
                            <Trash2 size={13} />
                            <span>Remove Day {d.day}</span>
                          </button>
                        )}
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-400 hover:text-emerald-400 bg-slate-950 border border-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit3 size={11} />
                            <span>Edit Day</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ─── 3 Places & Time Slots (Morning, Afternoon, Evening) ─── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          slot: 'morning' as const,
                          label: 'MORNING 🌅',
                          color: 'text-amber-400',
                          badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
                          text: d.morning,
                          duration: d.morning_duration || '2.5 hrs',
                          time: d.morning_time || '09:00 AM – 11:30 AM (2.5 hrs)',
                          image: getPlacePhoto(d.morning_image, d.morning, 'morning', itinerary.destination),
                        },
                        {
                          slot: 'afternoon' as const,
                          label: 'AFTERNOON ☀️',
                          color: 'text-emerald-400',
                          badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
                          text: d.afternoon,
                          duration: d.afternoon_duration || '3 hrs',
                          time: d.afternoon_time || '01:30 PM – 04:30 PM (3 hrs)',
                          image: getPlacePhoto(d.afternoon_image, d.afternoon, 'afternoon', itinerary.destination),
                        },
                        {
                          slot: 'evening' as const,
                          label: 'EVENING 🌙',
                          color: 'text-cyan-400',
                          badgeBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
                          text: d.evening,
                          duration: d.evening_duration || '2.5 hrs',
                          time: d.evening_time || '06:30 PM – 09:00 PM (2.5 hrs)',
                          image: getPlacePhoto(d.evening_image, d.evening, 'evening', itinerary.destination),
                        },
                      ].map((item) => (
                        <div
                          key={item.slot}
                          className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-3 overflow-hidden shadow-lg"
                        >
                          {/* ─── Place Photo Header ─── */}
                          <div className="relative h-36 w-full rounded-xl overflow-hidden group bg-slate-900 border border-slate-800/80 shadow-md shrink-0">
                            <DynamicPlaceImage
                              src={item.image}
                              placeText={item.text || ''}
                              city={itinerary.destination}
                              slot={item.slot}
                              alt={item.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                            {/* Top Badge: Slot Tag */}
                            <div className="absolute top-2.5 left-2.5">
                              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/10 text-white flex items-center gap-1.5 shadow">
                                <Camera size={11} className={item.color} />
                                <span>{item.label}</span>
                              </span>
                            </div>

                            {/* Bottom Overlay: Visit Duration */}
                            <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border backdrop-blur-md shadow-sm ${item.badgeBg}`}
                                title="Estimated duration traveler will spend here"
                              >
                                <Clock size={11} />
                                <span>{item.duration}</span>
                              </span>
                              <span className="text-[9px] font-mono text-slate-300 bg-slate-950/85 px-2 py-0.5 rounded backdrop-blur-md border border-slate-800/80">
                                Place Photo
                              </span>
                            </div>
                          </div>

                          {/* Place Activity Description */}
                          {isEditing ? (
                            <div className="space-y-2.5 flex-1">
                              <div>
                                <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold block mb-1">
                                  Place & Activity Details
                                </label>
                                <textarea
                                  rows={3}
                                  value={item.text}
                                  onChange={(e) => handleUpdateDayField(d.day, item.slot, e.target.value)}
                                  placeholder="Describe the place or activity..."
                                  className="w-full text-xs text-slate-200 bg-slate-900 border border-slate-800 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-none resize-none"
                                />
                              </div>

                              {/* Photo Selector */}
                              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                                <label className="text-[10px] font-mono uppercase font-bold text-slate-300 flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    <Camera size={11} className="text-emerald-400" /> Photo Preset
                                  </span>
                                  <span className="text-[9px] text-slate-500">Pick landmark photo:</span>
                                </label>
                                <div className="flex flex-wrap gap-1">
                                  {CURATED_PLACE_PRESETS.slice(0, 6).map((preset) => (
                                    <button
                                      key={preset.label}
                                      type="button"
                                      onClick={() =>
                                        handleUpdateDayField(
                                          d.day,
                                          `${item.slot}_image` as keyof ItineraryDay,
                                          preset.url
                                        )
                                      }
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-all cursor-pointer ${
                                        item.image === preset.url
                                          ? 'bg-emerald-500 text-slate-950 font-bold'
                                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                                      }`}
                                    >
                                      {preset.label}
                                    </button>
                                  ))}
                                </div>
                                <input
                                  type="text"
                                  value={d[`${item.slot}_image` as keyof ItineraryDay] || ''}
                                  onChange={(e) =>
                                    handleUpdateDayField(
                                      d.day,
                                      `${item.slot}_image` as keyof ItineraryDay,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Or paste custom image URL..."
                                  className="w-full text-[11px] text-slate-300 bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono focus:border-emerald-500 focus:outline-none"
                                />
                              </div>

                              {/* Time Mark Editor */}
                              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                                <label className="text-[10px] font-mono uppercase font-bold text-slate-300 flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    <Clock size={11} className={item.color} /> Visit Duration Mark
                                  </span>
                                  <span className="text-[10px] text-slate-500">Pick preset:</span>
                                </label>

                                {/* Quick Duration Presets */}
                                <div className="flex flex-wrap gap-1">
                                  {DURATION_PRESETS.map((preset) => (
                                    <button
                                      key={preset}
                                      type="button"
                                      onClick={() => handleSelectPresetDuration(d.day, item.slot, preset)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-all ${
                                        item.duration === preset
                                          ? 'bg-emerald-500 text-slate-950 font-bold'
                                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                      }`}
                                    >
                                      {preset}
                                    </button>
                                  ))}
                                </div>

                                <input
                                  type="text"
                                  value={item.time}
                                  onChange={(e) =>
                                    handleUpdateDayField(d.day, `${item.slot}_time` as keyof ItineraryDay, e.target.value)
                                  }
                                  placeholder="e.g. 09:00 AM – 11:30 AM (2.5 hrs)"
                                  className="w-full text-xs text-slate-200 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono focus:border-emerald-500 focus:outline-none"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3 flex-1 flex flex-col justify-between">
                              <p className="text-xs text-slate-300 leading-relaxed">{item.text}</p>

                              {/* Traveler Visit Time Indicator */}
                              <div className="mt-2 pt-2 border-t border-slate-900/80 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-900/50 px-2.5 py-1.5 rounded-lg border border-slate-800/60">
                                <span className="flex items-center gap-1.5 truncate">
                                  <Clock size={11} className={item.color} />
                                  <span className="truncate">{item.time}</span>
                                </span>
                                <span className="text-[9px] uppercase tracking-wider text-slate-500 shrink-0 ml-1">
                                  Visit Mark
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Overnight Stay */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Hotel size={15} className="text-emerald-400 shrink-0" />
                        <span className="font-mono text-[11px]">OVERNIGHT STAY:</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={d.stay}
                          onChange={(e) => handleUpdateDayField(d.day, 'stay', e.target.value)}
                          placeholder="Accommodation name..."
                          className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono text-white flex-1 sm:max-w-md focus:border-emerald-500 focus:outline-none"
                        />
                      ) : (
                        <span className="font-bold text-white font-mono">{d.stay}</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Included Perks */}
            {(itinerary.included_perks ?? itinerary.includedPerks ?? []).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Included VoyageAI Global Perks
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(itinerary.included_perks ?? itinerary.includedPerks ?? []).map((perk: string, i: number) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-2 text-xs text-slate-300">
                      <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Smart Navigation Intelligence Panel ─── */}
            <ModalNavPanel
              searchQuery={itinerary.destination}
              userLat={userLat}
              userLng={userLng}
              userCity={userCity}
            />
          </div>
        )}

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-mono">
                Itinerary ID: {itinerary.id} · {currentDays.length} {currentDays.length === 1 ? 'Day' : 'Days'} Planned ✓
              </span>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="secondary" icon={<Download size={15} />} onClick={() => alert('Global Itinerary PDF download initiated!')}>
                  Export PDF
                </Button>
                <Button
                  variant="primary"
                  icon={<Sparkles size={15} />}
                  onClick={() => alert('Trip booked! VoyageAI concierge is confirming your stays, activities, and transit vouchers.')}
                >
                  Book Entire Route Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
