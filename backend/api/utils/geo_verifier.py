import re
import difflib
import requests
import urllib.parse
import os

# Curated global and Indian travel destinations for instant sub-millisecond lookup
POPULAR_DESTINATIONS = [
    'Perth', 'Paris', 'Prague', 'Phuket', 'Pattaya', 'Porto', 'Pondicherry', 'Pune',
    'Jaipur', 'Kyoto', 'Santorini', 'Zermatt', 'Reykjavik', 'Serengeti', 'Cairo', 'Bali',
    'New York', 'Machu Picchu', 'Amritsar', 'Goa', 'Chennai', 'Maldives', 'Agra', 'Delhi',
    'Mumbai', 'Bengaluru', 'Bangalore', 'Kolkata', 'Hyderabad', 'Varanasi', 'Udaipur', 'Shimla', 'Manali',
    'Kerala', 'Ooty', 'Kodaikanal', 'Munnar', 'Hampi', 'Rishikesh', 'Darjeeling', 'Ladakh', 'Leh',
    'Dubai', 'Singapore', 'London', 'Rome', 'Barcelona', 'Amsterdam', 'Tokyo', 'Bangkok',
    'Sydney', 'Melbourne', 'Cape Town', 'Istanbul', 'Venice', 'Florence', 'Vienna',
    'Chengalpattu', 'Kanchipuram', 'Madurai', 'Mysore', 'Coimbatore', 'Kochi', 'Varkala',
    'Zurich', 'Geneva', 'Berlin', 'Munich', 'Madrid', 'Lisbon', 'Athens', 'Oslo', 'Stockholm',
    'Helsinki', 'Copenhagen', 'Auckland', 'Queenstown', 'Vancouver', 'Toronto', 'Montreal',
    'San Francisco', 'Los Angeles', 'Chicago', 'Miami', 'Honolulu', 'Havana', 'Cancun',
    'Buenos Aires', 'Rio de Janeiro', 'Edinburgh', 'Dublin', 'Dubrovnik', 'Split', 'Nice'
]

GENERIC_WORDS = {
    'trip', 'tour', 'vacation', 'holiday', 'getaway', 'expedition', 'journey', 'break',
    'heritage', 'culture', 'beaches', 'beach', 'mountain', 'mountains', 'nature', 'adventure',
    'food', 'wildlife', 'relax', 'relaxation', 'luxury', 'budget', 'couple', 'solo', 'family',
    'friends', 'days', 'day', 'night', 'nights', 'weekend', 'india', 'world', 'asia', 'europe',
    'somewhere', 'anywhere', 'place', 'places', 'destination', 'destinations'
}

VALID_DESTINATION_TYPES = {
    'city', 'town', 'administrative', 'island', 'archipelago',
    'national_park', 'protected_area', 'tourism', 'historic',
    'state', 'province', 'country', 'region', 'village', 'municipality'
}

def extract_destination_candidate(prompt: str) -> str:
    """
    Extracts the targeted geographic destination candidate from a natural language travel prompt.
    E.g. '3 days couple trip to Parth focusing on heritage and culture under 35000' -> 'Parth'
    """
    if not prompt:
        return None

    text = prompt.strip()
    # Remove duration (e.g. '3 days', '4 nights')
    text = re.sub(r'\b\d+\s*(?:days?|d|nights?)\b', '', text, flags=re.I)
    # Remove budget values
    text = re.sub(
        r'(?:for|under|budget|around|with|approx|rs\.?|₹|\$|inr)\s*\d[\d,]*\s*(?:k|lakh|lac|thousand|l)?\b',
        '',
        text,
        flags=re.I
    )
    text = re.sub(r'\b\d{4,7}\b', '', text)

    # 1. Target immediately after 'trip to', 'travel to', 'visit', 'explore', 'vacation to'
    m = re.search(
        r'\b(?:trip|travel|tour|vacation|getaway|holiday|visit|going|head)\s+to\s+([A-Za-z0-9\s]+?)(?=\s+(?:focusing|focused|centering|centered|with|for|under|around|approx|and|near|featuring|during)\b|\s*$|\s*[,;])',
        text,
        re.I
    )
    if not m:
        m = re.search(
            r'\b(?:in|at|explore|visit)\s+([A-Za-z0-9\s]+?)(?=\s+(?:focusing|focused|centering|centered|with|for|under|around|approx|and|near|featuring|during)\b|\s*$|\s*[,;])',
            text,
            re.I
        )
    if not m:
        m = re.search(r'\bto\s+([A-Za-z0-9\s]+?)(?=\s+(?:focusing|focused|with|for|under)\b|\s*$)', text, re.I)

    if m:
        candidate = m.group(1).strip()
        candidate = re.sub(r'\b(couple|solo|family|friends|group|honeymoon|romantic|luxury|budget)\b', '', candidate, flags=re.I).strip()
        if len(candidate) > 1 and candidate.lower() not in GENERIC_WORDS:
            return candidate

    return None

def verify_travel_destination(candidate: str) -> dict:
    """
    Validates whether a candidate string corresponds to a real, verifiable travel destination or city.
    Uses Google Maps Geocoding API if key is available, falls back to OpenStreetMap Nominatim.
    Returns:
      {'is_valid': True, 'candidate': 'Perth', 'resolved_name': 'Perth, Western Australia'}
      or
      {'is_valid': False, 'candidate': 'Parth', 'error': '...', 'suggestions': ['Perth', 'Porto', 'Paris']}
    """
    if not candidate:
        return {'is_valid': True, 'candidate': None}

    clean = candidate.strip()
    clean_lower = clean.lower()

    # 1. Instant match in verified popular catalog
    for d in POPULAR_DESTINATIONS:
        if d.lower() == clean_lower:
            return {
                'is_valid': True,
                'candidate': d,
                'resolved_name': d,
                'source': 'verified_catalog'
            }

    # 2. Google Maps Geocoding API (if GOOGLE_MAPS_API_KEY is configured in .env)
    api_key = os.getenv('GOOGLE_MAPS_API_KEY')
    if api_key:
        try:
            url = f"https://maps.googleapis.com/maps/api/geocode/json?address={urllib.parse.quote(clean)}&key={api_key}"
            res = requests.get(url, timeout=3).json()
            if res.get('status') == 'OK' and res.get('results'):
                top = res['results'][0]
                types = set(top.get('types', []))
                valid_types = {
                    'locality', 'administrative_area_level_1', 'administrative_area_level_2',
                    'country', 'natural_feature', 'colloquial_area', 'sublocality', 'archipelago'
                }
                if types.intersection(valid_types):
                    return {
                        'is_valid': True,
                        'candidate': clean,
                        'resolved_name': top.get('formatted_address', clean.title()),
                        'source': 'google_maps'
                    }
        except Exception:
            pass

    # 3. OpenStreetMap Nominatim Geocoding Verification
    try:
        url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(clean)}&format=json&addressdetails=1&limit=5"
        headers = {"User-Agent": "VoyageAITravelApp/1.0 (contact@voyageai.local)"}
        res = requests.get(url, headers=headers, timeout=4).json()
        if res and isinstance(res, list):
            for item in res:
                p_type = item.get('type', '').lower()
                p_class = item.get('class', '').lower()
                add_type = item.get('addresstype', '').lower()

                # Filter out rejected types (residential plots, streets, house numbers)
                if p_type in {'plot', 'house', 'commercial', 'residential', 'road'}:
                    continue

                if p_type in VALID_DESTINATION_TYPES or add_type in VALID_DESTINATION_TYPES:
                    disp_name = item.get('display_name', '')
                    parts = [p.strip() for p in disp_name.split(',')]
                    short_name = parts[0] if parts else clean.title()
                    country = parts[-1] if len(parts) > 1 else ''
                    full_label = f"{short_name}, {country}" if country else short_name
                    return {
                        'is_valid': True,
                        'candidate': clean,
                        'resolved_name': full_label,
                        'source': 'osm_geocoding'
                    }
    except Exception as e:
        print(f"Location verification error for '{clean}':", e)

    # 4. If invalid / not found, find closest spelling matches
    matches = difflib.get_close_matches(clean.title(), POPULAR_DESTINATIONS, n=3, cutoff=0.45)
    return {
        'is_valid': False,
        'candidate': clean,
        'error': f"Location '{clean}' was not detected as an existing city or travel destination on Google Maps.",
        'suggestions': matches or ['Perth', 'Paris', 'Jaipur']
    }
