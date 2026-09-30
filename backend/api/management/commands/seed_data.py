from django.core.management.base import BaseCommand
from api.models import Destination, Feature, Mission, Testimonial

class Command(BaseCommand):
    help = "Seeds initial database records for VoyageAI Global Travel Intelligence Platform."

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding VoyageAI Global database with 12 world destinations...")

        # 1. Destinations — 12 Iconic Global Destinations
        destinations_data = [
            {
                "city": "Kyoto & Nara",
                "country": "Japan",
                "tag": "AI Pick",
                "tag_color": "#10B981",
                "price": "₹3,25,000",
                "duration": "6 nights",
                "rating": 4.99,
                "reviews": 8420,
                "score": 99,
                "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop&auto=format",
                "coords": "35.0116° N, 135.7681° E",
                "temp": "19°C",
                "badge": "⛩️ Bamboo & Temple Sanctuaries",
                "description": "Ancient imperial capital — historic wooden ryokans, private tea ceremonies in Gion, bamboo forest walks, and Michelin kaiseki dining.",
                "highlights": ["Private Arashiyama Bamboo Grove Dawn Walk", "Traditional Kaiseki & Master Tea Ceremony", "Exclusive Access to Gion Geisha District"],
                "best_season": "March – May & October – November",
                "hotel_recommendation": "Hoshinoya Kyoto & Aman Kyoto"
            },
            {
                "city": "Amritsar & Golden Temple",
                "country": "India",
                "tag": "Spiritual Heritage",
                "tag_color": "#F59E0B",
                "price": "₹25,000",
                "duration": "2 nights",
                "rating": 4.98,
                "reviews": 5420,
                "score": 99,
                "image": "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?w=800&h=600&fit=crop&auto=format",
                "coords": "31.6340° N, 74.8723° E",
                "temp": "24°C",
                "badge": "🛕 Golden Temple & Wagah Ceremony",
                "description": "Spiritual heart of Punjab — sacred Golden Temple (Sri Harmandir Sahib) illuminated at dawn, Wagah Border retreat flag ceremony, and world-famous Punjabi culinary heritage.",
                "highlights": ["Dawn Palki Sahib & Golden Temple Sanctum Escort", "Patriotic Wagah Border Sunset Retreat Ceremony", "Authentic Kulcha & Guru ka Langar Experience"],
                "best_season": "October – March",
                "hotel_recommendation": "Taj Swarna Amritsar & Hyatt Regency Amritsar"
            },
            {
                "city": "Chennai & Coromandel Coast",
                "country": "India",
                "tag": "Coromandel Heritage",
                "tag_color": "#10B981",
                "price": "₹45,000",
                "duration": "3 nights",
                "rating": 4.96,
                "reviews": 4120,
                "score": 98,
                "image": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&h=600&fit=crop&auto=format",
                "coords": "13.0827° N, 80.2707° E",
                "temp": "29°C",
                "badge": "🌊 Shore Temples & Dravidian Culture",
                "description": "Gateway to South India — historic Kapaleeshwarar Temple in Mylapore, UNESCO Shore Temples of Mahabalipuram, and Marina Beach sunrise walks.",
                "highlights": ["UNESCO Mahabalipuram Shore Temple Guided Walk", "Mylapore Dravidian Architecture & Filter Coffee Tour", "Coromandel Coast Seafood Barbecue"],
                "best_season": "November – February",
                "hotel_recommendation": "The Leela Palace Chennai & Taj Fisherman's Cove"
            },
            {
                "city": "Jaipur",
                "country": "India",
                "tag": "Royal Pink City",
                "tag_color": "#EC4899",
                "price": "₹1,85,000",
                "duration": "3 nights",
                "rating": 4.97,
                "reviews": 7820,
                "score": 99,
                "image": "https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?w=800&h=600&fit=crop&auto=format",
                "coords": "26.9124° N, 75.7873° E",
                "temp": "27°C",
                "badge": "🏰 Amer Fort & Hawa Mahal",
                "description": "Royal Rajasthani elegance — sunrise Hawa Mahal photography, private Amer Fort ascent, Jal Mahal views, and palace stays.",
                "highlights": ["Amer Fort Royal Ascent & Sheesh Mahal", "Private Hawa Mahal Dawn Photography", "Heritage Dining at Rambagh Palace"],
                "best_season": "October – March",
                "hotel_recommendation": "Rambagh Palace & The Oberoi Rajvilas"
            },
            {
                "city": "Agra & Taj Mahal",
                "country": "India",
                "tag": "Mughal Wonder",
                "tag_color": "#3B82F6",
                "price": "₹1,45,000",
                "duration": "2 nights",
                "rating": 4.99,
                "reviews": 12400,
                "score": 99,
                "image": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop&auto=format",
                "coords": "27.1767° N, 78.0081° E",
                "temp": "26°C",
                "badge": "🕌 Taj Mahal Sunrise Wonder",
                "description": "Eternal Mughal majesty — VIP sunrise entrance to the Taj Mahal, Agra Fort historical walk, and Mehtab Bagh sunset reflections.",
                "highlights": ["Sunrise VIP Entrance to Taj Mahal", "Mehtab Bagh Twilight Sunset View", "Pietra Dura Marble Inlay Workshop"],
                "best_season": "October – March",
                "hotel_recommendation": "The Oberoi Amarvilas Agra"
            },
            {
                "city": "Goa Beaches & Heritage",
                "country": "India",
                "tag": "Coastal Luxe",
                "tag_color": "#06B6D4",
                "price": "₹65,000",
                "duration": "4 nights",
                "rating": 4.95,
                "reviews": 8900,
                "score": 97,
                "image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&auto=format",
                "coords": "15.2993° N, 74.1240° E",
                "temp": "31°C",
                "badge": "🏖️ Portuguese Villas & Catamaran Sailing",
                "description": "Tropical coastal escape — private luxury beachfront villas in North Goa, Fontainhas Latin Quarter heritage walks, and Mandovi River catamaran cruises.",
                "highlights": ["Fontainhas Latin Quarter Architecture Walk", "Private Catamaran Sunset Cruise", "Spice Plantation Tour & Goan Seafood Feast"],
                "best_season": "November – February",
                "hotel_recommendation": "Taj Exotica Resort & St. Regis Goa"
            },
            {
                "city": "Santorini & Amalfi Coast",
                "country": "Greece & Italy",
                "tag": "Trending",
                "tag_color": "#059669",
                "price": "₹4,15,000",
                "duration": "7 nights",
                "rating": 4.98,
                "reviews": 9150,
                "score": 98,
                "image": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop&auto=format",
                "coords": "36.3932° N, 25.4615° E",
                "temp": "26°C",
                "badge": "🌊 Oceanfront Cliff Villas",
                "description": "Iconic Mediterranean elegance — whitewashed caldera suites, private catamaran sailing around volcanic coves, and cliffside Amalfi lemon grove dining.",
                "highlights": ["Private Sunset Catamaran Cruise in Oia Caldera", "Positano Coastal Yacht Charter", "Volcanic Wine Tasting with Sommelier"],
                "best_season": "May – October",
                "hotel_recommendation": "Canaves Oia Epitome & Le Sirenuse"
            },
            {
                "city": "Zermatt & Swiss Alps",
                "country": "Switzerland",
                "tag": "Alpine Luxe",
                "tag_color": "#047857",
                "price": "₹4,75,000",
                "duration": "5 nights",
                "rating": 4.97,
                "reviews": 6380,
                "score": 97,
                "image": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&h=600&fit=crop&auto=format",
                "coords": "45.9765° N, 7.7491° E",
                "temp": "4°C",
                "badge": "🏔️ Matterhorn Chalets",
                "description": "Majestic alpine sanctuary — car-free village chalets, panoramic Glacier Express rail journeys, heli-skiing, and thermal mountain spa wellness.",
                "highlights": ["Private Heli-Skiing Experience over Matterhorn", "Glacier Express Excellence Class Train Journey", "Alpine Thermal Spa & Fondue Experience"],
                "best_season": "December – April & July – September",
                "hotel_recommendation": "The Omnia Zermatt & Grand Hotel Zermatterhof"
            },
            {
                "city": "Serengeti & Zanzibar",
                "country": "Tanzania",
                "tag": "Safari & Beach",
                "tag_color": "#065F46",
                "price": "₹5,25,000",
                "duration": "8 nights",
                "rating": 4.96,
                "reviews": 4890,
                "score": 99,
                "image": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop&auto=format",
                "coords": "2.3333° S, 34.8333° E",
                "temp": "28°C",
                "badge": "🦁 Great Migration & Coral Isles",
                "description": "The ultimate wild luxury adventure — private safari tented camps in the heart of the Great Migration followed by turquoise island villa relaxation in Stone Town & Zanzibar.",
                "highlights": ["Sunrise Hot Air Balloon Safari over Serengeti", "Private Wildlife Tracking with Maasai Guides", "Luxury Overwater Villa Stay in Zanzibar"],
                "best_season": "June – October & December – March",
                "hotel_recommendation": "Four Seasons Safari Lodge Serengeti & Zuri Zanzibar"
            },
            {
                "city": "Bali & Raja Ampat",
                "country": "Indonesia",
                "tag": "Tropical Haven",
                "tag_color": "#059669",
                "price": "₹2,90,000",
                "duration": "7 nights",
                "rating": 4.95,
                "reviews": 10420,
                "score": 96,
                "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&auto=format",
                "coords": "8.3405° S, 115.0920° E",
                "temp": "30°C",
                "badge": "🌴 Jungle Sanctuary & Coral Reefs",
                "description": "Spiritual tropical paradise — private infinity pool villas suspended over Ubud jungle ravines, sacred water temple cleanses, and untouched coral reef yacht expeditions.",
                "highlights": ["Private Jungle Ravine Villa with Infinity Pool", "Exclusive Phinisi Yacht Cruise in Raja Ampat", "Holistic Sound Bath & Balinese Healing"],
                "best_season": "April – October",
                "hotel_recommendation": "Viceroy Bali & Nihi Sumba"
            },
            {
                "city": "Paris & Côte d’Azur",
                "country": "France",
                "tag": "Cultural Luxe",
                "tag_color": "#EC4899",
                "price": "₹4,20,000",
                "duration": "6 nights",
                "rating": 4.96,
                "reviews": 7920,
                "score": 98,
                "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop&auto=format",
                "coords": "48.8566° N, 2.3522° E",
                "temp": "21°C",
                "badge": "🍷 Haute Couture & Riviera",
                "description": "Elegance redefined — after-hours private tour of the Louvre museum, 3-star Michelin gastronomy, and superyacht charters along St. Tropez & French Riviera.",
                "highlights": ["After-Hours Private Tour of Louvre Museum", "3-Star Michelin Dining Experience with Head Chef", "Private Riviera Yacht Charter in St. Tropez"],
                "best_season": "May – October",
                "hotel_recommendation": "Hôtel de Crillon Paris & Hotel du Cap-Eden-Roc"
            },
            {
                "city": "New York City",
                "country": "USA",
                "tag": "Metropolitan",
                "tag_color": "#047857",
                "price": "₹3,80,000",
                "duration": "5 nights",
                "rating": 4.94,
                "reviews": 11200,
                "score": 95,
                "image": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop&auto=format",
                "coords": "40.7128° N, 74.0060° W",
                "temp": "22°C",
                "badge": "🏙️ Central Park Penthouses",
                "description": "The epicenter of global culture — skyline penthouse suites overlooking Central Park, VIP Broadway backstage access, and private doors-off helicopter skyline flights.",
                "highlights": ["VIP Backstage Access to Top Broadway Show", "Private Skyline Helicopter Flight over Manhattan", "Central Park Terrace Suite Stay"],
                "best_season": "April – June & September – November",
                "hotel_recommendation": "The Plaza New York & Aman New York"
            },
            {
                "city": "Reykjavik & Golden Circle",
                "country": "Iceland",
                "tag": "Nordic Wonder",
                "tag_color": "#10B981",
                "price": "₹3,65,000",
                "duration": "5 nights",
                "rating": 4.95,
                "reviews": 5120,
                "score": 97,
                "image": "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&h=600&fit=crop&auto=format",
                "coords": "64.1466° N, 21.9426° W",
                "temp": "8°C",
                "badge": "🌌 Aurora Glass Igloos & Silica Spas",
                "description": "Land of fire and ice — private glass igloo stays under the Northern Lights, silica geothermal baths at the Blue Lagoon, and Silfra fissure diving between tectonic plates.",
                "highlights": ["Private Northern Lights Chase with Astronomer", "Exclusive Silica Spa & Hydrotherapy at Blue Lagoon", "Snorkeling Silfra Fissure Tectonic Rift"],
                "best_season": "September – April (Aurora) & June – August (Midnight Sun)",
                "hotel_recommendation": "The Retreat at Blue Lagoon & Deplar Farm"
            },
            {
                "city": "Maldives Coral Atolls",
                "country": "Maldives",
                "tag": "Overwater Luxe",
                "tag_color": "#2DD4BF",
                "price": "₹5,50,000",
                "duration": "6 nights",
                "rating": 4.99,
                "reviews": 7310,
                "score": 99,
                "image": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&auto=format",
                "coords": "3.2028° N, 73.2207° E",
                "temp": "29°C",
                "badge": "🏝️ Ocean Bungalows & Manta Rays",
                "description": "Pristine Indian Ocean sanctuary — private overwater ocean villas with water slides into turquoise lagoons, bioluminescent night beach walks, and underwater Michelin dining.",
                "highlights": ["Private Seaplane Flight & Water-Slide Suite Stay", "Underwater Restaurant Dining 5 Meters Below Sea", "Night Snorkeling with Bioluminescent Plankton & Mantas"],
                "best_season": "November – April",
                "hotel_recommendation": "Soneva Jani & Cheval Blanc Randheli"
            },
            {
                "city": "Cairo & Nile River",
                "country": "Egypt",
                "tag": "Ancient Wonders",
                "tag_color": "#047857",
                "price": "₹3,90,000",
                "duration": "7 nights",
                "rating": 4.94,
                "reviews": 6240,
                "score": 96,
                "image": "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&h=600&fit=crop&auto=format",
                "coords": "30.0444° N, 31.2357° E",
                "temp": "27°C",
                "badge": "🏺 Pyramids & Dahabiya River Cruises",
                "description": "5,000 years of majesty — private dawn access inside the Great Pyramid of Giza, exclusive Sphinx enclosure entry, and luxury Dahabiya sailboat cruises along the Nile from Luxor to Aswan.",
                "highlights": ["Private Dawn Access Inside Great Pyramid of Giza", "Private Luxury Dahabiya Sailboat Cruise on Nile", "VIP After-Hours Tour of Grand Egyptian Museum"],
                "best_season": "October – April",
                "hotel_recommendation": "Marriott Mena House Cairo & Sofitel Winter Palace Luxor"
            },
            {
                "city": "Machu Picchu & Cusco",
                "country": "Peru",
                "tag": "Inca Trail Luxe",
                "tag_color": "#065F46",
                "price": "₹4,30,000",
                "duration": "6 nights",
                "rating": 4.96,
                "reviews": 4420,
                "score": 97,
                "image": "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop&auto=format",
                "coords": "13.1631° S, 72.5450° W",
                "temp": "17°C",
                "badge": "🦙 Cloud Forest & Sacred Valley",
                "description": "High Andes mystical realm — luxury Belmond Hiram Bingham train through Sacred Valley, private sunrise entry to Machu Picchu, and ancient Incan astronomy stargazing.",
                "highlights": ["Belmond Hiram Bingham Luxury Train Journey", "Private Sunrise Guided Tour of Machu Picchu Citadel", "Sacred Valley Organic Farm & Andean Weaving Tour"],
                "best_season": "May – October",
                "hotel_recommendation": "Belmond Sanctuary Lodge & Palacio Nazarenas Cusco"
            }
        ]


        Destination.objects.all().delete()
        for item in destinations_data:
            Destination.objects.update_or_create(
                city=item['city'], country=item['country'], defaults=item
            )

        # 2. Features — Global Specialized AI Engines
        features_data = [
            {
                "feature_id": "global-flight-router",
                "icon": "Cpu",
                "label": "Global Flight & Jet Router",
                "title": "Autonomous Flight & Transit Engine",
                "desc": "Models 12,000+ long-haul air routes, luxury yacht charters, and bullet trains in real-time — optimizing for jetlag reduction, connection windows, and private terminal transfers.",
                "accent": "#10B981",
                "metric": "195+ Countries",
                "detail_points": ["Jetlag-prevention flight scheduling algorithms", "Real-time global airspace & private terminal telemetry"]
            },
            {
                "feature_id": "microclimate-radar",
                "icon": "Cloud",
                "label": "Microclimate & Aurora Radar",
                "title": "Hyper-Local Weather & Migration Predictor",
                "desc": "Predicts microclimates across mountain peaks, ocean currents, cherry blossom blooms in Japan, Aurora Borealis in Scandinavia, and Serengeti wildlife migrations.",
                "accent": "#06B6D4",
                "metric": "98.4% Precision",
                "detail_points": ["Satellite weather & solar flare aurora forecasting", "Cherry blossom & autumn foliage peak predictors"]
            },
            {
                "feature_id": "worldwide-culture-ai",
                "icon": "Sparkles",
                "label": "Worldwide Cultural AI",
                "title": "Michelin & Heritage Table Concierge",
                "desc": "Uncovers secret heritage access — from after-hours private museum entry to sold-out 3-star Michelin table reservations and local custom etiquette assistance.",
                "accent": "#F59E0B",
                "metric": "2,500+ Michelin Spots",
                "detail_points": ["Instant access to hard-to-book global dining tables", "Private museum after-hours & green room bookings"]
            }
        ]

        for feat in features_data:
            Feature.objects.update_or_create(
                feature_id=feat['feature_id'], defaults=feat
            )

        # 3. Missions — International Long-Haul Telemetry
        Mission.objects.all().delete()
        missions_data = [
            {
                "mission_id": "GLOB-101",
                "destination": "Tokyo (HND) → London (LHR)",
                "status": "IN FLIGHT",
                "status_color": "#06B6D4",
                "passenger": "Elena Rostova",
                "seat": "1A (First Class)",
                "flight": "BA 6",
                "eta": "16:45 UTC",
                "altitude": "39,000 ft",
                "progress": 68,
                "origin": "Haneda Intl Airport (HND)",
                "aircraft": "Boeing 787-9 Dreamliner",
                "speed": "510 knots"
            },
            {
                "mission_id": "GLOB-204",
                "destination": "New York (JFK) → Paris (CDG)",
                "status": "BOARDING",
                "status_color": "#F59E0B",
                "passenger": "Marcus Vance",
                "seat": "2K (La Première)",
                "flight": "AF 7",
                "eta": "22:15 UTC",
                "altitude": "Gate 14",
                "progress": 15,
                "origin": "John F. Kennedy Intl (JFK)",
                "aircraft": "Airbus A350-900",
                "speed": "0 knots (Boarding)"
            },
            {
                "mission_id": "GLOB-308",
                "destination": "Dubai (DXB) → Sydney (SYD)",
                "status": "ON SCHEDULE",
                "status_color": "#10B981",
                "passenger": "Aria Takahashi",
                "seat": "Suite 3",
                "flight": "EK 414",
                "eta": "06:30 UTC",
                "altitude": "41,000 ft",
                "progress": 42,
                "origin": "Dubai Intl Airport (DXB)",
                "aircraft": "Airbus A380-800",
                "speed": "530 knots"
            },
            {
                "mission_id": "GLOB-412",
                "destination": "Singapore (SIN) → Zurich (ZRH)",
                "status": "IN FLIGHT",
                "status_color": "#3B82F6",
                "passenger": "Dr. Henrik Lindqvist",
                "seat": "1D (First Suite)",
                "flight": "SQ 346",
                "eta": "08:50 UTC",
                "altitude": "38,000 ft",
                "progress": 84,
                "origin": "Changi Airport (SIN)",
                "aircraft": "Boeing 777-300ER",
                "speed": "495 knots"
            }
        ]

        for m in missions_data:
            Mission.objects.update_or_create(
                mission_id=m['mission_id'], defaults=m
            )

        # 4. Testimonials — Global Connoisseurs
        Testimonial.objects.all().delete()
        testimonials_data = [
            {
                "name": "Hiroshi Tanaka",
                "role": "Tech Executive & Collector, Tokyo",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format",
                "quote": "VoyageAI planned a 6-day Swiss Alps ski & Glacier Express circuit flawlessly. It secured Excellence Class train seats that were sold out everywhere, and arranged a private helicopter ski drop on Matterhorn. Incomparable precision.",
                "rating": 5,
                "trips": 18,
                "badge": "Global Connoisseur"
            },
            {
                "name": "Sophia Laurent",
                "role": "Art Historian & Curator, Geneva",
                "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&auto=format",
                "quote": "The Kyoto ryokan & tea master matcher connected me with a 15th-generation tea master in Gion. VoyageAI handled private riverboat transfers, after-hours shrine access, and Michelin dining effortlessly.",
                "rating": 5,
                "trips": 28,
                "badge": "World Travel Ambassador"
            },
            {
                "name": "Alexander Wright",
                "role": "Venture Investor, New York",
                "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&auto=format",
                "quote": "From Serengeti balloon safaris to overwater villas in Zanzibar, VoyageAI delivers real-time flight telemetry, visa clearance, and instant 5-star upgrades across all timezones.",
                "rating": 5,
                "trips": 42,
                "badge": "Founding Globe Member"
            }
        ]

        for t in testimonials_data:
            Testimonial.objects.update_or_create(
                name=t['name'], defaults=t
            )

        self.stdout.write(self.style.SUCCESS("Successfully seeded 12 global world destinations into VoyageAI!"))
