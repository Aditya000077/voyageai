import { GeneratedItinerary } from '../types'

export const MOCK_ITINERARIES: Record<string, GeneratedItinerary> = {
  kyoto: {
    id: 'itin-kyoto-01',
    prompt: 'Kyoto traditional ryokan & bamboo groves 6 days',
    destination: 'Kyoto & Nara Imperial Circuit, Japan',
    duration: '6 Days / 5 Nights',
    estimatedCost: '₹3,25,000',
    aiMatchScore: 99,
    summary: 'Imperial Japanese Sanctuary — stay in historic luxury wooden ryokans, private dawn bamboo grove walk in Arashiyama, master tea ceremony in Gion, and 3-star Michelin kaiseki dining.',
    days: [
      {
        day: 1,
        title: 'Arrival in Osaka Kansai (KIX) → Kyoto Imperial Hotel',
        morning: 'Private luxury bullet train (Shinkansen) transfer from KIX Airport to Kyoto.',
        afternoon: 'Check-in at Hoshinoya Kyoto with private riverboat entrance along the Hozu River.',
        evening: 'Welcome 9-course Kaiseki dinner crafted by Michelin-starred Master Chef.',
        stay: 'Hoshinoya Kyoto'
      },
      {
        day: 2,
        title: 'Arashiyama Bamboo Grove & Tenryu-ji Zen Gardens',
        morning: 'Private dawn entrance to Arashiyama Bamboo Grove before public opening.',
        afternoon: 'VIP guided walk through UNESCO World Heritage Tenryu-ji Zen gardens.',
        evening: 'Traditional Matcha Tea Ceremony hosted by 15th-generation Tea Master.',
        stay: 'Hoshinoya Kyoto'
      },
      {
        day: 3,
        title: 'Gion Geisha Quarter & Fushimi Inari Torii Gates',
        morning: 'Private walking tour of historic Gion preservation district.',
        afternoon: 'VIP access to Fushimi Inari Shrine inner mountain trail.',
        evening: 'Private dinner performance with authentic Kyoto Geiko & Maiko.',
        stay: 'Aman Kyoto'
      },
      {
        day: 4,
        title: 'Nara Deer Park Excursion & Thermal Onsen Detox',
        morning: 'Chauffeur transfer to Nara Park & Kasuga Taisha Grand Shrine.',
        afternoon: 'Onsen mineral hot spring therapy & aromatherapy wellness treatment.',
        evening: 'Sake pairing dinner with master brewer from Fushimi Sake District.',
        stay: 'Aman Kyoto'
      }
    ],
    includedPerks: [
      '24/7 AI Multi-Lingual Japanese Concierge & Transport Booking',
      'Private Riverboat Escort & Luxury Ryokan Suite Upgrade',
      'Exclusive After-Hours Shrine Access & Tea Ceremony',
      'First-Class Shinkansen & Chauffeur Transfers Throughout Japan'
    ]
  },
  alps: {
    id: 'itin-alps-02',
    prompt: 'Swiss Alps ski & Glacier Express retreat ₹4,75,000',
    destination: 'Zermatt & St. Moritz, Switzerland',
    duration: '5 Days / 4 Nights',
    estimatedCost: '₹4,75,000',
    aiMatchScore: 98,
    summary: 'Iconic Alpine Luxury — car-free village chalet stay with Matterhorn view, heli-skiing with certified mountain guide, Glacier Express Excellence Class train journey, and alpine thermal spa detox.',
    days: [
      {
        day: 1,
        title: 'Arrival in Zurich (ZRH) → Zermatt Alpine Chalet',
        morning: 'First-Class Swiss Travel Pass train journey along Lake Geneva to Zermatt.',
        afternoon: 'Check-in at The Omnia Zermatt overlooking the iconic Matterhorn peak.',
        evening: 'Fireside Swiss cheese fondue & alpine wine tasting session.',
        stay: 'The Omnia Zermatt'
      },
      {
        day: 2,
        title: 'Matterhorn Glacier & Heli-Skiing Expedition',
        morning: 'Private helicopter flight & guided ski descent across pristine powder snow.',
        afternoon: 'Lunch at Chez Vrony high-altitude gourmet mountain restaurant.',
        evening: 'Alpine thermal sauna & hydrotherapy recovery session.',
        stay: 'The Omnia Zermatt'
      },
      {
        day: 3,
        title: 'Glacier Express Excellence Class to St. Moritz',
        morning: 'Board the world-famous Glacier Express train in Excellence Class with panoramic views.',
        afternoon: '5-course culinary menu with champagne pairing as train crosses 291 bridges.',
        evening: 'Arrival in St. Moritz & check-in at Badrutt’s Palace Hotel.',
        stay: 'Badrutt’s Palace Hotel, St. Moritz'
      }
    ],
    includedPerks: [
      'Glacier Express Excellence Class Panorama Seats Guaranteed',
      'Private Heli-Skiing & Certified Alpine Guide',
      'Unlimited Swiss Rail & Mountain Cable Car Pass',
      '5-Star Alpine Thermal Spa Access & Daily Hydrotherapy'
    ]
  },
  safari: {
    id: 'itin-safari-03',
    prompt: 'Serengeti safari & Zanzibar overwater villa',
    destination: 'Serengeti National Park & Zanzibar, Tanzania',
    duration: '7 Days / 6 Nights',
    estimatedCost: '₹5,25,000',
    aiMatchScore: 99,
    summary: 'The Ultimate African Wilderness & Ocean Escape — private Serengeti safari tented camp in the path of the Great Migration, hot air balloon sunrise safari, and overwater villa luxury on Zanzibar coral coast.',
    days: [
      {
        day: 1,
        title: 'Arrival in Kilimanjaro (JRO) → Serengeti Private Camp',
        morning: 'Bush plane flight over Great Rift Valley to Serengeti private airstrip.',
        afternoon: 'Check-in at Four Seasons Safari Lodge & initial game drive.',
        evening: 'Sundowner cocktails overlooking active elephant watering hole.',
        stay: 'Four Seasons Safari Lodge Serengeti'
      },
      {
        day: 2,
        title: 'Sunrise Hot Air Balloon Safari & Great Migration',
        morning: 'Dawn hot air balloon flight over Serengeti plains followed by champagne bush breakfast.',
        afternoon: 'Tracking lion pride & leopard with master Maasai wildlife tracker.',
        evening: 'Boma bush dinner with traditional Maasai cultural performance.',
        stay: 'Four Seasons Safari Lodge Serengeti'
      },
      {
        day: 3,
        title: 'Serengeti → Zanzibar Island Villa Flight',
        morning: 'Private charter flight from Serengeti to Zanzibar island.',
        afternoon: 'Check-in at overwater villa suite with private infinity dip pool.',
        evening: 'Seafood catamaran sunset sailing around Mnemba Atoll.',
        stay: 'Zuri Zanzibar Resort & Villas'
      }
    ],
    includedPerks: [
      'Private Bush Plane Charters Between Serengeti & Zanzibar',
      'Hot Air Balloon Safari & Champagne Bush Breakfast',
      'Dedicated 4x4 Land Cruiser with Master Safari Tracker',
      'Private Overwater Villa Suite Upgrade with Personal Butler'
    ]
  },
  default: {
    id: 'itin-global-default',
    prompt: 'Custom Worldwide Luxury Circuit',
    destination: 'Kyoto, Swiss Alps & Paris Global Circuit',
    duration: '7 Days / 6 Nights',
    estimatedCost: '₹4,05,000',
    aiMatchScore: 98,
    summary: 'The ultimate worldwide luxury travel prototype — seamless AI-orchestrated journey combining imperial heritage, alpine peaks, and Michelin dining with 24/7 global concierge.',
    days: [
      {
        day: 1,
        title: 'Arrival & Private Chauffeur Escort',
        morning: 'Private VIP airport lounge reception & luxury chauffeur transfer to 5-star suite.',
        afternoon: 'Guided city orientation with local cultural expert.',
        evening: 'Private chef table dining experience & skyline views.',
        stay: 'Luxury 5-Star Partner Suite'
      },
      {
        day: 2,
        title: 'Heritage & Iconic Landmark VIP Access',
        morning: 'Exclusive early access to world heritage landmark before public entry.',
        afternoon: 'Private yacht or helicopter charter tour.',
        evening: 'Michelin-starred tasting menu dinner.',
        stay: 'Luxury 5-Star Partner Suite'
      },
      {
        day: 3,
        title: 'Wellness & Scenic Exploration',
        morning: 'Dawn yoga or thermal spa wellness treatment.',
        afternoon: 'Panoramic high-altitude or scenic coastal excursion.',
        evening: 'Sunset cocktail reception & fireside lounge.',
        stay: 'Luxury 5-Star Partner Suite'
      }
    ],
    includedPerks: [
      '24/7 Global Autonomous Concierge & Disruption Rerouting',
      'VIP Airport Expedited Fast-Track Entry & Transfers',
      'Guaranteed 5-Star Suite Upgrades & Late Checkout',
      'Complimentary Michelin Chef Table or Thermal Spa Session'
    ]
  }
}
