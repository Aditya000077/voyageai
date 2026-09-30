/**
 * Curated place images utility for VoyageAI itineraries.
 * Provides high-resolution, verified Unsplash photography for global travel landmarks,
 * including Indian heritage marvels (Hawa Mahal, Amer Fort, Taj Mahal, Agra Fort, etc.),
 * and international icons.
 */

export interface PlacePhotoPreset {
  label: string
  url: string
}

export const CURATED_PLACE_PRESETS: PlacePhotoPreset[] = [
  {
    label: 'Hawa Mahal, Jaipur',
    url: 'https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'Taj Mahal, Agra',
    url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'Amer Fort, Jaipur',
    url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'Jal Mahal, Jaipur',
    url: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'City Palace, Jaipur',
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'Agra Fort',
    url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'Mehtab Bagh, Agra',
    url: 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'Nahargarh Fort',
    url: 'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'Gateway of India',
    url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'Varanasi Ghats',
    url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'Kerala Backwaters',
    url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'Kapaleeshwarar Temple, Chennai',
    url: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'Marina Beach, Chennai',
    url: 'https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'Shore Temple, Mahabalipuram',
    url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'Charminar, Hyderabad',
    url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'Howrah Bridge, Kolkata',
    url: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'Golden Temple, Amritsar',
    url: 'https://images.unsplash.com/photo-1605806616949-1e87b487fc2f?w=800&h=600&fit=crop&auto=format',
  },

  {
    label: 'Goa Coast',
    url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'Bamboo Grove, Kyoto',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'Torii Shrine, Kyoto',
    url: 'https://images.unsplash.com/photo-1478436127897-769e00d0c715?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'Alpine Glacier, Swiss',
    url: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800&h=600&fit=crop&auto=format',
  },
  {
    label: 'Savannah Safari',
    url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop&auto=format',
  },
]

/**
 * Automatically resolves a contextual landmark photo based on place description, time of day, and destination.
 */
export function getPlacePhoto(
  explicitUrl?: string | null,
  placeText: string = '',
  slot: 'morning' | 'afternoon' | 'evening' = 'morning',
  destination: string = ''
): string {
  if (explicitUrl && explicitUrl.trim().length > 10) {
    return explicitUrl.trim()
  }

  const text = `${placeText} ${destination}`.toLowerCase()

  // ─── JAIPUR LANDMARKS ───
  if (text.includes('hawa mahal') || text.includes('hawamehal') || text.includes('havamehl') || text.includes('hawa mehel') || text.includes('palace of winds')) {
    return 'https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('jal mahal') || text.includes('water palace') || text.includes('man sagar')) {
    return 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('amer fort') || text.includes('amber fort') || text.includes('amber palace') || text.includes('sheesh mahal')) {
    return 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('city palace jaipur') || text.includes('city palace') || text.includes('chandra mahal') || text.includes('jantar mantar')) {
    return 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('nahargarh') || text.includes('jaigarh') || text.includes('padao')) {
    return 'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('chokhi dhani') || text.includes('rajasthani thali') || (text.includes('jaipur') && slot === 'evening')) {
    return 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('jaipur') && slot === 'morning') {
    return 'https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('jaipur') && slot === 'afternoon') {
    return 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop&auto=format'
  }

  // ─── AGRA LANDMARKS ───
  if (text.includes('taj mahal') || text.includes('tajmehel') || text.includes('taj mehel') || text.includes('taj')) {
    return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('agra fort') || text.includes('red fort of agra') || text.includes('diwan-i-khas')) {
    return 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('mehtab bagh') || text.includes('moonlight garden') || text.includes('yamuna')) {
    return 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('fatehpur sikri') || text.includes('buland darwaza') || text.includes('salim chishti')) {
    return 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('agra') && slot === 'morning') {
    return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('agra') && slot === 'afternoon') {
    return 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('agra') && slot === 'evening') {
    return 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800&h=600&fit=crop&auto=format'
  }

  // ─── DELHI LANDMARKS ───
  if (text.includes('india gate') || text.includes('kartavya path')) {
    return 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('qutub minar') || text.includes('humayun tomb') || text.includes('lotus temple')) {
    return 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop&auto=format'
  }

  // ─── CHENNAI & TAMIL NADU LANDMARKS ───
  if (text.includes('chennai') || text.includes('madras') || text.includes('kapaleeshwarar') || text.includes('mylapore') || text.includes('marina beach') || text.includes('mahabalipuram') || text.includes('san thome') || text.includes('santhome') || text.includes('chettinad') || text.includes('pancha ratha')) {
    if (text.includes('marina') || text.includes('elliot beach') || text.includes('besant nagar')) {
      return 'https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?w=800&h=600&fit=crop&auto=format'
    }
    if (text.includes('mahabalipuram') || text.includes('shore temple')) {
      return 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&h=600&fit=crop&auto=format'
    }
    if (text.includes('pancha ratha') || text.includes('pancha rathas') || text.includes('arjuna penance') || text.includes('rock cut') || text.includes('monolithic')) {
      return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format'
    }
    if (text.includes('san thome') || text.includes('santhome') || text.includes('basilica') || text.includes('cathedral')) {
      return 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop&auto=format'
    }
    if (text.includes('fort st george') || text.includes('fort george') || text.includes('st. mary')) {
      return 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800&h=600&fit=crop&auto=format'
    }
    if (text.includes('chettinad') || text.includes('seafood') || text.includes('filter coffee') || text.includes('dosa')) {
      return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&auto=format'
    }
    return 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&h=600&fit=crop&auto=format'
  }

  // ─── HYDERABAD & KOLKATA & BENGALURU & AMRITSAR ───
  if (text.includes('charminar') || text.includes('golconda') || text.includes('hyderabad')) {
    return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('kolkata') || text.includes('howrah') || text.includes('victoria memorial')) {
    return 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('bangalore') || text.includes('bengaluru') || text.includes('lalbagh')) {
    return 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('golden temple') || text.includes('harmandir') || text.includes('amritsar') || text.includes('jallianwala') || text.includes('wagah') || text.includes('kulcha')) {
    if (text.includes('wagah') || text.includes('border') || text.includes('flag')) {
      return 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&h=600&fit=crop&auto=format'
    }
    if (text.includes('jallianwala') || text.includes('bagh') || text.includes('memorial') || text.includes('partition')) {
      return 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&h=600&fit=crop&auto=format'
    }
    if (text.includes('kulcha') || text.includes('lassi') || text.includes('culinary') || text.includes('food') || text.includes('feast')) {
      return 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&h=600&fit=crop&auto=format'
    }
    if (text.includes('gobindgarh') || text.includes('ram bagh') || text.includes('bazaar')) {
      return 'https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=800&h=600&fit=crop&auto=format'
    }
    return 'https://images.unsplash.com/photo-1605806616949-1e87b487fc2f?w=800&h=600&fit=crop&auto=format'
  }

  if (text.includes('udaipur') || text.includes('lake pichola')) {
    return 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800&h=600&fit=crop&auto=format'
  }

  // ─── MUMBAI & VARANASI & GOA & KERALA ───
  if (text.includes('gateway of india') || text.includes('marine drive') || text.includes('mumbai') || text.includes('colaba')) {
    if (text.includes('marine drive')) {
      return 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&h=600&fit=crop&auto=format'
    }
    return 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('varanasi') || text.includes('ganga aarti') || text.includes('ghat') || text.includes('kashi')) {
    return 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('goa') || text.includes('baga') || text.includes('anjuna') || text.includes('calangute')) {
    return 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('kerala') || text.includes('alleppey') || text.includes('houseboat') || text.includes('munnar') || text.includes('backwaters')) {
    return 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop&auto=format'
  }

  // ─── INTERNATIONAL CITIES ───
  if (text.includes('paris') || text.includes('eiffel') || text.includes('louvre')) {
    return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('london') || text.includes('big ben') || text.includes('tower bridge')) {
    return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('dubai') || text.includes('burj khalifa')) {
    return 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('rome') || text.includes('colosseum') || text.includes('vatican')) {
    return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('singapore') || text.includes('marina bay')) {
    return 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop&auto=format'
  }

  // ─── KYOTO & JAPAN LANDMARKS ───
  const isJapan = text.includes('japan') || text.includes('kyoto') || text.includes('tokyo') || text.includes('osaka') || text.includes('nara')
  if (text.includes('bamboo') || text.includes('arashiyama')) {
    return 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('torii') || text.includes('fushimi') || (isJapan && text.includes('shrine'))) {
    return 'https://images.unsplash.com/photo-1478436127897-769e00d0c715?w=800&h=600&fit=crop&auto=format'
  }
  if (isJapan && (text.includes('temple') || text.includes('tenryu') || text.includes('pagoda') || text.includes('gion') || text.includes('kinkaku'))) {
    return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop&auto=format'
  }
  if ((isJapan || text.includes('nara')) && (text.includes('deer') || text.includes('nara park'))) {
    return 'https://images.unsplash.com/photo-1578637387939-43c525550085?w=800&h=600&fit=crop&auto=format'
  }
  if (isJapan && (text.includes('tea ceremony') || text.includes('zen') || text.includes('rock garden'))) {
    return 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('shinkansen') || text.includes('bullet train')) {
    return 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('kaiseki') || (isJapan && (text.includes('sake') || text.includes('omakase')))) {
    return 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&h=600&fit=crop&auto=format'
  }

  // ─── ALPS, SAFARI, MALDIVES, ICELAND, EGYPT, PERU ───
  if (text.includes('alps') || text.includes('matterhorn') || text.includes('ski') || text.includes('glacier') || text.includes('zermatt')) {
    return 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('safari') || text.includes('serengeti') || text.includes('wildlife') || text.includes('lion') || text.includes('migration')) {
    if (text.includes('balloon')) {
      return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&auto=format'
    }
    return 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('maldives') || text.includes('overwater') || text.includes('lagoon') || text.includes('coral') || text.includes('snorkel')) {
    return 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('iceland') || text.includes('aurora') || text.includes('northern lights') || text.includes('lagoon')) {
    return 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('egypt') || text.includes('pyramid') || text.includes('sphinx') || text.includes('nile')) {
    return 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&h=600&fit=crop&auto=format'
  }
  if (text.includes('peru') || text.includes('machu picchu') || text.includes('inca') || text.includes('cusco')) {
    return 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop&auto=format'
  }

  // ─── Time of day defaults for neutral travel contexts (NOT city-specific) ───
  if (slot === 'morning') {
    return 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop&auto=format'
  }
  if (slot === 'afternoon') {
    return 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&h=600&fit=crop&auto=format'
  }
  return 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&h=600&fit=crop&auto=format'
}

// ─── In-memory photo cache (avoids duplicate API calls) ─────────────────────
const _photoCache: Map<string, string> = new Map()

/**
 * Dynamically fetch a landmark/city photo from the backend (Wikipedia-backed).
 * Returns a URL string. Falls back to a generic placeholder on error.
 *
 * Usage (async/await):
 *   const url = await fetchPlacePhoto('Colosseum', 'Rome', 'morning')
 */
export async function fetchPlacePhoto(
  placeText: string,
  city: string = '',
  slot: 'morning' | 'afternoon' | 'evening' = 'morning'
): Promise<string> {
  // First try the synchronous curated dictionary
  const quick = getPlacePhoto(undefined, placeText, slot, city)
  const GENERIC_URLS = [
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
    'https://images.unsplash.com/photo-1488085061387-422e29b40080',
    'https://images.unsplash.com/photo-1516483638261-f4dbaf036963',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
    'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff',
  ]
  const isGeneric = GENERIC_URLS.some(g => quick.startsWith(g))
  if (!isGeneric) return quick

  // Check memory cache
  const cacheKey = `${placeText}__${city}__${slot}`
  if (_photoCache.has(cacheKey)) return _photoCache.get(cacheKey)!

  try {
    const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
    const params = new URLSearchParams({ q: placeText, city, slot })
    const res = await fetch(`${BASE}/place-photo/?${params.toString()}`, { signal: AbortSignal.timeout(5000) })
    if (res.ok) {
      const data = await res.json()
      const url = data.photo_url as string
      if (url && url.startsWith('http')) {
        _photoCache.set(cacheKey, url)
        return url
      }
    }
  } catch {
    // Network/timeout — use what we have
  }
  return quick
}
