import { Mission, SystemStatusItem } from '../types'

export const MISSIONS: Mission[] = [
  {
    id: 'GLOB-101',
    mission_id: 'GLOB-101',
    destination: 'Tokyo (HND) → London (LHR)',
    status: 'IN FLIGHT',
    statusColor: '#06B6D4',
    passenger: 'Elena Rostova',
    seat: '1A (First Class)',
    flight: 'BA 6',
    eta: '16:45 UTC',
    altitude: '39,000 ft',
    progress: 68,
    origin: 'Haneda Intl Airport (HND)',
    aircraft: 'Boeing 787-9 Dreamliner',
    speed: '510 knots'
  },
  {
    id: 'GLOB-204',
    mission_id: 'GLOB-204',
    destination: 'New York (JFK) → Paris (CDG)',
    status: 'BOARDING',
    statusColor: '#F59E0B',
    passenger: 'Marcus Vance',
    seat: '2K (La Première)',
    flight: 'AF 7',
    eta: '22:15 UTC',
    altitude: 'Gate 14',
    progress: 15,
    origin: 'John F. Kennedy Intl (JFK)',
    aircraft: 'Airbus A350-900',
    speed: '0 knots (Boarding)'
  },
  {
    id: 'GLOB-308',
    mission_id: 'GLOB-308',
    destination: 'Dubai (DXB) → Sydney (SYD)',
    status: 'ON SCHEDULE',
    statusColor: '#10B981',
    passenger: 'Aria Takahashi',
    seat: 'Suite 3',
    flight: 'EK 414',
    eta: '06:30 UTC',
    altitude: '41,000 ft',
    progress: 42,
    origin: 'Dubai Intl Airport (DXB)',
    aircraft: 'Airbus A380-800',
    speed: '530 knots'
  },
  {
    id: 'GLOB-412',
    mission_id: 'GLOB-412',
    destination: 'Singapore (SIN) → Zurich (ZRH)',
    status: 'IN FLIGHT',
    statusColor: '#3B82F6',
    passenger: 'Dr. Henrik Lindqvist',
    seat: '1D (First Suite)',
    flight: 'SQ 346',
    eta: '08:50 UTC',
    altitude: '38,000 ft',
    progress: 84,
    origin: 'Changi Airport (SIN)',
    aircraft: 'Boeing 777-300ER',
    speed: '495 knots'
  }
]

export const SYSTEM_STATUSES: SystemStatusItem[] = [
  { label: 'Global Flight Router', status: 'OPERATIONAL', color: '#10B981' },
  { label: 'Microclimate Radar', status: 'OPERATIONAL', color: '#10B981' },
  { label: 'Visa Intelligence', status: 'OPERATIONAL', color: '#10B981' },
  { label: 'Global Concierge AI', status: 'ONLINE', color: '#06B6D4' }
]
