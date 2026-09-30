import { api } from './api'
import { GeneratedItinerary } from '../types'

export interface AIPlanRequest {
  prompt: string
  save_result?: boolean
  user_latitude?: number | null
  user_longitude?: number | null
  user_city?: string | null
  traveler_type?: string | null
  budget_tier?: string | null
  travel_style?: string | null
  days?: number | null
  budget?: number | null
}

export interface AIChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export interface AIChatResponse {
  reply: string
  modify_itinerary: boolean
  updated_itinerary: GeneratedItinerary | null
  suggested_prompts: string[]
  provider?: string
}

export interface AIChatRequest {
  message: string
  current_itinerary?: GeneratedItinerary | null
  chat_history?: AIChatMessage[]
  user_city?: string | null
  user_latitude?: number | null
  user_longitude?: number | null
  traveler_type?: string | null
  budget_tier?: string | null
  travel_style?: string | null
  days?: number | null
}


export const plannerService = {
  /** Send a natural language prompt → get a generated AI itinerary */
  generateItinerary: (data: AIPlanRequest) =>
    api.post<GeneratedItinerary>('/plan/', data),

  /** Interactive chat with AI Travel Concierge to refine itinerary or ask questions */
  chatRefine: (data: AIChatRequest) =>
    api.post<AIChatResponse>('/planner/chat/', data),

  /** Get all previously saved itineraries */
  getSaved: () => api.get<{ count: number; results: GeneratedItinerary[] }>('/itineraries/'),

  /** Update an existing saved itinerary */
  updateItinerary: (id: string | number, data: Partial<GeneratedItinerary>) =>
    api.patch<GeneratedItinerary>(`/itineraries/${id}/`, data),
}

