import React, { useState, useEffect } from 'react'
import { Destination } from '../../types'
import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatPriceInRupees } from '../../utils/currencyUtils'
import { MapPin, Thermometer, Star, Sparkles, Calendar, Hotel, CheckCircle, Shield, Camera } from 'lucide-react'

interface DestinationModalProps {
  destination: Destination | null
  isOpen: boolean
  onClose: () => void
  onGenerateItinerary: (destName: string) => void
}

export const DestinationModal: React.FC<DestinationModalProps> = ({
  destination,
  isOpen,
  onClose,
  onGenerateItinerary
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)

  useEffect(() => {
    setActivePhotoIndex(0)
  }, [destination])

  if (!destination) return null

  const photoList = destination.gallery && destination.gallery.length > 0
    ? destination.gallery
    : [destination.image]

  const currentPhoto = photoList[activePhotoIndex] || destination.image

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <div className="space-y-6">
        {/* Banner Image & Overlay Header */}
        <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 border border-slate-800 transition-all duration-300">
          <img
            src={currentPhoto}
            alt={destination.city}
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <Badge color={destination.tagColor}>{destination.tag}</Badge>
            <Badge color="#F59E0B">{destination.badge}</Badge>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
                <MapPin size={14} />
                <span>{destination.coords}</span>
              </div>
              <h2
                className="text-3xl sm:text-4xl font-extrabold text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {destination.city}, <span className="text-slate-300 font-normal">{destination.country}</span>
              </h2>
            </div>
            <div className="text-right bg-slate-950/80 p-3 rounded-xl border border-slate-800 backdrop-blur-md">
              <span className="text-[10px] font-mono text-slate-400 block">STARTING INVESTMENT</span>
              <span className="text-2xl font-black text-emerald-400" style={{ fontFamily: 'var(--font-display)' }}>
                {formatPriceInRupees(destination.price)}
              </span>
              <span className="text-[11px] font-mono text-slate-400 block">{destination.duration} All-Inclusive</span>
            </div>
          </div>
        </div>

        {/* Photo Gallery Selector Strip */}
        {photoList.length > 1 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Camera size={14} className="text-blue-400" />
                <span>HIGH-RES PHOTO GALLERY ({photoList.length} VIEWS)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Click photo to inspect</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {photoList.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative rounded-xl overflow-hidden h-20 sm:h-24 border transition-all cursor-pointer ${
                    activePhotoIndex === idx
                      ? 'border-emerald-400 ring-2 ring-emerald-500/30 scale-[1.02]'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  {activePhotoIndex === idx && (
                    <div className="absolute inset-0 bg-emerald-500/10 border-2 border-emerald-400 rounded-xl" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 block">AI MATCH SCORE</span>
              <span className="text-lg font-bold text-white">{destination.score} / 100</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Star size={18} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 block">USER RATING</span>
              <span className="text-lg font-bold text-white">{destination.rating} ({destination.reviews.toLocaleString()})</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Thermometer size={18} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 block">CLIMATE / TEMP</span>
              <span className="text-lg font-bold text-white">{destination.temp}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Calendar size={18} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 block">OPTIMAL SEASON</span>
              <span className="text-xs font-bold text-white truncate max-w-[110px]">{destination.bestSeason || 'Year-round'}</span>
            </div>
          </div>
        </div>

        {/* Overview Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Destination Overview
          </h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            {destination.description || `${destination.city} is one of the world's premier destinations, handpicked by VoyageAI algorithms for high satisfaction, optimal weather, and exclusive experiences.`}
          </p>
        </div>

        {/* Highlights List */}
        {destination.highlights && destination.highlights.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              AI Exclusive Private Highlights
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {destination.highlights.map((h, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
                  <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-200 font-medium leading-tight">{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hotel & Concierge Card */}
        {destination.hotelRecommendation && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-purple-500/30 flex items-center gap-4 shadow-lg shadow-purple-500/5">
            <div className="p-3 rounded-xl bg-purple-500/15 text-purple-400 shrink-0">
              <Hotel size={22} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider">
                  PREMIER 5-STAR PARTNER RESORT
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono">
                  VIP Upgrade Included
                </span>
              </div>
              <p className="text-base font-extrabold text-white">{destination.hotelRecommendation}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Includes complimentary room upgrade, early check-in, late checkout, and daily breakfast.
              </p>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <Shield size={14} className="text-emerald-400" />
            <span>Guaranteed 24/7 AI Concierge & Direct Hotel Voucher</span>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="secondary" onClick={onClose}>
              Close Preview
            </Button>
            <Button
              variant="primary"
              icon={<Sparkles size={16} />}
              onClick={() => {
                onClose()
                onGenerateItinerary(`${destination.city} ${destination.country} luxury tour`)
              }}
            >
              Generate AI Itinerary for {destination.city}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
