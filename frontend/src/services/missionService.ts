import { api } from './api'
import { Mission } from '../types'
import { PaginatedResponse } from './destinationService'

export const missionService = {
  /** Fetch all active live missions from Django backend */
  getAll: () => api.get<PaginatedResponse<Mission>>('/missions/'),

  /** Fetch a single mission by id */
  getById: (id: number) => api.get<Mission>(`/missions/${id}/`),
}
