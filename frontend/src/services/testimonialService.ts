import { api } from './api'
import { Testimonial } from '../types'
import { PaginatedResponse } from './destinationService'

export const testimonialService = {
  getAll: () => api.get<PaginatedResponse<Testimonial>>('/testimonials/'),
}

export interface HealthStatus {
  status: string
  system: string
  version: string
  nodes: { name: string; status: string; color: string }[]
}

export const healthService = {
  check: () => api.get<HealthStatus>('/health/'),
}
