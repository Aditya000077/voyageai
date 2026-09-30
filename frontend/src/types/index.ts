export interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  duration: number
  delay: number
}

export interface Destination {
  id: number
  city: string
  country: string
  tag: string
  tagColor: string
  price: string
  duration: string
  rating: number
  reviews: number
  score: number
  image: string
  coords: string
  temp: string
  badge: string
  description?: string
  highlights?: string[]
  bestSeason?: string
  hotelRecommendation?: string
  gallery?: string[]
}

export interface Feature {
  id: string
  icon: string
  label: string
  title: string
  desc: string
  accent: string
  metric: string
  detailPoints?: string[]
}

export interface Mission {
  // Django returns integer pk as id, local mocks use string mission_id
  id?: number | string
  mission_id?: string
  destination: string
  status: 'IN FLIGHT' | 'BOARDING' | 'ON SCHEDULE' | 'DELAYED' | 'LANDED'
  // snake_case from Django
  status_color?: string
  // camelCase from local data
  statusColor?: string
  passenger: string
  seat: string
  flight: string
  eta: string
  altitude: string
  progress: number
  origin?: string
  aircraft?: string
  speed?: string
}

export interface Testimonial {
  id: number
  name: string
  role: string
  avatar: string
  quote: string
  rating: number
  trips: number
  badge: string
}

export interface Stat {
  value: string
  label: string
  icon: string
}

export interface SystemStatusItem {
  label: string
  status: string
  color: string
}

export interface ItineraryDay {
  day: number
  title: string
  morning: string
  morning_time?: string
  morning_duration?: string
  morning_image?: string
  afternoon: string
  afternoon_time?: string
  afternoon_duration?: string
  afternoon_image?: string
  evening: string
  evening_time?: string
  evening_duration?: string
  evening_image?: string
  stay: string
}

export interface GeneratedItinerary {
  id: string
  prompt: string
  destination: string
  duration: string
  // camelCase (local mock data)
  estimatedCost?: string
  aiMatchScore?: number
  includedPerks?: string[]
  // snake_case (Django backend response)
  estimated_cost?: string
  ai_match_score?: number
  included_perks?: string[]
  summary: string
  days?: ItineraryDay[]
  llm_provider?: string
  traveler_type?: TravelerType
  budget_tier?: BudgetTier
  travel_style?: TravelStyle
}

export type TravelerType = 'solo' | 'couple' | 'family' | 'friends'
export type BudgetTier = 'budget' | 'moderate' | 'premium' | 'luxury'
export type TravelStyle = 'culture' | 'nature' | 'adventure' | 'relaxed' | 'food'

export interface TripFilters {
  travelerType: TravelerType
  days: number
  budgetTier: BudgetTier
  travelStyle: TravelStyle
}

