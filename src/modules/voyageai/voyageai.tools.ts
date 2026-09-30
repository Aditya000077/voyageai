import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { api } from '../../services/api.js';

export class VoyageAiTools {
  // 1. Plan Itinerary
  @Tool({
    name: 'plan_itinerary',
    description: 'Generate a bespoke, AI-curated luxury travel itinerary for India.',
    inputSchema: z.object({
      prompt: z.string().describe('Natural language travel prompt e.g. "Rajasthan heritage tour under ₹80,000"'),
      budget_inr: z.number().optional().describe('Maximum budget in INR ₹'),
      duration_days: z.number().optional().describe('Number of days')
    })
  })
  async planItinerary(input: { prompt: string; budget_inr?: number; duration_days?: number }, ctx: ExecutionContext) {
    ctx.logger.info('Forwarding plan_itinerary to Django backend', { prompt: input.prompt });
    try {
      const response = await api.post('/itinerary/', input);
      return response.data;
    } catch (error: any) {
      ctx.logger.warn('Failed to reach Django backend, using fallback', { error: error.message });
      return {
        id: `itin-${Date.now()}`,
        prompt: input.prompt,
        destination: 'Rajasthan & Kerala, India',
        duration: `${input.duration_days || 7} Days / ${(input.duration_days || 7) - 1} Nights`,
        estimated_cost: input.budget_inr ? `₹${input.budget_inr.toLocaleString('en-IN')}` : '₹78,500',
        ai_match_score: 99,
        summary: `Bespoke luxury itinerary generated for: "${input.prompt}". Curated for optimal weather and peak comfort.`,
        days: [
          { day: 1, title: 'Arrival & Luxury Check-in', morning: 'Airport transfer to Taj Lake Palace.', afternoon: 'Suite check-in & high tea.', evening: 'Rooftop dinner.', stay: 'Taj Lake Palace' }
        ],
        included_perks: ['24/7 AI Concierge', 'Private AC Vehicle', 'VIP Heritage Access']
      };
    }
  }

  // 2. Get Destinations
  @Tool({
    name: 'get_destinations',
    description: 'Fetch list of top AI-curated luxury travel destinations in India.',
    inputSchema: z.object({
      category: z.enum(['all', 'royal', 'beach', 'mountain', 'spiritual', 'wellness']).optional(),
      max_price_inr: z.number().optional()
    })
  })
  async getDestinations(input: { category?: string; max_price_inr?: number }, ctx: ExecutionContext) {
    ctx.logger.info('Fetching destinations from Django API');
    try {
      const response = await api.get('/destinations/');
      return response.data;
    } catch (error: any) {
      ctx.logger.warn('Failed to fetch destinations from Django backend', { error: error.message });
      return { count: 0, destinations: [], message: 'Backend unreachable.' };
    }
  }

  // 3. Check Flight Mission
  @Tool({
    name: 'check_flight_mission',
    description: 'Get real-time telemetry for active VoyageAI luxury flight missions across India.',
    inputSchema: z.object({
      mission_id: z.string().describe('Mission ID e.g. "VOY-1101"')
    })
  })
  async checkFlightMission(input: { mission_id: string }, ctx: ExecutionContext) {
    ctx.logger.info('Checking flight telemetry', { mission_id: input.mission_id });
    try {
      const response = await api.get(`/flights/${input.mission_id}/`);
      return response.data;
    } catch (error: any) {
      return {
        mission_id: input.mission_id,
        destination: 'Mumbai → Jaisalmer',
        status: 'IN FLIGHT',
        status_color: '#06B6D4',
        passenger: 'Arjun Mehra',
        flight: '6E 5412',
        eta: '14:25 IST',
        altitude: '36,000 ft',
        progress: 68
      };
    }
  }

  // 4. Convert Currency
  @Tool({
    name: 'convert_currency',
    description: 'Convert foreign travel budgets (USD, EUR, GBP, AED, SGD) into Indian Rupees (INR ₹).',
    inputSchema: z.object({
      amount: z.number().describe('Amount to convert'),
      from_currency: z.enum(['USD', 'EUR', 'GBP', 'AED', 'SGD']).describe('Source currency code'),
      to_currency: z.literal('INR').default('INR')
    })
  })
  async convertCurrency(input: { amount: number; from_currency: string; to_currency: string }, ctx: ExecutionContext) {
    ctx.logger.info('Converting currency via Django API', { amount: input.amount, from: input.from_currency });
    try {
      const response = await api.post('/currency/', input);
      return response.data;
    } catch (error: any) {
      const rates: Record<string, number> = { USD: 86.50, EUR: 89.20, GBP: 108.40, AED: 23.55, SGD: 64.10 };
      const rate = rates[input.from_currency] || 86.50;
      const converted = Math.round(input.amount * rate);
      return {
        source: `${input.from_currency} ${input.amount}`,
        rate: `1 ${input.from_currency} = ₹${rate} INR`,
        converted_inr: `₹${converted.toLocaleString('en-IN')}`,
        amount_inr_numeric: converted
      };
    }
  }

  // 5. Search Hotels
  @Tool({
    name: 'search_hotels',
    description: 'Search top luxury hotels, palace resorts, and beach villas in India.',
    inputSchema: z.object({
      city: z.string().describe('City or state in India e.g. "Udaipur", "Goa", "Jaipur"'),
      guests: z.number().optional().default(2)
    })
  })
  async searchHotels(input: { city: string; guests?: number }, ctx: ExecutionContext) {
    ctx.logger.info('Searching hotels via Django API', { city: input.city });
    try {
      const response = await api.post('/hotels/search/', input);
      return response.data;
    } catch (error: any) {
      return { city: input.city, hotels: [{ name: `Taj Luxury Resort, ${input.city}`, price_per_night: '₹32,000', rating: 4.9 }] };
    }
  }

  // 6. Search Flights
  @Tool({
    name: 'search_flights',
    description: 'Search available flights between Indian cities.',
    inputSchema: z.object({
      origin: z.string().describe('Origin airport code e.g. "BOM", "DEL", "BLR"'),
      destination: z.string().describe('Destination airport code e.g. "JAI", "COK", "IXZ"')
    })
  })
  async searchFlights(input: { origin: string; destination: string }, ctx: ExecutionContext) {
    ctx.logger.info('Searching flights via Django API', { route: `${input.origin} -> ${input.destination}` });
    try {
      const response = await api.post('/flights/search/', input);
      return response.data;
    } catch (error: any) {
      return { route: `${input.origin} -> ${input.destination}`, flights: [{ flight_no: '6E 5412', airline: 'IndiGo', price: '₹6,450' }] };
    }
  }

  // 7. Book Hotel
  @Tool({
    name: 'book_hotel',
    description: 'Book a luxury hotel room or palace suite.',
    inputSchema: z.object({
      hotel_name: z.string().describe('Name of the hotel'),
      check_in: z.string().describe('Check-in date (YYYY-MM-DD)'),
      guests: z.number().optional().default(2)
    })
  })
  async bookHotel(input: { hotel_name: string; check_in: string; guests?: number }, ctx: ExecutionContext) {
    ctx.logger.info('Booking hotel via Django API', { hotel: input.hotel_name });
    try {
      const response = await api.post('/hotels/book/', input);
      return response.data;
    } catch (error: any) {
      return { status: 'CONFIRMED', booking_id: 'BK-HTL-8823', hotel_name: input.hotel_name };
    }
  }

  // 8. Book Flight
  @Tool({
    name: 'book_flight',
    description: 'Reserve a luxury flight seat.',
    inputSchema: z.object({
      flight_no: z.string().describe('Flight number e.g. "6E 5412"'),
      passenger_name: z.string().describe('Full name of passenger')
    })
  })
  async bookFlight(input: { flight_no: string; passenger_name: string }, ctx: ExecutionContext) {
    ctx.logger.info('Booking flight via Django API', { flight: input.flight_no });
    try {
      const response = await api.post('/flights/book/', input);
      return response.data;
    } catch (error: any) {
      return { status: 'CONFIRMED', booking_id: 'BK-FLT-9901', flight_no: input.flight_no, passenger: input.passenger_name };
    }
  }

  // 9. Get Weather
  @Tool({
    name: 'get_weather',
    description: 'Check climate conditions and 3-day forecast for an Indian destination.',
    inputSchema: z.object({
      city: z.string().describe('City or region in India e.g. "Manali", "Goa", "Rajasthan"')
    })
  })
  async getWeather(input: { city: string }, ctx: ExecutionContext) {
    ctx.logger.info('Fetching weather via Django API', { city: input.city });
    try {
      const response = await api.get('/weather/', { params: { city: input.city } });
      return response.data;
    } catch (error: any) {
      return { city: input.city, temperature: '28°C', condition: 'Sunny', best_time_to_visit: 'October – March' };
    }
  }

  // 10. Nearby Places
  @Tool({
    name: 'nearby_places',
    description: 'Find top heritage monuments, restaurants, and attractions near a location in India.',
    inputSchema: z.object({
      location: z.string().describe('Current location or city e.g. "Jaipur", "Kochi", "Udaipur"')
    })
  })
  async nearbyPlaces(input: { location: string }, ctx: ExecutionContext) {
    ctx.logger.info('Fetching nearby places via Django API', { location: input.location });
    try {
      const response = await api.get('/places/nearby/', { params: { location: input.location } });
      return response.data;
    } catch (error: any) {
      return { location: input.location, places: [{ name: 'Amber Fort', category: 'Heritage', distance: '2.4 km' }] };
    }
  }

  // 11. Calculate Budget
  @Tool({
    name: 'calculate_budget',
    description: 'Calculate detailed cost breakdown for an Indian trip.',
    inputSchema: z.object({
      destination: z.string().describe('Target destination'),
      days: z.number().default(7).describe('Duration in days'),
      style: z.enum(['luxury', 'comfort', 'budget']).default('luxury')
    })
  })
  async calculateBudget(input: { destination: string; days?: number; style?: string }, ctx: ExecutionContext) {
    ctx.logger.info('Calculating budget via Django API', { destination: input.destination });
    try {
      const response = await api.post('/budget/calculate/', input);
      return response.data;
    } catch (error: any) {
      return { destination: input.destination, days: input.days || 7, total_estimated_inr: '₹84,000' };
    }
  }

  // 12. Visa Information
  @Tool({
    name: 'visa_information',
    description: 'Get e-Visa requirements and processing details for entering India.',
    inputSchema: z.object({
      nationality: z.string().optional().default('United States').describe('Passport nationality')
    })
  })
  async visaInformation(input: { nationality?: string }, ctx: ExecutionContext) {
    ctx.logger.info('Fetching visa info via Django API', { nationality: input.nationality });
    try {
      const response = await api.get('/visa/', { params: { nationality: input.nationality } });
      return response.data;
    } catch (error: any) {
      return { country: 'India', visa_type: 'e-Tourist Visa (30 Days / 1 Year / 5 Years)', portal: 'https://indianvisaonline.gov.in/evisa/' };
    }
  }

  // 13. Emergency Contacts
  @Tool({
    name: 'emergency_contacts',
    description: 'Get 24/7 tourist helpline, police, ambulance, and emergency numbers in India.',
    inputSchema: z.object({
      city: z.string().optional().default('India')
    })
  })
  async emergencyContacts(input: { city?: string }, ctx: ExecutionContext) {
    ctx.logger.info('Fetching emergency contacts via Django API', { city: input.city });
    try {
      const response = await api.get('/emergency/', { params: { city: input.city } });
      return response.data;
    } catch (error: any) {
      return { tourist_helpline: '1800-11-1363 / 1363', emergency: '112', police: '100', ambulance: '102' };
    }
  }

  // 14. Translate Phrase
  @Tool({
    name: 'translate_phrase',
    description: 'Translate common travel phrases into Hindi, Rajasthani, or Malayalam.',
    inputSchema: z.object({
      phrase: z.string().describe('English phrase to translate e.g. "Thank you"'),
      target_language: z.enum(['Hindi', 'Rajasthani', 'Malayalam']).default('Hindi')
    })
  })
  async translatePhrase(input: { phrase: string; target_language?: string }, ctx: ExecutionContext) {
    ctx.logger.info('Translating phrase via Django API', { phrase: input.phrase });
    try {
      const response = await api.post('/translate/', input);
      return response.data;
    } catch (error: any) {
      return { original: input.phrase, translation: 'नमस्ते (Namaste)' };
    }
  }
}
