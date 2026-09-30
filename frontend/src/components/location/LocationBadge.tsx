import React, { useState } from 'react'
import { Navigation, MapPin, Loader2, Edit2, Check, X } from 'lucide-react'

interface LocationBadgeProps {
  cityName: string | null
  latitude: number | null
  longitude: number | null
  detected: boolean
  loading: boolean
  error: string | null
  onDetect: () => void
  onSetCustomLocation?: (city: string, lat?: number, lng?: number) => void
}

export const LocationBadge: React.FC<LocationBadgeProps> = ({
  cityName,
  latitude,
  longitude,
  detected,
  loading,
  error,
  onDetect,
  onSetCustomLocation,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editInput, setEditInput] = useState(cityName || '')

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault()
    if (editInput.trim() && onSetCustomLocation) {
      onSetCustomLocation(editInput.trim())
      setIsEditing(false)
    }
  }

  return (
    <div className="relative inline-flex items-center">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-xs font-mono backdrop-blur-md shadow-lg shadow-emerald-500/5">
        <div className="relative flex items-center justify-center">
          <span
            className={`w-2.5 h-2.5 rounded-full ${detected ? 'bg-emerald-400 blink' : 'bg-amber-400'}`}
            style={{ boxShadow: `0 0 8px ${detected ? '#10B981' : '#F59E0B'}` }}
          />
        </div>

        <div className="flex items-center gap-1.5 text-slate-200 font-medium">
          <MapPin size={13} className={detected ? 'text-emerald-400' : 'text-amber-400'} />
          <span>
            {loading ? (
              <span className="text-slate-400 animate-pulse">Detecting GPS...</span>
            ) : detected ? (
              <span>
                <span className="font-bold text-white">{cityName || 'Your Location'}</span>
                {latitude && longitude && (
                  <span className="text-[10px] text-slate-400 ml-1.5 hidden sm:inline">
                    ({latitude.toFixed(2)}°, {longitude.toFixed(2)}°)
                  </span>
                )}
              </span>
            ) : (
              <span className="text-slate-300 font-sans">{cityName || 'Chengalpattu'}</span>
            )}
          </span>
        </div>

        {/* Edit City Button */}
        {onSetCustomLocation && (
          <button
            onClick={() => {
              setEditInput(cityName || '')
              setIsEditing(!isEditing)
            }}
            className="p-1 rounded-full text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all cursor-pointer"
            title="Edit location manually"
          >
            <Edit2 size={11} />
          </button>
        )}

        {/* Re-detect GPS Button */}
        <button
          onClick={onDetect}
          disabled={loading}
          className="p-1 rounded-full text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-all cursor-pointer"
          title="Auto-detect current GPS location"
        >
          {loading ? (
            <Loader2 size={12} className="animate-spin text-emerald-400" />
          ) : (
            <Navigation size={12} className="text-emerald-400 hover:rotate-45 transition-transform" />
          )}
        </button>
      </div>

      {/* Popover to Edit Location */}
      {isEditing && (
        <div
          className="absolute top-full mt-2 left-0 z-50 p-3 rounded-2xl bg-slate-900/98 border border-emerald-500/40 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-2.5"
          style={{ minWidth: '280px' }}
        >
          <div className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin size={12} /> Set Departure Location
            </span>
            <span className="text-slate-500 text-[10px]">OSM Geocoded</span>
          </div>

          <form onSubmit={handleSaveLocation} className="flex items-center gap-1.5">
            <input
              type="text"
              value={editInput}
              onChange={(e) => setEditInput(e.target.value)}
              placeholder="e.g. Chengalpattu, Chennai, Jaipur..."
              autoFocus
              className="bg-slate-950 border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg text-white font-mono focus:border-emerald-400 focus:outline-none flex-1"
            />
            <button
              type="submit"
              className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer transition-colors shrink-0"
              title="Save Location"
            >
              <Check size={12} className="stroke-[3]" />
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors shrink-0"
              title="Cancel"
            >
              <X size={12} />
            </button>
          </form>

          {/* Quick City Presets */}
          <div>
            <div className="text-[10px] text-slate-400 mb-1 font-mono">Quick Cities:</div>
            <div className="flex flex-wrap gap-1">
              {['Chengalpattu', 'Chennai', 'Jaipur', 'Bengaluru', 'Mumbai', 'Delhi'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    if (onSetCustomLocation) {
                      onSetCustomLocation(preset)
                      setEditInput(preset)
                      setIsEditing(false)
                    }
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-300 border border-slate-700 text-[10px] font-mono text-slate-300 transition-colors cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

