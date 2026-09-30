import random
import math


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE ENGINE — VoyageAI Smart Navigation
# Three distance tiers:
#   LOCAL     < 500 km  → road / rail alternatives
#   REGIONAL  500–3000 km  → domestic/regional flights with realistic hubs
#   LONG HAUL > 3000 km → intercontinental flights via geographically correct hubs
# ─────────────────────────────────────────────────────────────────────────────


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate great-circle distance in km between two points."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    return 2 * R * math.asin(math.sqrt(a))


def _format_duration(minutes: int) -> str:
    hours = minutes // 60
    mins = minutes % 60
    if hours > 0:
        return f"{hours}h {mins:02d}m"
    return f"{mins} min"


def _crowd_label(level: str) -> str:
    return {'LOW': '🟢 Low Crowd', 'MEDIUM': '🟡 Moderate', 'HIGH': '🔴 High Crowd'}.get(level, '🔴 High Crowd')


def _crowd_color(level: str) -> str:
    return {'LOW': '#10B981', 'MEDIUM': '#F59E0B', 'HIGH': '#EF4444'}.get(level, '#EF4444')


# ─── Region classifier ────────────────────────────────────────────────────────

def _get_region(lat: float, lng: float) -> str:
    """Roughly classify a lat/lng into a world region."""
    # South Asia (India, Pakistan, Bangladesh, Sri Lanka)
    if 5 <= lat <= 38 and 60 <= lng <= 100:
        return 'south_asia'
    # Southeast Asia
    if -10 <= lat <= 28 and 95 <= lng <= 145:
        return 'southeast_asia'
    # East Asia (China, Japan, Korea)
    if 20 <= lat <= 55 and 100 <= lng <= 148:
        return 'east_asia'
    # Middle East / Gulf
    if 12 <= lat <= 42 and 32 <= lng <= 63:
        return 'middle_east'
    # Europe
    if 35 <= lat <= 72 and -12 <= lng <= 45:
        return 'europe'
    # Africa
    if -35 <= lat <= 38 and -20 <= lng <= 52:
        return 'africa'
    # North America
    if 15 <= lat <= 75 and -170 <= lng <= -50:
        return 'north_america'
    # South / Central America
    if -60 <= lat <= 15 and -85 <= lng <= -34:
        return 'south_america'
    # Oceania
    if -50 <= lat <= -10 and 110 <= lng <= 180:
        return 'oceania'
    return 'other'


# ─── Hub database keyed by (origin_region, dest_region) ─────────────────────
# Each entry is a list of (hub_code, hub_city) for realistic stopovers.

_HUB_MAP: dict[tuple[str, str], list[tuple[str, str]]] = {
    # South Asia ↔ Europe
    ('south_asia', 'europe'):      [('DXB', 'Dubai'), ('DOH', 'Doha'), ('IST', 'Istanbul')],
    ('europe', 'south_asia'):      [('DXB', 'Dubai'), ('DOH', 'Doha'), ('IST', 'Istanbul')],
    # South Asia ↔ East Asia
    ('south_asia', 'east_asia'):   [('SIN', 'Singapore'), ('BKK', 'Bangkok'), ('KUL', 'Kuala Lumpur')],
    ('east_asia', 'south_asia'):   [('SIN', 'Singapore'), ('BKK', 'Bangkok'), ('KUL', 'Kuala Lumpur')],
    # South Asia ↔ Southeast Asia
    ('south_asia', 'southeast_asia'): [('CMB', 'Colombo'), ('MAA', 'Chennai'), ('BLR', 'Bengaluru')],
    ('southeast_asia', 'south_asia'): [('CMB', 'Colombo'), ('MAA', 'Chennai'), ('BLR', 'Bengaluru')],
    # South Asia ↔ North America
    ('south_asia', 'north_america'): [('LHR', 'London'), ('FRA', 'Frankfurt'), ('DXB', 'Dubai')],
    ('north_america', 'south_asia'): [('LHR', 'London'), ('FRA', 'Frankfurt'), ('DXB', 'Dubai')],
    # South Asia ↔ Middle East
    ('south_asia', 'middle_east'): [('DXB', 'Dubai'), ('DOH', 'Doha'), ('AUH', 'Abu Dhabi')],
    ('middle_east', 'south_asia'): [('BOM', 'Mumbai'), ('DEL', 'Delhi'), ('BLR', 'Bengaluru')],
    # Europe ↔ North America
    ('europe', 'north_america'):   [('LHR', 'London'), ('CDG', 'Paris'), ('FRA', 'Frankfurt')],
    ('north_america', 'europe'):   [('LHR', 'London'), ('CDG', 'Paris'), ('AMS', 'Amsterdam')],
    # Europe ↔ East Asia
    ('europe', 'east_asia'):       [('DXB', 'Dubai'), ('DOH', 'Doha'), ('IST', 'Istanbul')],
    ('east_asia', 'europe'):       [('DXB', 'Dubai'), ('SIN', 'Singapore'), ('DOH', 'Doha')],
    # North America ↔ East Asia
    ('north_america', 'east_asia'):   [('NRT', 'Tokyo'), ('ICN', 'Seoul'), ('HKG', 'Hong Kong')],
    ('east_asia', 'north_america'):   [('NRT', 'Tokyo'), ('ICN', 'Seoul'), ('HKG', 'Hong Kong')],
    # Africa ↔ Europe
    ('africa', 'europe'):          [('CDG', 'Paris'), ('LHR', 'London'), ('MAD', 'Madrid')],
    ('europe', 'africa'):          [('CDG', 'Paris'), ('LHR', 'London'), ('MAD', 'Madrid')],
    # Oceania ↔ East Asia
    ('oceania', 'east_asia'):      [('SIN', 'Singapore'), ('HKG', 'Hong Kong'), ('BKK', 'Bangkok')],
    ('east_asia', 'oceania'):      [('SIN', 'Singapore'), ('HKG', 'Hong Kong'), ('BKK', 'Bangkok')],
    # South America ↔ North America
    ('south_america', 'north_america'): [('GRU', 'São Paulo'), ('BOG', 'Bogotá'), ('LIM', 'Lima')],
    ('north_america', 'south_america'): [('MIA', 'Miami'), ('JFK', 'New York'), ('LAX', 'Los Angeles')],
}


def _get_hubs(origin_region: str, dest_region: str) -> list[tuple[str, str]]:
    """Return 2 sensible hub options for this origin→dest pair."""
    key = (origin_region, dest_region)
    hubs = _HUB_MAP.get(key, [])
    if not hubs:
        # Symmetric fallback
        hubs = _HUB_MAP.get((dest_region, origin_region), [])
    if not hubs:
        # Generic global hubs as last resort
        hubs = [('DXB', 'Dubai'), ('SIN', 'Singapore'), ('LHR', 'London')]
    return hubs[:2]


# ─── Commercial Airports Database ──────────────────────────────────────────────
AIRPORTS_DB = [
    # India Major Commercial Airports
    {'code': 'MAA', 'city': 'Chennai', 'name': 'Chennai International Airport', 'lat': 12.994, 'lng': 80.180, 'region': 'south_asia'},
    {'code': 'BOM', 'city': 'Mumbai', 'name': 'Chhatrapati Shivaji Maharaj International Airport', 'lat': 19.089, 'lng': 72.868, 'region': 'south_asia'},
    {'code': 'DEL', 'city': 'Delhi', 'name': 'Indira Gandhi International Airport', 'lat': 28.556, 'lng': 77.100, 'region': 'south_asia'},
    {'code': 'BLR', 'city': 'Bengaluru', 'name': 'Kempegowda International Airport', 'lat': 13.198, 'lng': 77.705, 'region': 'south_asia'},
    {'code': 'HYD', 'city': 'Hyderabad', 'name': 'Rajiv Gandhi International Airport', 'lat': 17.240, 'lng': 78.430, 'region': 'south_asia'},
    {'code': 'CCU', 'city': 'Kolkata', 'name': 'Netaji Subhash Chandra Bose International Airport', 'lat': 22.653, 'lng': 88.447, 'region': 'south_asia'},
    {'code': 'PNQ', 'city': 'Pune', 'name': 'Pune Airport', 'lat': 18.582, 'lng': 73.919, 'region': 'south_asia'},
    {'code': 'AMD', 'city': 'Ahmedabad', 'name': 'Sardar Vallabhbhai Patel International Airport', 'lat': 23.072, 'lng': 72.634, 'region': 'south_asia'},
    {'code': 'JAI', 'city': 'Jaipur', 'name': 'Jaipur International Airport', 'lat': 26.824, 'lng': 75.812, 'region': 'south_asia'},
    {'code': 'COK', 'city': 'Kochi', 'name': 'Cochin International Airport', 'lat': 10.152, 'lng': 76.401, 'region': 'south_asia'},
    {'code': 'GOI', 'city': 'Goa', 'name': 'Goa International Airport', 'lat': 15.380, 'lng': 73.831, 'region': 'south_asia'},
    {'code': 'ATQ', 'city': 'Amritsar', 'name': 'Sri Guru Ram Dass Jee International Airport', 'lat': 31.709, 'lng': 74.797, 'region': 'south_asia'},
    {'code': 'VNS', 'city': 'Varanasi', 'name': 'Lal Bahadur Shastri International Airport', 'lat': 25.452, 'lng': 82.859, 'region': 'south_asia'},
    {'code': 'LKO', 'city': 'Lucknow', 'name': 'Chaudhary Charan Singh International Airport', 'lat': 26.760, 'lng': 80.883, 'region': 'south_asia'},
    {'code': 'GAU', 'city': 'Guwahati', 'name': 'Lokpriya Gopinath Bordoloi International Airport', 'lat': 26.106, 'lng': 91.585, 'region': 'south_asia'},
    {'code': 'IXC', 'city': 'Chandigarh', 'name': 'Shaheed Bhagat Singh International Airport', 'lat': 30.673, 'lng': 76.788, 'region': 'south_asia'},
    {'code': 'CJB', 'city': 'Coimbatore', 'name': 'Coimbatore International Airport', 'lat': 11.030, 'lng': 77.043, 'region': 'south_asia'},
    {'code': 'TRZ', 'city': 'Tiruchirappalli', 'name': 'Tiruchirappalli International Airport', 'lat': 10.765, 'lng': 78.705, 'region': 'south_asia'},
    {'code': 'IXM', 'city': 'Madurai', 'name': 'Madurai Airport', 'lat': 9.834, 'lng': 78.093, 'region': 'south_asia'},
    {'code': 'TRV', 'city': 'Thiruvananthapuram', 'name': 'Thiruvananthapuram International Airport', 'lat': 8.482, 'lng': 76.920, 'region': 'south_asia'},
    {'code': 'BBI', 'city': 'Bhubaneswar', 'name': 'Biju Patnaik Airport', 'lat': 20.244, 'lng': 85.817, 'region': 'south_asia'},
    {'code': 'VTZ', 'city': 'Visakhapatnam', 'name': 'Visakhapatnam Airport', 'lat': 17.721, 'lng': 83.224, 'region': 'south_asia'},
    {'code': 'PAT', 'city': 'Patna', 'name': 'Jay Prakash Narayan Airport', 'lat': 25.591, 'lng': 85.088, 'region': 'south_asia'},
    {'code': 'IDR', 'city': 'Indore', 'name': 'Devi Ahilyabai Holkar Airport', 'lat': 22.722, 'lng': 75.801, 'region': 'south_asia'},
    {'code': 'BHO', 'city': 'Bhopal', 'name': 'Raja Bhoj Airport', 'lat': 23.287, 'lng': 77.337, 'region': 'south_asia'},
    {'code': 'NAG', 'city': 'Nagpur', 'name': 'Dr. Babasaheb Ambedkar International Airport', 'lat': 21.092, 'lng': 79.047, 'region': 'south_asia'},
    {'code': 'UDR', 'city': 'Udaipur', 'name': 'Maharana Pratap Airport', 'lat': 24.618, 'lng': 73.896, 'region': 'south_asia'},
    {'code': 'SXR', 'city': 'Srinagar', 'name': 'Sheikh ul-Alam International Airport', 'lat': 33.987, 'lng': 74.774, 'region': 'south_asia'},
]

_INDIA_HUBS = [
    ('BOM', 'Mumbai'), ('DEL', 'Delhi'), ('BLR', 'Bengaluru'),
    ('HYD', 'Hyderabad'), ('MAA', 'Chennai'), ('CCU', 'Kolkata'),
    ('PNQ', 'Pune'), ('AMD', 'Ahmedabad'),
]


def _find_nearest_airport(lat: float, lng: float, region: str = 'south_asia') -> tuple[dict, float]:
    """Locate the closest commercial airport to a given coordinate."""
    candidates = [a for a in AIRPORTS_DB if a.get('region') == region]
    if not candidates:
        candidates = AIRPORTS_DB
    nearest = min(candidates, key=lambda a: haversine_km(lat, lng, a['lat'], a['lng']))
    dist = haversine_km(lat, lng, nearest['lat'], nearest['lng'])
    return nearest, dist


def _nearest_india_hub(lat: float, lng: float, exclude_names: list[str]) -> tuple[str, str]:
    """Pick the nearest major Indian domestic hub that isn't origin/dest."""
    hub_coords = {
        'BOM': (19.089, 72.868), 'DEL': (28.556, 77.100), 'BLR': (13.198, 77.705),
        'HYD': (17.240, 78.430), 'MAA': (12.994, 80.180), 'CCU': (22.653, 88.447),
        'PNQ': (18.582, 73.919), 'AMD': (23.072, 72.634),
    }
    best, best_d = ('DEL', 'Delhi'), float('inf')
    clean_excludes = [e.lower().strip() for e in exclude_names if e]
    for code, city in _INDIA_HUBS:
        if any(ex in city.lower() or city.lower() in ex for ex in clean_excludes):
            continue
        clat, clng = hub_coords.get(code, (20, 78))
        d = haversine_km(lat, lng, clat, clng)
        if d < best_d:
            best_d = d
            best = (code, city)
    return best


# ─── Main entry point ─────────────────────────────────────────────────────────

def calculate_routes(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
    dest_name: str = 'Destination',
    origin_name: str = '',
) -> dict:
    """
    Generates 3 route alternatives between origin and destination.

    Distance tiers:
      LOCAL     < 500 km  → road / express-train alternatives
      REGIONAL  500–3000 km → multi-modal / flight & rail alternatives (respects no-airport cities)
      LONG HAUL > 3000 km → intercontinental flight via geographically correct hubs
    """
    base_km = haversine_km(origin_lat, origin_lng, dest_lat, dest_lng)

    # Classify distance tier
    is_local     = base_km < 500
    is_regional  = 500 <= base_km <= 3000
    is_long_haul = base_km > 3000

    origin_region = _get_region(origin_lat, origin_lng)
    dest_region   = _get_region(dest_lat, dest_lng)

    # Infer origin city name if omitted
    if not origin_name:
        if haversine_km(origin_lat, origin_lng, 12.6823, 79.9800) < 25:
            origin_name = 'Chengalpattu'
        elif haversine_km(origin_lat, origin_lng, 13.0827, 80.2707) < 25:
            origin_name = 'Chennai'
        elif haversine_km(origin_lat, origin_lng, 19.0760, 72.8777) < 30:
            origin_name = 'Mumbai'
        elif haversine_km(origin_lat, origin_lng, 28.6139, 77.2090) < 30:
            origin_name = 'Delhi'
        elif haversine_km(origin_lat, origin_lng, 12.9716, 77.5946) < 30:
            origin_name = 'Bengaluru'
        elif haversine_km(origin_lat, origin_lng, 26.9124, 75.7873) < 25:
            origin_name = 'Jaipur'
        else:
            origin_name = 'Origin'

    # Check whether the origin city has its own commercial airport
    nearest_dep_airport, dist_to_dep_airport = _find_nearest_airport(origin_lat, origin_lng, origin_region)
    origin_has_airport = dist_to_dep_airport <= 25.0
    road_to_airport_km = round(dist_to_dep_airport * 1.15, 1) if not origin_has_airport else 0.0
    road_to_airport_mins = max(20, int((road_to_airport_km / 50.0) * 60)) if not origin_has_airport else 0

    rail_station = (
        'Chengalpattu Jn (CGL)' if 'chengalpattu' in origin_name.lower()
        else f"{origin_name} Central" if any(k in origin_name.lower() for k in ['chennai', 'mumbai', 'delhi'])
        else f"{origin_name} Junction"
    )

    routes = []

    # ── LOCAL: road / rail ────────────────────────────────────────────────────
    if is_local:
        speed_kmh = 80
        route_configs = [
            {
                'name': 'Route A',
                'label': 'Expressway (Fastest)',
                'distance_km': base_km * 1.10,
                'time_factor': 1.0,
                'crowd_choices': ['HIGH', 'HIGH', 'MEDIUM'],
                'description': f'National Highway / Expressway — shortest drive time from {origin_name} to {dest_name}',
                'extra_mins': 0,
            },
            {
                'name': 'Route B',
                'label': 'State Highway (Scenic)',
                'distance_km': base_km * 1.22,
                'time_factor': 1.10,
                'crowd_choices': ['LOW', 'LOW', 'MEDIUM'],
                'description': f'Scenic highway bypass — avoids city congestion and toll bottlenecks near {dest_name}',
                'extra_mins': 0,
            },
            {
                'name': 'Route C',
                'label': f'Express Rail ({rail_station})',
                'distance_km': base_km * 1.15,
                'time_factor': 1.05,
                'crowd_choices': ['MEDIUM', 'LOW', 'LOW'],
                'description': f'Intercity / Express train from {rail_station} to {dest_name} — relaxed, schedule-based',
                'extra_mins': 0,
            },
        ]

    # ── REGIONAL: domestic / short-haul (500–3000 km) ─────────────────────────
    elif is_regional:
        flight_speed_kmh = 750

        if not origin_has_airport:
            # Origin has NO airport (e.g. Chengalpattu) -> must transfer to nearest airport (e.g. Chennai MAA)
            dep_code = nearest_dep_airport['code']
            dep_city = nearest_dep_airport['city']

            # Choose an intermediate flight layover hub (exclude dep city & dest)
            dest_city = dest_name.split(',')[0].split()[0]
            hub_code, hub_city = _nearest_india_hub(
                dest_lat, dest_lng,
                exclude_names=[origin_name, dep_city, dest_city]
            )

            route_configs = [
                {
                    'name': 'Route A',
                    'label': f'Cab to {dep_code} + Direct Flight',
                    'distance_km': base_km + road_to_airport_km,
                    'time_factor': 1.0,
                    'crowd_choices': ['HIGH', 'MEDIUM', 'HIGH'],
                    'description': f'Cab (~{int(road_to_airport_km)} km, {road_to_airport_mins}m) to {dep_city} Airport ({dep_code}) → Non-stop flight to {dest_name}',
                    'extra_mins': road_to_airport_mins + 40,
                },
                {
                    'name': 'Route B',
                    'label': f'Cab to {dep_code} + Via {hub_city} ({hub_code})',
                    'distance_km': (base_km * 1.08) + road_to_airport_km,
                    'time_factor': 1.12,
                    'crowd_choices': ['LOW', 'MEDIUM', 'LOW'],
                    'description': f'Cab to {dep_city} ({dep_code}) → 1-stop flight connection via {hub_city} ({hub_code}) to {dest_name}',
                    'extra_mins': road_to_airport_mins + 70,
                },
                {
                    'name': 'Route C',
                    'label': f'Express Rail ({rail_station})',
                    'distance_km': base_km * 1.15,
                    'time_factor': 1.0,
                    'crowd_choices': ['MEDIUM', 'LOW', 'LOW'],
                    'description': f'Superfast Express train from {rail_station} to {dest_name} — relaxed rail travel, zero airport check-in queues',
                    # Train door-to-door calculation (~80 km/h)
                    'speed_kmh_override': 80,
                    'extra_mins': 20,
                },
            ]
        else:
            # Origin DOES have an airport (e.g. Chennai, Mumbai, Delhi)
            dest_city = dest_name.split(',')[0].split()[0]
            hub_code, hub_city = _nearest_india_hub(
                dest_lat, dest_lng,
                exclude_names=[origin_name, dest_city]
            )
            hub2_code, hub2_city = _nearest_india_hub(
                dest_lat, dest_lng,
                exclude_names=[origin_name, dest_city, hub_city]
            )

            route_configs = [
                {
                    'name': 'Route A',
                    'label': 'Direct Flight',
                    'distance_km': base_km,
                    'time_factor': 1.0,
                    'crowd_choices': ['HIGH', 'MEDIUM', 'HIGH'],
                    'description': f'Direct non-stop flight from {origin_name} to {dest_name} — fastest air option',
                    'extra_mins': 35,
                },
                {
                    'name': 'Route B',
                    'label': f'Via {hub_city} ({hub_code})',
                    'distance_km': base_km * 1.08,
                    'time_factor': 1.15,
                    'crowd_choices': ['LOW', 'MEDIUM', 'LOW'],
                    'description': f'1-stop flight connection through {hub_city} ({hub_code}) — less crowded alternative terminal',
                    'extra_mins': 65,
                },
                {
                    'name': 'Route C',
                    'label': f'Via {hub2_city} ({hub2_code})',
                    'distance_km': base_km * 1.12,
                    'time_factor': 1.20,
                    'crowd_choices': ['MEDIUM', 'LOW', 'MEDIUM'],
                    'description': f'1-stop via {hub2_city} ({hub2_code}) — balanced crowd and flexible frequency',
                    'extra_mins': 70,
                },
            ]

    # ── LONG HAUL: intercontinental flights (> 3000 km) ───────────────────────
    else:
        flight_speed_kmh = 900
        hubs = _get_hubs(origin_region, dest_region)
        h1_code, h1_city = hubs[0] if len(hubs) > 0 else ('DXB', 'Dubai')
        h2_code, h2_city = hubs[1] if len(hubs) > 1 else ('SIN', 'Singapore')

        if not origin_has_airport:
            dep_code = nearest_dep_airport['code']
            dep_city = nearest_dep_airport['city']
            route_configs = [
                {
                    'name': 'Route A',
                    'label': f'Cab to {dep_code} + Direct Flight',
                    'distance_km': base_km + road_to_airport_km,
                    'time_factor': 1.0,
                    'crowd_choices': ['HIGH', 'MEDIUM', 'HIGH'],
                    'description': f'Road transit to {dep_city} Airport ({dep_code}) → Non-stop long-haul flight to {dest_name}',
                    'extra_mins': road_to_airport_mins + 60,
                },
                {
                    'name': 'Route B',
                    'label': f'Cab to {dep_code} + Via {h1_city} ({h1_code})',
                    'distance_km': (base_km * 1.06) + road_to_airport_km,
                    'time_factor': 1.14,
                    'crowd_choices': ['LOW', 'MEDIUM', 'LOW'],
                    'description': f'Cab to {dep_city} ({dep_code}) → Intercontinental connection via {h1_city} ({h1_code}) to {dest_name}',
                    'extra_mins': road_to_airport_mins + 90,
                },
                {
                    'name': 'Route C',
                    'label': f'Cab to {dep_code} + Via {h2_city} ({h2_code})',
                    'distance_km': (base_km * 1.10) + road_to_airport_km,
                    'time_factor': 1.20,
                    'crowd_choices': ['MEDIUM', 'LOW', 'MEDIUM'],
                    'description': f'Cab to {dep_city} ({dep_code}) → 1-stop connection via {h2_city} ({h2_code}) to {dest_name}',
                    'extra_mins': road_to_airport_mins + 95,
                },
            ]
        else:
            route_configs = [
                {
                    'name': 'Route A',
                    'label': 'Direct Flight',
                    'distance_km': base_km,
                    'time_factor': 1.0,
                    'crowd_choices': ['HIGH', 'MEDIUM', 'HIGH'],
                    'description': f'Non-stop long-haul flight from {origin_name} to {dest_name} — fastest premium option',
                    'extra_mins': 45,
                },
                {
                    'name': 'Route B',
                    'label': f'Via {h1_city} ({h1_code})',
                    'distance_km': base_km * 1.06,
                    'time_factor': 1.14,
                    'crowd_choices': ['LOW', 'MEDIUM', 'LOW'],
                    'description': f'1-stop connection at {h1_city} ({h1_code}) — world-class transit hub and lounges',
                    'extra_mins': 80,
                },
                {
                    'name': 'Route C',
                    'label': f'Via {h2_city} ({h2_code})',
                    'distance_km': base_km * 1.10,
                    'time_factor': 1.20,
                    'crowd_choices': ['MEDIUM', 'LOW', 'MEDIUM'],
                    'description': f'1-stop connection via {h2_city} ({h2_code}) — optimal schedule flexibility to {dest_name}',
                    'extra_mins': 85,
                },
            ]

    # ── Build route objects ───────────────────────────────────────────────────
    for cfg in route_configs:
        distance = round(cfg['distance_km'], 1)
        speed = cfg.get('speed_kmh_override', (80 if is_local else 750 if is_regional else 900))
        base_mins = int((distance / speed) * 60 * cfg['time_factor']) + cfg.get('extra_mins', 0)

        crowd_level   = random.choice(cfg['crowd_choices'])
        crowd_delay   = {'LOW': random.randint(2, 8),  'MEDIUM': random.randint(10, 22), 'HIGH': random.randint(22, 50)}[crowd_level]
        wait_minutes  = {'LOW': random.randint(0, 8),  'MEDIUM': random.randint(8, 20),  'HIGH': random.randint(20, 45)}[crowd_level]
        traffic_delay = {'LOW': random.randint(0, 5),  'MEDIUM': random.randint(5, 15),  'HIGH': random.randint(15, 35)}[crowd_level]

        total_mins = base_mins + crowd_delay + wait_minutes + traffic_delay

        routes.append({
            'name':                    cfg['name'],
            'label':                   cfg['label'],
            'description':             cfg['description'],
            'distance_km':             distance,
            'base_duration_minutes':   base_mins,
            'base_duration_formatted': _format_duration(base_mins),
            'crowd_level':             crowd_level,
            'crowd_label':             _crowd_label(crowd_level),
            'crowd_color':             _crowd_color(crowd_level),
            'crowd_delay_minutes':     crowd_delay,
            'traffic_delay_minutes':   traffic_delay,
            'wait_minutes':            wait_minutes,
            'total_minutes':           total_mins,
            'total_duration_formatted':_format_duration(total_mins),
            'is_recommended':          False,
        })



    # ── Recommend: lowest total time + crowd score ───────────────────────────
    crowd_weight = {'LOW': 0, 'MEDIUM': 100, 'HIGH': 300}
    scored = sorted(routes, key=lambda r: r['total_minutes'] + crowd_weight[r['crowd_level']])
    scored[0]['is_recommended'] = True

    savings = scored[1]['total_minutes'] - scored[0]['total_minutes'] if len(scored) > 1 else 0

    return {
        'origin':          {'lat': origin_lat, 'lng': origin_lng},
        'destination':     {'name': dest_name, 'lat': dest_lat, 'lng': dest_lng},
        'distance_km':     round(base_km, 1),
        'is_long_haul':    not is_local,   # frontend uses this to label "Local" vs "Flight"
        'is_regional':     is_regional,
        'routes':          scored,
        'recommended_route': scored[0]['name'],
        'savings_minutes': max(0, savings),
        'savings_formatted': _format_duration(max(0, savings)),
        'crowd_alert':     scored[1]['crowd_level'] == 'HIGH' if len(scored) > 1 else False,
    }
