import { ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';

export class VoyageAiResources {
  @Resource({
    uri: 'voyageai://destinations',
    name: 'India Luxury Destinations',
    description: 'List of top AI-curated luxury travel destinations in India with prices in ₹',
    mimeType: 'application/json',
    examples: {
      response: {
        destinations: [
          { city: 'Rajasthan', country: 'India', price: '₹89,500', rating: 4.97 },
          { city: 'Kerala', country: 'India', price: '₹74,200', rating: 4.95 }
        ]
      }
    }
  })
  async getDestinationsResource(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Fetching voyageai://destinations resource');

    const destinations = [
      {
        id: 1,
        city: 'Rajasthan',
        country: 'India',
        tag: 'AI Pick',
        price: '₹89,500',
        duration: '8 nights',
        rating: 4.97,
        badge: '🏆 Top Rated',
        description: 'The Land of Kings — royal palaces, golden desert forts, camel safaris, and heritage havelis.',
        highlights: ['Private Desert Safari at Jaisalmer', 'Royal Dining at Umaid Bhawan Palace', 'Hot Air Balloon over Pushkar'],
        hotel_recommendation: 'Taj Lake Palace, Udaipur'
      },
      {
        id: 2,
        city: 'Kerala',
        country: 'India',
        tag: 'Trending',
        price: '₹74,200',
        duration: '7 nights',
        rating: 4.95,
        badge: '⚡ Hot',
        description: "God's Own Country — tranquil backwater houseboat cruises, Panchakarma Ayurvedic retreats, and tea gardens.",
        highlights: ['Luxury Houseboat in Alleppey Backwaters', 'Kathakali Dance in Kochi', 'Ayurvedic Retreat in Wayanad'],
        hotel_recommendation: 'Taj Kumarakom Resort & Spa'
      },
      {
        id: 3,
        city: 'Goa',
        country: 'India',
        tag: 'Luxury',
        price: '₹62,000',
        duration: '5 nights',
        rating: 4.93,
        badge: '✦ Beach Luxury',
        description: 'Sun, sand, and Portuguese heritage — beach villas, luxury beach clubs, spice gardens, and fresh seafood.',
        highlights: ['Sunset Yacht Cruise from Panaji', 'Private Spice Plantation Tour', 'Beachside Dining at Vagator'],
        hotel_recommendation: 'W Goa, Vagator Beach'
      },
      {
        id: 4,
        city: 'Himachal Pradesh',
        country: 'India',
        tag: 'Rare',
        price: '₹68,000',
        duration: '9 nights',
        rating: 4.91,
        badge: '❄️ Snow Season',
        description: 'Dramatic Himalayan valleys of Spiti, Manali, and Dharamshala — snow peaks, monasteries, and stargazing.',
        highlights: ['Spiti Valley 4x4 Expedition', 'Skiing at Solang Nala', 'Dharamshala Monastery Retreat'],
        hotel_recommendation: 'Wildflower Hall, Shimla (Oberoi)'
      },
      {
        id: 5,
        city: 'Varanasi',
        country: 'India',
        tag: 'Cultural',
        price: '₹41,500',
        duration: '4 nights',
        rating: 4.94,
        badge: '🕌 Heritage Pick',
        description: 'Ancient spiritual heart — dawn Ganga Aarti, historic ghats, silk weaving workshops, and ancient temples.',
        highlights: ['Dawn Boat Ride on Dasaswamedh Ghat', 'VIP Ganga Aarti Viewing Platform', 'Banarasi Silk Weaving Workshop'],
        hotel_recommendation: 'Brijrama Palace (Heritage Hotel)'
      },
      {
        id: 6,
        city: 'Andaman Islands',
        country: 'India',
        tag: 'VIP',
        price: '₹95,000',
        duration: '7 nights',
        rating: 4.98,
        badge: '🤿 Pristine Seas',
        description: "India's blue ocean secret — untouched coral reefs at Havelock Island, bioluminescent night kayaking, and luxury overwater villas.",
        highlights: ['Elephant Beach Coral Reef Scuba', 'Bioluminescent Night Kayaking', 'Private Catamaran Transfers'],
        hotel_recommendation: 'Taj Exotica Resort & Spa, Andamans'
      }
    ];

    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({ count: destinations.length, destinations }, null, 2)
      }]
    };
  }

  @Resource({
    uri: 'voyageai://live-missions',
    name: 'Live Luxury Flight Telemetry',
    description: 'Real-time telemetry data for active VoyageAI flights across India',
    mimeType: 'application/json'
  })
  async getMissionsResource(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Fetching voyageai://live-missions resource');

    const missions = [
      {
        mission_id: 'VOY-1101',
        destination: 'Mumbai → Jaisalmer',
        status: 'IN FLIGHT',
        passenger: 'Arjun Mehra',
        flight: '6E 5412',
        eta: '14:25 IST',
        altitude: '36,000 ft',
        progress: 68
      },
      {
        mission_id: 'VOY-2203',
        destination: 'Delhi → Kochi',
        status: 'BOARDING',
        passenger: 'Priya Sharma',
        flight: 'AI 523',
        eta: '10:40 IST',
        altitude: 'Gate 14',
        progress: 8
      },
      {
        mission_id: 'VOY-3305',
        destination: 'Bangalore → Leh',
        status: 'ON SCHEDULE',
        passenger: 'Rahul Nair',
        flight: 'SG 182',
        eta: '08:55 IST',
        altitude: '34,000 ft',
        progress: 51
      }
    ];

    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({ active_missions: missions.length, missions }, null, 2)
      }]
    };
  }
}
