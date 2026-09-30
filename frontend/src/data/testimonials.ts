import { Testimonial, Stat } from '../types'

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Hiroshi Tanaka',
    role: 'Tech Executive & Collector, Tokyo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format',
    quote: "VoyageAI planned a 6-day Swiss Alps ski & Glacier Express circuit flawlessly. It secured Excellence Class train seats that were sold out everywhere, and arranged a private helicopter ski drop on Matterhorn. Incomparable precision.",
    rating: 5,
    trips: 18,
    badge: 'Global Connoisseur'
  },
  {
    id: 2,
    name: 'Sophia Laurent',
    role: 'Art Historian & Curator, Geneva',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&auto=format',
    quote: "The Kyoto ryokan & tea master matcher connected me with a 15th-generation tea master in Gion. VoyageAI handled private riverboat transfers, after-hours shrine access, and Michelin dining effortlessly.",
    rating: 5,
    trips: 28,
    badge: 'World Travel Ambassador'
  },
  {
    id: 3,
    name: 'Alexander Wright',
    role: 'Venture Investor, New York',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&auto=format',
    quote: "From Serengeti balloon safaris to overwater villas in Zanzibar, VoyageAI delivers real-time flight telemetry, visa clearance, and instant 5-star upgrades across all timezones.",
    rating: 5,
    trips: 42,
    badge: 'Founding Globe Member'
  }
]

export const STATS: Stat[] = [
  { value: '12,000+', label: 'Flight & Jet Routes', icon: 'Compass' },
  { value: '₹20,000 Cr+', label: 'Global Trips Booked', icon: 'TrendingUp' },
  { value: '195', label: 'Countries Covered', icon: 'Globe' },
  { value: '4.99★', label: 'Worldwide Rating', icon: 'Star' }
]

export const TRUST_METRICS = [
  { val: '4.99 / 5', label: 'Average Satisfaction', color: '#F59E0B' },
  { val: '99.7%', label: 'Would Recommend', color: '#10B981' },
  { val: '< 2 min', label: 'AI Planner Speed', color: '#3B82F6' },
  { val: '100%', label: 'SOC 2 Type II Certified', color: '#7C3AED' }
]
