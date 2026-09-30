import { api } from './api'
import { Destination } from '../types'

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface DestinationSearchResponse {
  found: boolean
  destination?: Destination
  detail?: string
}

export const destinationService = {
  /** Fetch all AI-curated destinations from Django backend */
  getAll: () => api.get<PaginatedResponse<Destination>>('/destinations/'),

  /** Fetch a single destination by id */
  getById: (id: number) => api.get<Destination>(`/destinations/${id}/`),

  /** Fuzzy-search uploaded destinations by city/country name */
  searchByCity: (query: string) =>
    api.get<DestinationSearchResponse>(`/destinations/search/?q=${encodeURIComponent(query)}`),
}
