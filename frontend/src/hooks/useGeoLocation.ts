import { useState, useEffect, useCallback } from 'react'

export interface LocationState {
  latitude: number | null
  longitude: number | null
  cityName: string | null
  countryName: string | null
  accuracy: number | null
  loading: boolean
  error: string | null
  permissionDenied: boolean
  detected: boolean
}

// Sensible initial state; IP/GPS detection will overwrite on mount
const INITIAL_LOCATION: LocationState = {
  latitude: 12.6823,
  longitude: 79.9800,
  cityName: 'Chengalpattu',
  countryName: 'India',
  accuracy: null,
  loading: false,
  error: null,
  permissionDenied: false,
  detected: true,
}

export function useGeoLocation() {
  const [location, setLocation] = useState<LocationState>(() => {
    try {
      const saved = localStorage.getItem('voyage_user_location')
      if (saved) return JSON.parse(saved)
    } catch {}
    return INITIAL_LOCATION
  })

  // Multi-provider reverse geocoding: OpenStreetMap Nominatim (pinpoint accurate) + BigDataCloud fallback
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    // 1. Try OpenStreetMap Nominatim (returns exact locality, town/district, e.g. Chengalpattu / Chennai / Kanchipuram)
    try {
      const osmRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      if (osmRes.ok) {
        const osmData = await osmRes.json()
        const addr = osmData.address || {}
        const locality = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district
        const mainCity = addr.city || addr.town || addr.municipality || addr.county || addr.state_district || addr.village
        
        let detectedCity = mainCity || locality || 'Your Location'
        if (locality && mainCity && locality !== mainCity) {
          detectedCity = `${locality}, ${mainCity}`
        }
        const detectedCountry = addr.country || 'India'

        setLocation((prev) => {
          const updated = {
            ...prev,
            cityName: detectedCity,
            countryName: detectedCountry,
            detected: true,
          }
          try { 
            localStorage.setItem('voyage_user_location', JSON.stringify(updated))
            window.dispatchEvent(new CustomEvent('voyage_location_updated', { detail: updated }))
          } catch {}
          return updated
        })
        return
      }
    } catch {
      // Fall through to secondary geocoder
    }

    // 2. Secondary fallback: BigDataCloud
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      )
      if (res.ok) {
        const data = await res.json()
        const city =
          data.city ||
          data.locality ||
          data.principalSubdivision ||
          'Your Location'
        const country = data.countryName || 'India'

        setLocation((prev) => {
          const updated = {
            ...prev,
            cityName: city,
            countryName: country,
            detected: true,
          }
          try { 
            localStorage.setItem('voyage_user_location', JSON.stringify(updated))
            window.dispatchEvent(new CustomEvent('voyage_location_updated', { detail: updated }))
          } catch {}
          return updated
        })
      }
    } catch {
      // Keep existing
    }
  }, [])

  // Fast IP-based initial approximation
  const detectIpLocation = useCallback(async () => {
    try {
      const res = await fetch(
        'https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en'
      )
      if (res.ok) {
        const data = await res.json()
        const city = data.city || data.locality || data.principalSubdivision || 'Chengalpattu'
        const country = data.countryName || 'India'
        const lat = data.latitude ?? 12.6823
        const lng = data.longitude ?? 79.9800

        setLocation((prev) => {
          // If we already have high accuracy GPS, do not overwrite with rough IP
          if (prev.accuracy && prev.accuracy < 500) return prev
          const updated = {
            ...prev,
            latitude: lat,
            longitude: lng,
            cityName: prev.cityName || city,
            countryName: country,
            loading: false,
            detected: true,
          }
          return updated
        })
      }
    } catch {
      setLocation((prev) => ({ ...prev, loading: false }))
    }
  }, [])

  // Precise hardware GPS detection
  const detectLocation = useCallback(() => {
    setLocation((prev) => ({ ...prev, loading: true, error: null }))

    detectIpLocation()

    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: 'Geolocation not supported by browser',
        loading: false,
      }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setLocation((prev) => {
          const updated = {
            ...prev,
            latitude,
            longitude,
            accuracy,
            loading: false,
            error: null,
            permissionDenied: false,
            detected: true,
          }
          try { localStorage.setItem('voyage_user_location', JSON.stringify(updated)) } catch {}
          return updated
        })

        reverseGeocode(latitude, longitude)
      },
      (error) => {
        let errorMsg = 'Using location'
        let denied = false
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'GPS permission denied — using network location'
          denied = true
        }

        setLocation((prev) => ({
          ...prev,
          error: errorMsg,
          permissionDenied: denied,
          loading: false,
        }))
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    )
  }, [detectIpLocation, reverseGeocode])

  // Custom manual location editor helper (can be invoked by user modal or search input)
  const setCustomLocation = useCallback(async (newCity: string, customLat?: number, customLng?: number) => {
    setLocation((prev) => ({ ...prev, loading: true }))

    let lat = customLat
    let lng = customLng

    // If coordinates not provided, geocode the city name directly
    if (!lat || !lng) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(newCity)}&format=json&limit=1`,
          { headers: { 'Accept-Language': 'en' } }
        )
        if (res.ok) {
          const results = await res.json()
          if (results.length > 0) {
            lat = parseFloat(results[0].lat)
            lng = parseFloat(results[0].lon)
          }
        }
      } catch {}
    }

    const finalLat = lat ?? 12.6823
    const finalLng = lng ?? 79.9800

    const updatedLoc: LocationState = {
      latitude: finalLat,
      longitude: finalLng,
      cityName: newCity.trim(),
      countryName: 'India',
      accuracy: 10,
      loading: false,
      error: null,
      permissionDenied: false,
      detected: true,
    }

    setLocation(updatedLoc)

    try {
      localStorage.setItem('voyage_user_location', JSON.stringify(updatedLoc))
      window.dispatchEvent(new CustomEvent('voyage_location_updated', { detail: updatedLoc }))
    } catch {}
  }, [])

  // Listen to cross-component location changes
  useEffect(() => {
    const handleLocationUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<LocationState>
      if (customEvent.detail) {
        setLocation(customEvent.detail)
      }
    }
    window.addEventListener('voyage_location_updated', handleLocationUpdate)
    return () => {
      window.removeEventListener('voyage_location_updated', handleLocationUpdate)
    }
  }, [])

  useEffect(() => {
    detectLocation()
  }, [detectLocation])

  return {
    ...location,
    detectLocation,
    setCustomLocation,
  }
}


