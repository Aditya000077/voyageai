import random
import uuid
import re
from .photo_engine import get_place_photo as _photo_lookup
from .llm_client import call_llm
from .geo_verifier import extract_destination_candidate

def parse_user_preferences(prompt: str, user_city: str = None) -> dict:
    """
    Parses explicit user preferences from natural language prompts:
    - Requested days (e.g. '2 days', '3d')
    - Requested budget (e.g. '25,000', '25k', '2 lakh')
    - Traveler type (solo, couple, family, friends)
    - Budget tier (budget, moderate, premium, luxury)
    - Travel style (culture, nature, adventure, relaxed, food)
    - Proximity intent ('nearest', 'nearby', 'closest')
    - Clean city string
    """
    text = prompt.strip()
    lower = text.lower()

    # 1. Parse Duration (Days)
    days_match = re.search(r'\b(\d+)\s*(?:days?|d|nights?)\b', text, re.I)
    days = int(days_match.group(1)) if days_match else None

    # Remove days substring to prevent regex conflict with budget
    text_no_days = re.sub(r'\b\d+\s*(?:days?|d|nights?)\b', '', text, flags=re.I)

    # 2. Parse Budget
    budget_val = None
    b_match = re.search(
        r'(?:for|under|budget|around|with|approx|rs\.?|₹|\$|inr)\s*(\d[\d,]*\s*(?:k|lakh|lac|thousand|l)?)\b',
        text_no_days,
        re.I,
    )
    if not b_match:
        b_match = re.search(r'(\d[\d,]*\s*(?:k|lakh|lac|thousand))\b', text_no_days, re.I)
    if not b_match:
        b_match = re.search(r'(?:rs\.?|₹|\$)\s*(\d[\d,]*)\b', text_no_days, re.I)
    if not b_match:
        b_match = re.search(r'\b(\d{4,7})\b', text_no_days)

    if b_match:
        val_str = b_match.group(1).lower().replace(',', '').strip()
        try:
            if 'k' in val_str:
                budget_val = int(float(val_str.replace('k', '')) * 1000)
            elif 'lakh' in val_str or 'lac' in val_str:
                budget_val = int(float(val_str.replace('lakh', '').replace('lac', '')) * 100000)
            else:
                num = int(val_str)
                if num >= 500:
                    budget_val = num
        except Exception:
            pass

    # 3. Parse Traveler Type
    traveler_type = None
    if re.search(r'\b(solo|alone|myself|single)\b', lower):
        traveler_type = 'solo'
    elif re.search(r'\b(couple|romantic|honeymoon|partner|wife|husband|two of us)\b', lower):
        traveler_type = 'couple'
    elif re.search(r'\b(family|kids|children|parents)\b', lower):
        traveler_type = 'family'
    elif re.search(r'\b(friends|group|buddies|squad|gang)\b', lower):
        traveler_type = 'friends'

    # 4. Parse Budget Tier
    budget_tier = None
    if budget_val:
        if budget_val <= 15000:
            budget_tier = 'budget'
        elif budget_val <= 45000:
            budget_tier = 'moderate'
        elif budget_val <= 100000:
            budget_tier = 'premium'
        else:
            budget_tier = 'luxury'
    else:
        if re.search(r'\b(cheap|budget|hostel|backpacking|economical|affordable)\b', lower):
            budget_tier = 'budget'
        elif re.search(r'\b(luxury|5 star|palace|first class|deluxe)\b', lower):
            budget_tier = 'luxury'
        elif re.search(r'\b(premium|comfort|4 star)\b', lower):
            budget_tier = 'premium'
        else:
            budget_tier = 'moderate'

    # 5. Parse Travel Style
    travel_style = None
    if re.search(r'\b(heritage|culture|temple|history|monument)\b', lower):
        travel_style = 'culture'
    elif re.search(r'\b(nature|scenic|mountain|hill|lake|green)\b', lower):
        travel_style = 'nature'
    elif re.search(r'\b(adventure|trek|hike|hiking|safari|wild)\b', lower):
        travel_style = 'adventure'
    elif re.search(r'\b(food|cuisine|culinary|street food|nightlife)\b', lower):
        travel_style = 'food'
    elif re.search(r'\b(relax|chill|peaceful|leisure|beach)\b', lower):
        travel_style = 'relaxed'

    # 6. Detect Proximity / Nearest Intent
    is_nearest = bool(re.search(r'\b(nearest|nearby|closest|near me|local|around me)\b', prompt, re.I))

    # 7. Extract Clean Destination String
    cand = extract_destination_candidate(prompt)
    if cand:
        clean = cand
    else:
        clean = text_no_days
        clean = re.sub(
            r'(?:for|under|budget|around|with|approx|rs\.?|₹|\$|inr)?\s*\d[\d,]*\s*(?:k|lakh|lac|thousand|l)?\b',
            '',
            clean,
            flags=re.I,
        )
        clean = re.sub(
            r'\b(for|in|to|at|trip|tour|days?|nights?|under|budget|luxury|planner|ai|expedition|visit|see|explore|nearest|nearby|closest|near me|solo|couple|family|friends|romantic|honeymoon|focusing|focused|centering|centered|heritage|culture|and|with)\b',
            ' ',
            clean,
            flags=re.I,
        )
        clean = re.sub(r'\s+', ' ', clean).strip()

    return {
        'clean_city': clean or (user_city if is_nearest else None),
        'parsed_days': days,
        'parsed_budget': budget_val,
        'traveler_type': traveler_type,
        'budget_tier': budget_tier,
        'travel_style': travel_style,
        'is_nearest': is_nearest,
    }


def generate_ai_itinerary(
    prompt: str,
    user_lat: float = None,
    user_lng: float = None,
    user_city: str = None,
    traveler_type: str = None,
    budget_tier: str = None,
    travel_style: str = None,
    days: int = None,
    budget: int = None
) -> dict:
    """
    VoyageAI Autonomous Travel Engine — crafts realistic, authentic travel itineraries worldwide.
    Tailored to traveler group type (solo/couple/family/friends), budget tier, and duration.
    """
    lower_prompt = prompt.lower()
    prefs = parse_user_preferences(prompt, user_city=user_city)

    # Determine targeted parameters
    final_traveler_type = traveler_type or prefs.get('traveler_type') or 'couple'
    final_budget_tier = budget_tier or prefs.get('budget_tier') or 'moderate'
    final_travel_style = travel_style or prefs.get('travel_style') or 'culture'

    target_days = days or prefs['parsed_days'] or (2 if '2' in lower_prompt else 3)
    target_days = max(1, min(14, int(target_days)))

    explicit_budget = budget or prefs['parsed_budget']
    custom_budget_str = f"₹{explicit_budget:,}" if explicit_budget else None

    # ─────────────────────────────────────────────────────────────────────────
    # 🌟 REAL LLM PROVIDER CHECK (Gemini / OpenAI / Groq)
    # ─────────────────────────────────────────────────────────────────────────
    llm_resp = call_llm(
        prompt,
        target_days=target_days,
        user_city=user_city,
        traveler_type=final_traveler_type,
        budget_tier=final_budget_tier,
        travel_style=final_travel_style
    )
    if llm_resp and isinstance(llm_resp, dict) and llm_resp.get('days'):
        llm_dest = llm_resp.get('destination', prompt.title())
        llm_days = []
        raw_days = llm_resp.get('days', [])

        default_stay = "3-Star Boutique Hotel"
        if final_budget_tier == 'budget':
            default_stay = "Boutique Hostel & Heritage Homestay" if final_traveler_type == 'solo' else "Cozy Heritage Homestay"
        elif final_budget_tier == 'premium':
            default_stay = "4-Star City Hotel & Spa"
        elif final_budget_tier == 'luxury':
            default_stay = "5-Star Heritage Palace / Luxury Resort"

        for idx, d in enumerate(raw_days[:target_days]):
            day_num = d.get('day', idx + 1)
            raw_title = d.get('title', f'Day {day_num} Highlights')
            clean_title = re.sub(r'^Day\s*\d+\s*:\s*', '', raw_title).strip()
            
            m_text = d.get('morning', 'Morning landmark exploration.')
            a_text = d.get('afternoon', 'Afternoon cultural discovery.')
            e_text = d.get('evening', 'Evening dining and local promenade.')

            llm_days.append({
                'day': day_num,
                'title': clean_title,
                'morning': m_text,
                'morning_time': d.get('morning_time', '09:00 AM – 11:30 AM (2.5 hrs)'),
                'morning_duration': d.get('morning_duration', '2.5 hrs'),
                'morning_image': _photo_lookup(place_name=m_text, city=llm_dest, slot='morning'),
                'afternoon': a_text,
                'afternoon_time': d.get('afternoon_time', '01:30 PM – 04:30 PM (3 hrs)'),
                'afternoon_duration': d.get('afternoon_duration', '3 hrs'),
                'afternoon_image': _photo_lookup(place_name=a_text, city=llm_dest, slot='afternoon'),
                'evening': e_text,
                'evening_time': d.get('evening_time', '06:30 PM – 09:00 PM (2.5 hrs)'),
                'evening_duration': d.get('evening_duration', '2.5 hrs'),
                'evening_image': _photo_lookup(place_name=e_text, city=llm_dest, slot='evening'),
                'stay': d.get('stay', default_stay),
            })

        nights = max(1, len(llm_days) - 1)
        base_rate = 9500
        if final_budget_tier == 'budget':
            base_rate = 4000
        elif final_budget_tier == 'premium':
            base_rate = 22000
        elif final_budget_tier == 'luxury':
            base_rate = 45000

        cost_val = llm_resp.get('estimated_cost_inr') or (base_rate * len(llm_days))
        final_cost = custom_budget_str if custom_budget_str else f"₹{cost_val:,}"

        # Group-specific perks
        default_perks = [
            f"24/7 VoyageAI Digital Concierge in {llm_dest}",
            "Curated Local Sightseeing & Hidden Gems Guide",
            "Verified Transport & Navigation Route Pass",
            "Authentic Local Dining & Street Market Recommendations"
        ]
        if final_traveler_type == 'solo':
            default_perks = [
                f"24/7 VoyageAI Solo Safety Assistance in {llm_dest}",
                "Curated Solo-Friendly Cafes & Social Meetup Map",
                "Audio Walking Tour & Public Transit Pass",
                "Local SIM/eSIM Data Connectivity Guide"
            ]
        elif final_traveler_type == 'couple':
            default_perks = [
                "Curated Romantic Sunset & Scenic Viewpoints",
                "Priority Candlelit Dining Reservations",
                "Couple's Landmark Keepsake Photo Spots Guide",
                f"24/7 VoyageAI Concierge in {llm_dest}"
            ]
        elif final_traveler_type == 'family':
            default_perks = [
                "Family Priority Access & Accessible Routes",
                "Kid-Friendly Activities & Dining Directory",
                "Spacious Family Stay Recommendations",
                f"24/7 Family Travel Emergency Support in {llm_dest}"
            ]

        return {
            'id': f"itin-{uuid.uuid4().hex[:8]}",
            'prompt': prompt,
            'destination': llm_dest,
            'duration': f"{len(llm_days)} Days / {nights} {'Night' if nights == 1 else 'Nights'}",
            'estimated_cost': final_cost,
            'ai_match_score': llm_resp.get('ai_match_score', 98),
            'summary': llm_resp.get('summary', f'Personalized {final_traveler_type} itinerary for {llm_dest}.'),
            'days': llm_days,
            'included_perks': llm_resp.get('included_perks', default_perks),
            'llm_provider': llm_resp.get('llm_provider', 'Voyage Neural AI Engine'),
            'traveler_type': final_traveler_type,
            'budget_tier': final_budget_tier,
            'travel_style': final_travel_style,
        }


    # Handle Proximity / Nearest intent
    if prefs['is_nearest']:
        ref_city = user_city or "Chengalpattu"
        destination = f"Chennai & Coromandel Coast, India (Nearest Proximity Hub to {ref_city})"
        summary = f"Optimal nearest luxury retreat (~40 km from {ref_city}) — private Coromandel coastal promenade, UNESCO Shore Temples of Mahabalipuram, and Chettinad fine dining."
        base_cost = 45000
        days_template = [
            {
                'day': 1,
                'title': f'Departure from {ref_city} → Coromandel Coastal Resort',
                'morning': f'Private luxury chauffeur transfer from {ref_city} along the East Coast Road to beachfront resort.',
                'afternoon': 'VIP guided walk through UNESCO World Heritage Shore Temples of Mahabalipuram and Pancha Rathas.',
                'evening': 'Sunset breeze along Marina Beach promenade followed by authentic South Indian Chettinad feast.',
                'stay': 'Taj Fisherman’s Cove Resort & Spa / The Leela Palace Chennai'
            },
            {
                'day': 2,
                'title': 'Mylapore Dravidian Architecture & Heritage Market Walk',
                'morning': 'Private dawn exploration of Kapaleeshwarar Temple in historic Mylapore with traditional filter coffee tasting.',
                'afternoon': 'Visit to San Thome Basilica cathedral and private curator walkthrough of Fort St. George museum.',
                'evening': 'Coastal seafood barbecue dinner at beachfront resort overlooking the Bay of Bengal.',
                'stay': 'The Leela Palace Chennai'
            },
            {
                'day': 3,
                'title': 'Artisan Silk Weaving & Besant Nagar Sunset',
                'morning': 'Private artisan demonstration of Kanchipuram silk weaving and traditional temple handicrafts.',
                'afternoon': 'Relaxation at resort private beach and luxury spa hydrotherapy treatment.',
                'evening': 'Farewell dinner at beachfront fine dining restaurant.',
                'stay': 'The Leela Palace Chennai'
            }
        ]
        perks = [
            f'24/7 Proximity Concierge & Private Chauffeur from {ref_city}',
            'VIP Fast-Track Access to UNESCO Mahabalipuram Shore Temples',
            'Guaranteed Sea-Facing Suite Upgrade & Late Checkout',
            'Complimentary Royal Chettinad Chef Table Dining Experience'
        ]

    # Destination 1: Amritsar
    elif any(k in lower_prompt for k in ['amritsar', 'golden temple', 'wagah', 'punjab', 'jallianwala', 'gobindgarh']):
        destination = 'Amritsar & Golden Temple Sanctuary, India'
        summary = 'Spiritual Heart of Punjab — sacred Golden Temple (Sri Harmandir Sahib) illuminated at dawn, patriotic Wagah Border retreat flag ceremony, Partition Museum, and authentic Punjabi gastronomy.'
        base_cost = 25000
        days_template = [
            {
                'day': 1,
                'title': 'Arrival in Amritsar & Dawn Golden Temple Sanctum',
                'morning': 'Private VIP entrance to the sacred Golden Temple (Sri Harmandir Sahib) during Palki Sahib morning ceremony.',
                'morning_time': '05:00 AM – 09:00 AM (4 hrs)',
                'morning_duration': '4 hrs',
                'morning_image': 'https://images.unsplash.com/photo-1605806616949-1e87b487fc2f?w=800&h=600&fit=crop&auto=format',
                'afternoon': 'Somber walk through Jallianwala Bagh memorial gardens and guided tour of the Town Hall Partition Museum.',
                'afternoon_time': '01:30 PM – 04:30 PM (3 hrs)',
                'afternoon_duration': '3 hrs',
                'afternoon_image': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&h=600&fit=crop&auto=format',
                'evening': 'Authentic Punjabi heritage culinary walk featuring famous stuffed Amritsari kulchas and legendary lassi.',
                'evening_time': '06:30 PM – 09:00 PM (2.5 hrs)',
                'evening_duration': '2.5 hrs',
                'evening_image': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&h=600&fit=crop&auto=format',
                'stay': 'Taj Swarna / Hyatt Regency, Amritsar'
            },
            {
                'day': 2,
                'title': 'Wagah Border Sunset Ceremony & Gobindgarh Fort',
                'morning': 'Exploration of historic 18th-century Gobindgarh Fort and the 7D simulator show of Sikh empire history.',
                'morning_time': '09:30 AM – 12:30 PM (3 hrs)',
                'morning_duration': '3 hrs',
                'morning_image': 'https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=800&h=600&fit=crop&auto=format',
                'afternoon': 'VIP grandstand seating transfer to Wagah Border for the patriotic India-Pakistan Beating Retreat flag ceremony.',
                'afternoon_time': '03:00 PM – 06:30 PM (3.5 hrs)',
                'afternoon_duration': '3.5 hrs',
                'afternoon_image': 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&h=600&fit=crop&auto=format',
                'evening': 'Illuminated night view of Sri Harmandir Sahib reflecting on the Amrit Sarovar holy pool.',
                'evening_time': '07:30 PM – 09:30 PM (2 hrs)',
                'evening_duration': '2 hrs',
                'evening_image': 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&h=600&fit=crop&auto=format',
                'stay': 'Taj Swarna, Amritsar'
            },
            {
                'day': 3,
                'title': 'Ram Bagh Gardens & Heritage Bazaar Artisans',
                'morning': 'Stroll through Maharaja Ranjit Singh’s summer palace at Ram Bagh Gardens and museum.',
                'morning_image': 'https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=800&h=600&fit=crop&auto=format',
                'afternoon': 'Private artisan shopping for hand-embroidered Phulkari dupattas and traditional Punjabi juttis in Hall Bazaar.',
                'afternoon_image': 'https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=800&h=600&fit=crop&auto=format',
                'evening': 'Royal Punjabi farewell dinner hosted at Kesar Da Dhaba.',
                'evening_image': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&h=600&fit=crop&auto=format',
                'stay': 'Taj Swarna, Amritsar'
            }
        ]

        perks = [
            '24/7 AI Punjab Heritage Concierge & Luxury Chauffeur Escort',
            'VIP Grandstand Access at Wagah Border Beating Retreat Ceremony',
            'Special Access & Escort to Golden Temple Sanctum Sanctorum',
            'Complimentary Authentic Amritsari Kulcha & Lassi Tasting Tour'
        ]

    # Destination 2: Jaipur
    elif any(k in lower_prompt for k in ['jaipur', 'pink city', 'hawa mahal', 'hawamehal', 'amer fort', 'jal mahal', 'rajasthan', 'nahargarh']):
        destination = 'Jaipur & Royal Rajasthan Palaces, India'
        summary = 'The Royal Pink City Heritage — private sunrise Hawa Mahal photography, royal ascent to Amer Fort, serene Jal Mahal lake views, and royal heritage dining at Rambagh Palace.'
        base_cost = 185000
        days_template = [
            {
                'day': 1,
                'title': 'Arrival in Pink City & Hawa Mahal Sunrise Architecture',
                'morning': 'Private dawn visit to Hawa Mahal (Palace of Winds) with golden hour photography of the 953 honeycombed jharokha windows.',
                'afternoon': 'VIP private guided tour of City Palace & ancient astronomical instruments of Jantar Mantar.',
                'evening': 'Sunset cocktails and royal Rajasthani welcome feast at 1835 heritage Rambagh Palace.',
                'stay': 'The Oberoi Rajvilas / Rambagh Palace, Jaipur'
            },
            {
                'day': 2,
                'title': 'Amer Fort Royal Majesty & Jal Mahal Lake Promenade',
                'morning': 'Private VIP royal ascent to Amer Fort (Amber Palace), exploring Sheesh Mahal (Mirror Palace) and Maota Lake views.',
                'afternoon': 'Scenic photo stroll along Man Sagar Lake promenade with front-row panoramic views of Jal Mahal floating on water.',
                'evening': 'Panoramic sunset from Padao at Nahargarh Fort overlooking the illuminated Pink City skyline.',
                'stay': 'The Oberoi Rajvilas / Rambagh Palace, Jaipur'
            },
            {
                'day': 3,
                'title': 'Jaigarh Fort Artillery & Johari Bazaar Artisans',
                'morning': 'Exploration of Jaigarh Fort and the world’s largest wheeled cannon Jaivana.',
                'afternoon': 'Private royal gem-cutting & block-printing artisan walk through historic Johari & Bapu Bazaars.',
                'evening': 'Traditional cultural evening and folk dance dinner at Chokhi Dhani ethnic resort.',
                'stay': 'The Oberoi Rajvilas, Jaipur'
            }
        ]
        perks = [
            '24/7 AI Rajasthan Royal Concierge & Luxury Chauffeur Escort',
            'VIP Fast-Track Entry to Amer Fort, City Palace & Hawa Mahal',
            'Guaranteed Suite Upgrade at Rambagh Palace or The Oberoi Rajvilas',
            'Complimentary Royal Rajasthani Thali Dining Experience'
        ]

    # Destination 3: Agra
    elif any(k in lower_prompt for k in ['agra', 'taj mahal', 'tajmehel', 'taj', 'mehtab bagh', 'fatehpur sikri']):
        destination = 'Agra Mughal Heritage & Taj Mahal Wonder, India'
        summary = 'Eternal Mughal Majesty — VIP sunrise entrance to the Taj Mahal, private curator walk through Agra Fort, and romantic twilight sunset views from Mehtab Bagh over the Yamuna River.'
        base_cost = 145000
        days_template = [
            {
                'day': 1,
                'title': 'Arrival in Agra & Sunset Taj Reflection at Mehtab Bagh',
                'morning': 'Private chauffeur transfer from Delhi / arrival in Agra via Yamuna Expressway.',
                'afternoon': 'VIP check-in at The Oberoi Amarvilas with uninterrupted views of the Taj Mahal dome.',
                'evening': 'Sunset stroll in Mehtab Bagh capturing the Taj Mahal glowing amber across the Yamuna River.',
                'stay': 'The Oberoi Amarvilas, Agra'
            },
            {
                'day': 2,
                'title': 'Private Dawn Taj Mahal Wonder & Agra Fort Expedition',
                'morning': 'Exclusive dawn VIP entrance to the Taj Mahal before public opening, admiring white marble changing hues.',
                'afternoon': 'Guided historical exploration of the imposing Agra Fort (Red Fort of Agra) and Musamman Burj.',
                'evening': 'Royal Mughlai chef table dinner with live sitar performance on Amarvilas poolside terrace.',
                'stay': 'The Oberoi Amarvilas, Agra'
            },
            {
                'day': 3,
                'title': 'Fatehpur Sikri Imperial Ghost City & Marble Inlay Art',
                'morning': 'Private excursion to Emperor Akbar’s UNESCO ghost capital of Fatehpur Sikri and Buland Darwaza.',
                'afternoon': 'Master artisan demonstration of Pietra Dura marble inlay crafting (traditional Taj Mahal craftsmanship).',
                'evening': 'Return executive chauffeur transfer or luxury evening rail.',
                'stay': 'The Oberoi Amarvilas, Agra'
            }
        ]
        perks = [
            'Private VIP Fast-Track Sunrise Entry to Taj Mahal Included',
            'Overnight 5-Star Suite at The Oberoi Amarvilas with Direct Taj Views',
            'Certified Senior Archeological Survey of India Historian Guide',
            'Private Climate-Controlled Luxury Chauffeur Throughout Agra'
        ]

    # Destination 4: Chennai
    elif any(k in lower_prompt for k in ['chennai', 'madras', 'kapaleeshwarar', 'marina beach', 'mahabalipuram', 'mylapore', 'san thome']):
        destination = 'Chennai Heritage & Coromandel Coast, India'
        summary = 'Coromandel Coastal Splendour — private sunrise walk along Marina Beach, sacred Dravidian architecture at Kapaleeshwarar Temple in Mylapore, historic Fort St. George, and UNESCO Shore Temples of Mahabalipuram.'
        base_cost = 45000
        days_template = [
            {
                'day': 1,
                'title': 'Arrival in Chennai & Mylapore Dravidian Heritage',
                'morning': 'Private dawn exploration of Kapaleeshwarar Temple with rainbow gopuram & sacred temple tank in historic Mylapore.',
                'morning_time': '07:00 AM – 09:30 AM (2.5 hrs)',
                'morning_duration': '2.5 hrs',
                'morning_image': 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&h=600&fit=crop&auto=format',
                'afternoon': 'Guided walk through the vibrant Mylapore area, visiting San Thome Basilica built near the historic burial site of St. Thomas and the old fishing village of Santhome.',
                'afternoon_time': '01:30 PM – 04:30 PM (3 hrs)',
                'afternoon_duration': '3 hrs',
                'afternoon_image': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop&auto=format',
                'evening': 'Sunset breeze along Marina Beach promenade followed by authentic South Indian Chettinad feast with filter coffee.',
                'evening_time': '05:30 PM – 08:30 PM (3 hrs)',
                'evening_duration': '3 hrs',
                'evening_image': 'https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?w=800&h=600&fit=crop&auto=format',
                'stay': 'The Leela Palace Chennai / Taj Coromandel'
            },
            {
                'day': 2,
                'title': 'UNESCO Mahabalipuram Shore Temples & Pancha Rathas',
                'morning': 'Scenic coastal drive down East Coast Road to UNESCO World Heritage Shore Temple of Mahabalipuram.',
                'morning_time': '08:00 AM – 11:00 AM (3 hrs)',
                'morning_duration': '3 hrs',
                'morning_image': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&h=600&fit=crop&auto=format',
                'afternoon': 'Guided exploration of monolithic 7th-century Pancha Rathas rock-cut sanctuaries and Arjuna Penance bas-relief.',
                'afternoon_time': '12:00 PM – 03:30 PM (3.5 hrs)',
                'afternoon_duration': '3.5 hrs',
                'afternoon_image': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format',
                'evening': 'Fresh coastal seafood barbecue dinner at beachfront resort overlooking the Coromandel coast.',
                'evening_time': '06:30 PM – 09:00 PM (2.5 hrs)',
                'evening_duration': '2.5 hrs',
                'evening_image': 'https://images.unsplash.com/photo-1511108690759-009324a90311?w=800&h=600&fit=crop&auto=format',
                'stay': "Taj Fisherman's Cove Resort & Spa / The Leela Palace Chennai"
            },
            {
                'day': 3,
                'title': 'Fort St. George & South Indian Culinary Treasures',
                'morning': 'Private tour of Fort St. George (1644) and St. Mary\'s Church, the oldest surviving Anglican church in India.',
                'morning_time': '08:30 AM – 11:00 AM (2.5 hrs)',
                'morning_duration': '2.5 hrs',
                'morning_image': 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800&h=600&fit=crop&auto=format',
                'afternoon': 'Private curator walkthrough of Government Museum & National Art Gallery Bronze Gallery with rare Chola period bronzes.',
                'afternoon_time': '12:00 PM – 03:00 PM (3 hrs)',
                'afternoon_duration': '3 hrs',
                'afternoon_image': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop&auto=format',
                'evening': 'Sunset stroll along Besant Nagar (Elliot\'s Beach) and authentic South Indian dosa & seafood coastal dining.',
                'evening_time': '05:30 PM – 08:30 PM (3 hrs)',
                'evening_duration': '3 hrs',
                'evening_image': 'https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?w=800&h=600&fit=crop&auto=format',
                'stay': 'The Leela Palace Chennai'
            }
        ]
        perks = [
            '24/7 AI Coromandel Concierge & Private Coastal Chauffeur',
            'VIP Fast-Track Access to UNESCO Mahabalipuram & Archeological Sites',
            'Guaranteed Sea-Facing Suite Upgrade at The Leela Palace Chennai',
            'Curated Chef\'s Table Chettinad Royal Feast & Madras Filter Coffee Tasting'
        ]

    # Destination 5: Mumbai
    elif any(k in lower_prompt for k in ['mumbai', 'bombay', 'gateway of india', 'marine drive', 'elephanta', 'colaba']):
        destination = 'Mumbai Coastal Glamour & Heritage, India'
        summary = 'The City of Dreams — private dawn yacht sail past Gateway of India, heritage art walk in Colaba, rock-cut UNESCO Elephanta Caves, and golden sunset along Marine Drive Queens Necklace.'
        base_cost = 75000
        days_template = [
            {
                'day': 1,
                'title': 'Arrival in Mumbai & Gateway of India Stroll',
                'morning': 'Private sunrise walking tour of Gateway of India and the iconic Taj Mahal Palace heritage precinct in Colaba.',
                'morning_time': '08:00 AM – 10:30 AM (2.5 hrs)',
                'morning_duration': '2.5 hrs',
                'morning_image': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=600&fit=crop&auto=format',
                'afternoon': 'Private luxury ferry excursion across Mumbai harbour to UNESCO World Heritage Elephanta rock-cut cave temples.',
                'afternoon_time': '12:30 PM – 04:30 PM (4 hrs)',
                'afternoon_duration': '4 hrs',
                'afternoon_image': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop&auto=format',
                'evening': 'Scenic evening promenade along Marine Drive witnessing the illuminated Queen’s Necklace curve.',
                'evening_time': '06:00 PM – 08:30 PM (2.5 hrs)',
                'evening_duration': '2.5 hrs',
                'evening_image': 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&h=600&fit=crop&auto=format',
                'stay': 'The Taj Mahal Palace, Mumbai'
            },
            {
                'day': 2,
                'title': 'Colonial Heritage, Bandra & Sea Link Cruise',
                'morning': 'Guided architecture walk of Chhatrapati Shivaji Terminus (CSMT) and Victorian Gothic landmarks.',
                'morning_time': '09:00 AM – 11:30 AM (2.5 hrs)',
                'morning_duration': '2.5 hrs',
                'morning_image': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=600&fit=crop&auto=format',
                'afternoon': 'Chauffeur drive over the architectural wonder Bandra-Worli Sea Link to historic Bandra and Portuguese churches.',
                'afternoon_time': '01:30 PM – 04:30 PM (3 hrs)',
                'afternoon_duration': '3 hrs',
                'afternoon_image': 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&h=600&fit=crop&auto=format',
                'evening': 'Gourmet coastal seafood dinner at Wasabi by Morimoto inside The Taj Mahal Palace.',
                'evening_time': '07:00 PM – 09:30 PM (2.5 hrs)',
                'evening_duration': '2.5 hrs',
                'evening_image': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=600&fit=crop&auto=format',
                'stay': 'The Taj Mahal Palace, Mumbai'
            }
        ]
        perks = [
            '24/7 AI Mumbai Royal Concierge & Luxury Chauffeur Transfer',
            'Private Harbor Yacht Charter & Elephanta VIP Speedboat Ferry',
            'Sea-Facing Heritage Wing Suite at The Taj Mahal Palace',
            'Complimentary Chef Table Coastal Feast & Sunset High Tea'
        ]

    # Destination 6: Delhi
    elif any(k in lower_prompt for k in ['delhi', 'new delhi', 'india gate', 'red fort', 'qutub minar', 'humayun', 'lotus temple']):
        destination = 'Delhi Imperial Capital & Monuments, India'
        summary = 'The Capital Tapestry — private sunrise walk at India Gate along Kartavya Path, Mughal wonder of Humayun’s Tomb, towering 12th-century Qutub Minar, and historic Old Delhi rickshaw culinary journey.'
        base_cost = 65000
        days_template = [
            {
                'day': 1,
                'title': 'Arrival in Delhi & India Gate Sunrise Heritage',
                'morning': 'Dawn stroll along Kartavya Path to India Gate and the National War Memorial with golden hour light.',
                'morning_time': '07:30 AM – 10:00 AM (2.5 hrs)',
                'morning_duration': '2.5 hrs',
                'morning_image': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop&auto=format',
                'afternoon': 'Curator-guided exploration of UNESCO World Heritage Humayun’s Tomb and Sundar Nursery gardens.',
                'afternoon_time': '01:30 PM – 04:30 PM (3 hrs)',
                'afternoon_duration': '3 hrs',
                'afternoon_image': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop&auto=format',
                'evening': 'Private chef table Mughlai feast featuring fragrant Old Delhi biryanis and kebabs.',
                'evening_time': '06:30 PM – 09:00 PM (2.5 hrs)',
                'evening_duration': '2.5 hrs',
                'evening_image': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop&auto=format',
                'stay': 'The Imperial New Delhi / The Leela Palace New Delhi'
            },
            {
                'day': 2,
                'title': 'Qutub Minar Marvel & Old Delhi Spice Odyssey',
                'morning': 'Exclusive early morning visit to the 73-meter Qutub Minar and ancient 4th-century iron pillar.',
                'morning_time': '09:00 AM – 11:30 AM (2.5 hrs)',
                'morning_duration': '2.5 hrs',
                'morning_image': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop&auto=format',
                'afternoon': 'Guided private cycle-rickshaw safari through Chandni Chowk, Jama Masjid, and Khari Baoli spice market.',
                'afternoon_time': '01:30 PM – 04:30 PM (3 hrs)',
                'afternoon_duration': '3 hrs',
                'afternoon_image': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop&auto=format',
                'evening': 'Peaceful meditation and twilight illumination at the architectural masterpiece Lotus Temple.',
                'evening_time': '05:30 PM – 07:30 PM (2 hrs)',
                'evening_duration': '2 hrs',
                'evening_image': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop&auto=format',
                'stay': 'The Imperial New Delhi'
            }
        ]
        perks = [
            '24/7 AI Delhi Concierge & Private Executive Mercedes Chauffeur',
            'VIP Fast-Track Access to Humayun Tomb, Qutub Minar & Red Fort',
            'Luxury Heritage Suite Upgrade at The Imperial New Delhi',
            'Old Delhi Culinary Tasting Safari Guided by Culinary Historian'
        ]

    # Destination 7: Kyoto
    elif any(k in lower_prompt for k in ['kyoto', 'japan', 'tokyo', 'ryokan', 'bamboo', 'gion', 'geisha', 'sake', 'onsen', 'nara']):
        destination = 'Kyoto & Nara Imperial Sanctuary, Japan'
        summary = 'Imperial Japanese Sanctuary — stay in historic luxury wooden ryokans, private dawn bamboo grove walk in Arashiyama, master tea ceremony in Gion, and 3-star Michelin kaiseki dining.'
        base_cost = 325000
        days_template = [
            {
                'day': 1,
                'title': 'Arrival in Osaka Kansai (KIX) → Kyoto Imperial Resort',
                'morning': 'First-class Shinkansen bullet train transfer from KIX Airport to Kyoto.',
                'afternoon': 'Check-in at Hoshinoya Kyoto with private riverboat entrance along the Hozu River.',
                'evening': 'Welcome 9-course Kaiseki dinner crafted by Michelin-starred Master Chef.',
                'stay': 'Hoshinoya Kyoto'
            },
            {
                'day': 2,
                'title': 'Arashiyama Bamboo Grove & Tenryu-ji Zen Gardens',
                'morning': 'Private dawn entrance to Arashiyama Bamboo Grove before public opening.',
                'afternoon': 'VIP guided walk through UNESCO World Heritage Tenryu-ji Zen gardens.',
                'evening': 'Traditional Matcha Tea Ceremony hosted by 15th-generation Tea Master.',
                'stay': 'Hoshinoya Kyoto'
            },
            {
                'day': 3,
                'title': 'Gion Geisha Quarter & Fushimi Inari Torii Gates',
                'morning': 'Private walking tour of historic Gion preservation district.',
                'afternoon': 'VIP access to Fushimi Inari Shrine inner mountain trail.',
                'evening': 'Private dinner performance with authentic Kyoto Geiko & Maiko.',
                'stay': 'Aman Kyoto'
            },
            {
                'day': 4,
                'title': 'Nara Deer Park Excursion & Thermal Onsen Detox',
                'morning': 'Chauffeur transfer to Nara Park & Kasuga Taisha Grand Shrine.',
                'afternoon': 'Onsen mineral hot spring therapy & aromatherapy wellness treatment.',
                'evening': 'Sake pairing dinner with master brewer from Fushimi Sake District.',
                'stay': 'Aman Kyoto'
            }
        ]
        perks = [
            '24/7 AI Multi-Lingual Japanese Concierge & Transport Booking',
            'Private Riverboat Escort & Luxury Ryokan Suite Upgrade',
            'Exclusive After-Hours Shrine Access & Tea Ceremony',
            'First-Class Shinkansen & Chauffeur Transfers Throughout Japan'
        ]

    # Destination 6: Swiss Alps
    elif any(k in lower_prompt for k in ['alps', 'swiss', 'zermatt', 'switzerland', 'ski', 'matterhorn', 'glacier', 'st. moritz']):
        destination = 'Zermatt & Swiss Alps Alpine Sanctuary, Switzerland'
        summary = 'Iconic Alpine Luxury — car-free village chalet stay with Matterhorn view, heli-skiing with certified mountain guide, Glacier Express Excellence Class train journey, and alpine thermal spa detox.'
        base_cost = 475000
        days_template = [
            {
                'day': 1,
                'title': 'Arrival in Zurich (ZRH) → Zermatt Alpine Chalet',
                'morning': 'First-Class Swiss Travel Pass train journey along Lake Geneva to Zermatt.',
                'afternoon': 'Check-in at The Omnia Zermatt overlooking the iconic Matterhorn peak.',
                'evening': 'Fireside Swiss cheese fondue & alpine wine tasting session.',
                'stay': 'The Omnia Zermatt'
            },
            {
                'day': 2,
                'title': 'Matterhorn Glacier & Heli-Skiing Expedition',
                'morning': 'Private helicopter flight & guided ski descent across pristine powder snow.',
                'afternoon': 'Lunch at Chez Vrony high-altitude gourmet mountain restaurant.',
                'evening': 'Alpine thermal sauna & hydrotherapy recovery session.',
                'stay': 'The Omnia Zermatt'
            },
            {
                'day': 3,
                'title': 'Glacier Express Excellence Class to St. Moritz',
                'morning': 'Board the world-famous Glacier Express train in Excellence Class with panoramic views.',
                'afternoon': '5-course culinary menu with champagne pairing as train crosses 291 bridges.',
                'evening': 'Arrival in St. Moritz & check-in at Badrutt’s Palace Hotel.',
                'stay': 'Badrutt’s Palace Hotel, St. Moritz'
            }
        ]
        perks = [
            'Glacier Express Excellence Class Panorama Seats Guaranteed',
            'Private Heli-Skiing & Certified Alpine Guide',
            'Unlimited Swiss Rail & Mountain Cable Car Pass',
            '5-Star Alpine Thermal Spa Access & Daily Hydrotherapy'
        ]

    # Dynamic Fallback for ANY city / prompt specified by user
    else:
        city_input = prefs['clean_city'] or (prompt.title() if len(prompt) > 2 else "Global Sanctuary")
        destination = f"{city_input.title()} Discovery & Highlights"
        tier_desc = "budget-friendly" if final_budget_tier == 'budget' else "comfortable" if final_budget_tier == 'moderate' else "premium"
        summary = f"Curated {tier_desc} travel itinerary for {city_input.title()} tailored for {final_traveler_type} travelers. Highlights top landmarks, cultural discovery, and authentic regional culinary experiences."
        base_cost = 4000 * target_days if final_budget_tier == 'budget' else 12000 * target_days if final_budget_tier == 'moderate' else 25000 * target_days if final_budget_tier == 'premium' else 45000 * target_days
        days_template = [
            {
                'day': 1,
                'title': f'Arrival in {city_input.title()} – Historic Center & Culture',
                'morning': f'Arrival in {city_input.title()} with check-in at accommodation and orientation walk.',
                'afternoon': f'Guided walkthrough of {city_input.title()}’s historic quarters, iconic monuments, and central square.',
                'evening': f'Welcome sunset dinner featuring authentic regional culinary specialties of {city_input.title()}.',
                'stay': f'Curated Stay, {city_input.title()}'
            },
            {
                'day': 2,
                'title': f'{city_input.title()} Premier Landmarks & Scenic Views',
                'morning': f'Early morning exploration of top historic landmarks and cultural centers in {city_input.title()}.',
                'afternoon': f'Scenic afternoon tour across {city_input.title()}’s iconic viewpoints, gardens, and waterfront promenades.',
                'evening': f'Evening dining and local culinary experience in {city_input.title()}.',
                'stay': f'Curated Stay, {city_input.title()}'
            },
            {
                'day': 3,
                'title': f'Artisan Heritage & Cultural Treasures of {city_input.title()}',
                'morning': f'Curator-guided exploration of {city_input.title()}’s leading cultural museum and art galleries.',
                'afternoon': f'Artisan workshop visit, local handicraft demonstrations, and traditional market tour in {city_input.title()}.',
                'evening': f'Farewell dinner celebrating the vibrant cultural nightlife of {city_input.title()}.',
                'stay': f'Curated Stay, {city_input.title()}'
            }
        ]
        perks = [
            f'24/7 VoyageAI Concierge & Local Assistance in {city_input.title()}',
            f'Curated Local Guide & Interactive Route Map for {city_input.title()}',
            f'Priority Reservations & Local Dining Directory',
            f'Flexible Day Itinerary Customization in {city_input.title()}'
        ]

    # Build exact requested number of days
    final_days = []
    for idx in range(target_days):
        day_num = idx + 1
        template_day = days_template[idx % len(days_template)]

        # Clean title without double 'Day X:'
        raw_title = template_day.get('title', 'Exploration & Highlights')
        clean_title = re.sub(r'^Day\s*\d+\s*:\s*', '', raw_title).strip()

        # Accommodation adapted to budget tier & group
        stay_val = template_day.get('stay', 'Boutique Hotel & Suites')
        if final_budget_tier == 'budget':
            stay_val = f"Curated Social Hostel & Pods in {destination.split('&')[0].strip()}" if final_traveler_type == 'solo' else f"Cozy Heritage Homestay in {destination.split('&')[0].strip()}"
        elif final_budget_tier == 'moderate':
            stay_val = f"3-Star Boutique Heritage Hotel in {destination.split('&')[0].strip()}"
        elif final_budget_tier == 'premium':
            stay_val = f"4-Star Grand City Hotel & Spa in {destination.split('&')[0].strip()}"

        new_day = {

            'day': day_num,
            'title': clean_title,
            'morning': template_day.get('morning', 'Morning exploration of local landmarks.'),
            'morning_time': template_day.get('morning_time', '09:00 AM – 11:30 AM (2.5 hrs)'),
            'morning_duration': template_day.get('morning_duration', '2.5 hrs'),
            'morning_image': template_day.get('morning_image') or _photo_lookup(place_name=template_day.get('morning', ''), city=destination, slot='morning'),
            'afternoon': template_day.get('afternoon', 'Afternoon cultural discovery and relaxation.'),
            'afternoon_time': template_day.get('afternoon_time', '01:30 PM – 04:30 PM (3 hrs)'),
            'afternoon_duration': template_day.get('afternoon_duration', '3 hrs'),
            'afternoon_image': template_day.get('afternoon_image') or _photo_lookup(place_name=template_day.get('afternoon', ''), city=destination, slot='afternoon'),
            'evening': template_day.get('evening', 'Evening dining and sunset promenade.'),
            'evening_time': template_day.get('evening_time', '06:30 PM – 09:00 PM (2.5 hrs)'),
            'evening_duration': template_day.get('evening_duration', '2.5 hrs'),
            'evening_image': template_day.get('evening_image') or _photo_lookup(place_name=template_day.get('evening', ''), city=destination, slot='evening'),
            'stay': stay_val,
        }

        final_days.append(new_day)

    # Format Duration and Estimated Cost strictly matching user request and budget tier
    nights = max(1, target_days - 1)
    duration = f"{target_days} Days / {nights} {'Night' if nights == 1 else 'Nights'}"

    base_multiplier = 9500
    if final_budget_tier == 'budget':
        base_multiplier = 4000
    elif final_budget_tier == 'premium':
        base_multiplier = 20000
    elif final_budget_tier == 'luxury':
        base_multiplier = 45000

    calc_cost = target_days * base_multiplier
    final_cost = custom_budget_str if custom_budget_str else f"₹{calc_cost:,}"

    # Group-tailored perks
    group_perks = list(perks)
    if final_traveler_type == 'solo':
        group_perks = [
            f"24/7 VoyageAI Solo Safety Assistance in {destination.split('&')[0].strip()}",
            "Curated Solo-Friendly Cafes & Social Meetup Map",
            "Audio Walking Tour & Public Transit Pass",
            "Local SIM/eSIM Data Connectivity Guide"
        ]
    elif final_traveler_type == 'couple':
        group_perks = [
            "Curated Romantic Sunset & Scenic Viewpoints",
            "Priority Candlelit Dining Reservations",
            "Couple's Landmark Keepsake Photo Spots Guide",
            f"24/7 VoyageAI Concierge in {destination.split('&')[0].strip()}"
        ]
    elif final_traveler_type == 'family':
        group_perks = [
            "Family Priority Access & Accessible Routes",
            "Kid-Friendly Activities & Dining Directory",
            "Spacious Family Stay Recommendations",
            f"24/7 Family Travel Emergency Support in {destination.split('&')[0].strip()}"
        ]

    return {
        'id': f"itin-{uuid.uuid4().hex[:8]}",
        'prompt': prompt,
        'destination': destination,
        'duration': duration,
        'estimated_cost': final_cost,
        'ai_match_score': 98,
        'summary': summary,
        'days': final_days,
        'included_perks': group_perks,
        'traveler_type': final_traveler_type,
        'budget_tier': final_budget_tier,
        'travel_style': final_travel_style,
    }

