export interface GeoCoordinates {
  latitude: number
  longitude: number
}

/**
 * Calculates the Haversine distance between two sets of GPS coordinates in kilometers.
 */
export function calculateHaversineDistance(
  coord1: GeoCoordinates,
  coord2: GeoCoordinates
): number {
  const R = 6371 // Earth radius in kilometers
  const dLat = toRad(coord2.latitude - coord1.latitude)
  const dLon = toRad(coord2.longitude - coord1.longitude)

  const lat1 = toRad(coord1.latitude)
  const lat2 = toRad(coord2.latitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Parses a coordinate string like "35.0116° N, 135.7681° E" into latitude & longitude numbers.
 */
export function parseCoordsString(coordsStr: string): GeoCoordinates | null {
  try {
    const parts = coordsStr.split(',')
    if (parts.length !== 2) return null

    const latPart = parts[0].trim()
    const lonPart = parts[1].trim()

    let lat = parseFloat(latPart)
    if (latPart.toUpperCase().includes('S')) lat = -lat

    let lon = parseFloat(lonPart)
    if (lonPart.toUpperCase().includes('W')) lon = -lon

    if (isNaN(lat) || isNaN(lon)) return null

    return { latitude: lat, longitude: lon }
  } catch {
    return null
  }
}

/**
 * Formats distance in km into a clean user-friendly label.
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`
  }
  if (distanceKm < 100) {
    return `${distanceKm.toFixed(1)} km away`
  }
  return `${Math.round(distanceKm).toLocaleString()} km away`
}
