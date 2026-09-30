// Barrel export — import all API services from one place
export { api } from './api'
export { destinationService } from './destinationService'
export { missionService } from './missionService'
export { plannerService } from './plannerService'
export { testimonialService, healthService } from './testimonialService'
export type { PaginatedResponse } from './destinationService'
export type { AIPlanRequest } from './plannerService'
export type { HealthStatus } from './testimonialService'
