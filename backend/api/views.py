import random
import uuid
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Destination, Feature, Mission, Testimonial, SavedItinerary
from .serializers import (
    DestinationSerializer,
    FeatureSerializer,
    MissionSerializer,
    TestimonialSerializer,
    SavedItinerarySerializer,
    AIPromptRequestSerializer,
)
from .utils.ai_engine import generate_ai_itinerary
from .utils.geo_service import calculate_haversine_distance, parse_coords_string
from .utils.crowd_engine import get_venue_crowd, generate_crowd_heatmap, predict_crowd_trend
from .utils.route_engine import calculate_routes
from .utils.eta_engine import predict_eta
from .utils.photo_engine import get_place_photo
from .utils.llm_client import chat_with_llm
from .utils.geo_verifier import extract_destination_candidate, verify_travel_destination


class DestinationViewSet(viewsets.ModelViewSet):
    queryset = Destination.objects.all().order_by('-score')
    serializer_class = DestinationSerializer

class DestinationSearchView(APIView):
    """
    GET /api/v1/destinations/search/?q=<city>
    Returns the best-matching destination from the uploaded data.
    Tries exact match first, then partial match on city + country.
    """
    def get(self, request):
        q = request.query_params.get('q', '').strip()
        if not q:
            return Response({'error': 'Query parameter q is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Try to find a match — exact first, then partial on city or country
        words = [w for w in q.split() if len(w) > 2]  # skip tiny words
        qs = Destination.objects.none()
        for word in words:
            qs = qs | Destination.objects.filter(city__icontains=word) | Destination.objects.filter(country__icontains=word)

        # Fallback: whole query string
        if not qs.exists():
            qs = Destination.objects.filter(city__icontains=q) | Destination.objects.filter(country__icontains=q)

        dest = qs.order_by('-score').first()
        if not dest:
            return Response({'found': False, 'detail': f'No destination found for "{q}"'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'found': True, 'destination': DestinationSerializer(dest).data}, status=status.HTTP_200_OK)

class FeatureViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Feature.objects.all()
    serializer_class = FeatureSerializer

class MissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Mission.objects.all()
    serializer_class = MissionSerializer

class TestimonialViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer

class SavedItineraryViewSet(viewsets.ModelViewSet):
    queryset = SavedItinerary.objects.all().order_by('-created_at')
    serializer_class = SavedItinerarySerializer

class LocationView(APIView):
    def post(self, request):
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')

        if latitude is None or longitude is None:
            return Response(
                {'error': 'Both latitude and longitude parameters are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            lat = float(latitude)
            lng = float(longitude)
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid latitude or longitude numeric format'},
                status=status.HTTP_400_BAD_REQUEST
            )

        destinations = Destination.objects.all()
        nearby = []
        for dest in destinations:
            coords = parse_coords_string(dest.coords)
            if coords:
                dest_lat, dest_lng = coords
                dist_km = calculate_haversine_distance(lat, lng, dest_lat, dest_lng)
                serialized = DestinationSerializer(dest).data
                serialized['distance_km'] = round(dist_km, 1)
                nearby.append(serialized)

        nearby.sort(key=lambda x: x['distance_km'])

        return Response({
            'user_latitude': lat,
            'user_longitude': lng,
            'status': 'GPS LOCATION RECORDED',
            'closest_destination': nearby[0] if nearby else None,
            'destinations_count': len(nearby),
            'nearby_destinations': nearby[:5]
        }, status=status.HTTP_200_OK)

class NearbyDestinationsView(APIView):
    def get(self, request):
        try:
            lat = float(request.query_params.get('lat', 19.0760))
            lng = float(request.query_params.get('lng', 72.8777))
        except (ValueError, TypeError):
            lat, lng = 19.0760, 72.8777

        destinations = Destination.objects.all()
        result = []
        for dest in destinations:
            coords = parse_coords_string(dest.coords)
            if coords:
                dest_lat, dest_lng = coords
                dist_km = calculate_haversine_distance(lat, lng, dest_lat, dest_lng)
                serialized = DestinationSerializer(dest).data
                serialized['distance_km'] = round(dist_km, 1)
                result.append(serialized)

        result.sort(key=lambda x: x['distance_km'])
        return Response({
            'gps_center': {'latitude': lat, 'longitude': lng},
            'count': len(result),
            'destinations': result
        })

class AIPlannerView(APIView):
    def post(self, request):
        prompt = request.data.get('prompt', 'Kyoto')
        save_result = request.data.get('save_result', False)
        user_lat = request.data.get('user_latitude')
        user_lng = request.data.get('user_longitude')
        user_city = request.data.get('user_city')
        traveler_type = request.data.get('traveler_type')
        budget_tier = request.data.get('budget_tier')
        travel_style = request.data.get('travel_style')
        days = request.data.get('days')
        budget = request.data.get('budget')

        # ─── Location Verification against Google Maps / Atlas ───
        candidate = extract_destination_candidate(prompt)
        if candidate:
            geo_check = verify_travel_destination(candidate)
            if not geo_check.get('is_valid', True):
                return Response({
                    'error': geo_check.get('error', f"Location '{candidate}' was not detected as an existing travel destination on Google Maps."),
                    'location_not_found': True,
                    'searched_location': candidate,
                    'suggestions': geo_check.get('suggestions', ['Perth', 'Paris', 'Jaipur']),
                }, status=status.HTTP_400_BAD_REQUEST)

        result = generate_ai_itinerary(
            prompt,
            user_lat=user_lat,
            user_lng=user_lng,
            user_city=user_city,
            traveler_type=traveler_type,
            budget_tier=budget_tier,
            travel_style=travel_style,
            days=days,
            budget=budget
        )


        if user_lat is not None and user_lng is not None:
            result['user_gps_context'] = {
                'latitude': user_lat,
                'longitude': user_lng,
                'proximity_optimized': True
            }


        if save_result:
            SavedItinerary.objects.create(
                prompt=prompt,
                destination=result['destination'],
                duration=result['duration'],
                estimated_cost=result['estimated_cost'],
                ai_match_score=result['ai_match_score'],
                summary=result['summary'],
                days_data=result['days'],
                included_perks=result['included_perks']
            )

        return Response(result, status=status.HTTP_200_OK)

class FlightMissionDetailView(APIView):
    def get(self, request, mission_id=None):
        if mission_id:
            mission = Mission.objects.filter(mission_id__iexact=mission_id).first()
            if mission:
                return Response(MissionSerializer(mission).data)

        missions = Mission.objects.all()
        return Response(MissionSerializer(missions, many=True).data)

class CurrencyView(APIView):
    def post(self, request):
        amount = float(request.data.get('amount', 100))
        from_curr = request.data.get('from_currency', 'USD').upper()

        rates = {'USD': 1.0, 'EUR': 0.92, 'GBP': 0.79, 'JPY': 152.4, 'INR': 86.50}
        rate = rates.get(from_curr, 1.0)
        converted = round(amount * rate, 2)

        return Response({
            'source': f"{from_curr} ${amount:,.2f}",
            'rate': f"1 USD = {rate:.2f} {from_curr}",
            'converted': f"{from_curr} {converted:,.2f}",
            'amount_numeric': converted
        })

class SearchHotelsView(APIView):
    def post(self, request):
        city = request.data.get('city', 'Kyoto')
        guests = request.data.get('guests', 2)

        hotels = [
            {'id': 'h-1', 'name': f'Hoshinoya {city}', 'price_per_night': '₹72,000', 'rating': 4.99, 'amenities': ['Private River Escort', 'Kaiseki Dining', 'Onsen']},
            {'id': 'h-2', 'name': f'Aman {city}', 'price_per_night': '₹98,000', 'rating': 4.98, 'amenities': ['Private Garden Suite', 'Spa Pavilion', 'Personal Butler']},
            {'id': 'h-3', 'name': f'The Ritz-Carlton {city}', 'price_per_night': '₹64,000', 'rating': 4.95, 'amenities': ['River Views', 'Michelin Chef Table', 'Tea Ceremony']}
        ]
        return Response({'city': city, 'count': len(hotels), 'hotels': hotels})

class SearchFlightsView(APIView):
    def post(self, request):
        origin = request.data.get('origin', 'JFK')
        destination = request.data.get('destination', 'HND')

        flights = [
            {'flight_no': 'JL 5', 'airline': 'Japan Airlines', 'departure': '11:20 EST', 'arrival': '14:40 JST', 'price': '₹1,25,000', 'cabin': 'First Class Suite'},
            {'flight_no': 'NH 109', 'airline': 'ANA', 'departure': '16:45 EST', 'arrival': '20:10 JST', 'price': '₹1,38,000', 'cabin': 'The Suite Business'},
            {'flight_no': 'BA 6', 'airline': 'British Airways', 'departure': '09:15 GMT', 'arrival': '16:45 UTC', 'price': '₹1,60,000', 'cabin': 'First Class'}
        ]
        return Response({'route': f"{origin} → {destination}", 'count': len(flights), 'flights': flights})

class BookHotelView(APIView):
    def post(self, request):
        hotel_name = request.data.get('hotel_name', 'Hoshinoya Kyoto')
        check_in = request.data.get('check_in', '2026-10-15')
        booking_id = f"BK-HTL-{uuid.uuid4().hex[:6].upper()}"

        return Response({
            'status': 'CONFIRMED',
            'booking_id': booking_id,
            'hotel_name': hotel_name,
            'check_in': check_in,
            'message': f'Global luxury booking confirmed at {hotel_name}. VoyageAI Concierge has pre-checked your arrival.'
        })

class BookFlightView(APIView):
    def post(self, request):
        flight_no = request.data.get('flight_no', 'JL 5')
        passenger = request.data.get('passenger_name', 'Elena Rostova')
        booking_id = f"BK-FLT-{uuid.uuid4().hex[:6].upper()}"

        return Response({
            'status': 'CONFIRMED',
            'booking_id': booking_id,
            'flight_no': flight_no,
            'passenger': passenger,
            'seat': '1A (First Class Suite)',
            'message': f'International flight ticket confirmed for {passenger} on {flight_no}. Added to VoyageAI Wallet.'
        })

class WeatherView(APIView):
    def get(self, request):
        city = request.query_params.get('city', 'Kyoto')
        return Response({
            'city': city,
            'temperature': '19°C',
            'condition': 'Clear & Pleasant',
            'humidity': '42%',
            'best_time_to_visit': 'March – May & October – November',
            'forecast': [
                {'day': 'Today', 'high': '21°C', 'low': '14°C', 'condition': 'Sunny'},
                {'day': 'Tomorrow', 'high': '20°C', 'low': '13°C', 'condition': 'Clear'},
                {'day': 'Day 3', 'high': '22°C', 'low': '15°C', 'condition': 'Mild Breeze'}
            ]
        })

class NearbyPlacesView(APIView):
    def get(self, request):
        location = request.query_params.get('location', 'Kyoto')
        return Response({
            'location': location,
            'places': [
                {'name': 'Arashiyama Bamboo Grove', 'category': 'Nature & Forest', 'distance': '1.2 km', 'rating': 4.99},
                {'name': 'Fushimi Inari Torii Gates', 'category': 'Heritage Shrine', 'distance': '3.4 km', 'rating': 4.98},
                {'name': 'Gion District', 'category': 'Geisha & Dining', 'distance': '0.8 km', 'rating': 4.96},
                {'name': 'Kinkaku-ji Golden Pavilion', 'category': 'Imperial Temple', 'distance': '4.1 km', 'rating': 4.97}
            ]
        })

class CalculateBudgetView(APIView):
    def post(self, request):
        dest = request.data.get('destination', 'Kyoto')
        days = int(request.data.get('days', 6))
        style = request.data.get('style', 'luxury')

        daily_rate = (600 if style == 'luxury' else 300) * 85
        stay_cost = daily_rate * days
        flight_cost = 1200 * 85
        dining_cost = 200 * 85 * days
        total = stay_cost + flight_cost + dining_cost

        return Response({
            'destination': dest,
            'days': days,
            'style': style,
            'breakdown': {
                'stay': f'₹{stay_cost:,}',
                'flights': f'₹{flight_cost:,}',
                'dining_and_activities': f'₹{dining_cost:,}'
            },
            'total_estimated_inr': f'₹{total:,}'
        })

class VisaInformationView(APIView):
    def get(self, request):
        nationality = request.query_params.get('nationality', 'United States')
        return Response({
            'country': 'Japan',
            'passport_nationality': nationality,
            'visa_type': 'Visa Exemption (90 Days Short-Term Tourist)',
            'processing_time': 'Instant / Visa Free',
            'fee': '₹0 (Visa Free)',
            'requirements': [
                'Valid passport with at least 6 months validity',
                'Return air ticket confirmation',
                'Visit Japan Web QR registration'
            ],
            'official_portal': 'https://www.vjw.digital.go.jp/'
        })

class EmergencyContactsView(APIView):
    def get(self, request):
        city = request.query_params.get('city', 'Global')
        return Response({
            'region': city,
            'contacts': [
                {'service': 'International Emergency Number', 'number': '112'},
                {'service': 'Global Tourist Helpline (24x7)', 'number': '+1-800-VOYAGE-AI'},
                {'service': 'Police', 'number': '110'},
                {'service': 'Ambulance & Fire', 'number': '119'},
                {'service': 'VoyageAI 24/7 Concierge Guard', 'number': '+1 800 869 243'}
            ]
        })

class TranslatePhraseView(APIView):
    def post(self, request):
        phrase = request.data.get('phrase', 'Thank you very much')
        target_lang = request.data.get('target_language', 'Japanese').title()

        translations = {
            'thank you': {'Japanese': 'ありがとうございます (Arigatou gozaimasu)', 'French': 'Merci beaucoup', 'Italian': 'Grazie mille'},
            'hello': {'Japanese': 'こんにちは (Konnichiwa)', 'French': 'Bonjour', 'Italian': 'Ciao'},
            'how much': {'Japanese': 'いくらですか? (Ikura desu ka?)', 'French': 'Combien ça coûte?', 'Italian': 'Quanto costa?'}
        }

        low = phrase.lower()
        translated = "ありがとうございます (Arigatou gozaimasu)"
        for k, v in translations.items():
            if k in low:
                translated = v.get(target_lang, v.get('Japanese', 'ありがとうございます'))
                break

        return Response({
            'original': phrase,
            'target_language': target_lang,
            'translation': translated
        })

class HealthCheckView(APIView):
    def get(self, request):
        return Response({
            'status': 'OPERATIONAL',
            'system': 'VoyageAI Django Backend Core',
            'version': '3.2.1',
            'nodes': [
                {'name': 'Neural Route Engine', 'status': 'ONLINE', 'color': '#10B981'},
                {'name': 'Price Oracle', 'status': 'ONLINE', 'color': '#10B981'},
                {'name': 'GPS & Location REST Node', 'status': 'ONLINE', 'color': '#10B981'},
                {'name': 'Flight API', 'status': 'ONLINE', 'color': '#10B981'},
                {'name': 'Concierge AI', 'status': 'ACTIVE', 'color': '#06B6D4'},
            ]
        }, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# SMART NAVIGATION VIEWS
# ─────────────────────────────────────────────────────────────────────────────

class CrowdAnalysisView(APIView):
    """
    POST /api/crowd/
    Body: { lat, lng, destination }
    Returns: crowd heatmap cells + venue crowd status + trend timeline
    """
    def post(self, request):
        lat = float(request.data.get('lat', 19.076))
        lng = float(request.data.get('lng', 72.877))
        destination = request.data.get('destination', 'Kyoto')

        from datetime import datetime
        hour = datetime.utcnow().hour
        day  = datetime.utcnow().weekday()

        venue_status   = get_venue_crowd(destination, hour)
        heatmap_cells  = generate_crowd_heatmap(lat, lng)
        crowd_timeline = predict_crowd_trend(destination)

        return Response({
            'ok': True,
            'venue': venue_status,
            'heatmap': heatmap_cells,
            'timeline': crowd_timeline,
        }, status=status.HTTP_200_OK)

    def get(self, request):
        """Allow quick GET for health-check / browser testing."""
        destination = request.query_params.get('destination', 'Kyoto')
        from datetime import datetime
        hour = datetime.utcnow().hour
        return Response(get_venue_crowd(destination, hour), status=status.HTTP_200_OK)


class RouteComparisonView(APIView):
    """
    POST /api/routes/
    Body: { origin_lat, origin_lng, dest_lat, dest_lng, dest_name }
    Returns: 3 route options with crowd + ETA, plus recommended route
    """
    def post(self, request):
        origin_lat  = float(request.data.get('origin_lat',  19.076))
        origin_lng  = float(request.data.get('origin_lng',  72.877))
        dest_lat    = float(request.data.get('dest_lat',    35.011))
        dest_lng    = float(request.data.get('dest_lng',   135.768))
        dest_name   = request.data.get('dest_name', 'Destination')
        origin_name = request.data.get('origin_name', '')

        result = calculate_routes(origin_lat, origin_lng, dest_lat, dest_lng, dest_name, origin_name)
        return Response({'ok': True, **result}, status=status.HTTP_200_OK)


class ETAPredictionView(APIView):
    """
    POST /api/eta/
    Body: { distance_km, crowd_level, time_of_day, day_of_week, base_speed_kmh, is_long_haul }
    Returns: detailed ETA breakdown with components + advisory
    """
    def post(self, request):
        from datetime import datetime
        distance_km    = float(request.data.get('distance_km', 5842))
        crowd_level    = request.data.get('crowd_level', 'MEDIUM')
        time_of_day    = int(request.data.get('time_of_day',  datetime.utcnow().hour))
        day_of_week    = int(request.data.get('day_of_week',  datetime.utcnow().weekday()))
        base_speed     = float(request.data.get('base_speed_kmh', 870))
        is_long_haul   = bool(request.data.get('is_long_haul', True))
        wait_minutes   = request.data.get('wait_minutes', None)
        if wait_minutes is not None:
            wait_minutes = int(wait_minutes)

        result = predict_eta(
            distance_km=distance_km,
            crowd_level=crowd_level,
            time_of_day=time_of_day,
            day_of_week=day_of_week,
            base_speed_kmh=base_speed,
            wait_minutes=wait_minutes,
            is_long_haul=is_long_haul,
        )
        return Response({'ok': True, **result}, status=status.HTTP_200_OK)


class PlacePhotoView(APIView):
    """
    GET /api/v1/place-photo/?q=<place>&city=<city>&slot=<morning|afternoon|evening>

    Returns a high-quality image URL for any city or landmark worldwide.
    Uses a curated dictionary first, then falls back to Wikipedia API.
    No external API key required.
    """
    def get(self, request):
        place = request.query_params.get('q', '').strip()
        city  = request.query_params.get('city', '').strip()
        slot  = request.query_params.get('slot', 'morning').strip().lower()

        if not place and not city:
            return Response(
                {'error': 'Provide at least one of: q (place name) or city'},
                status=status.HTTP_400_BAD_REQUEST
            )

        photo_url = get_place_photo(place_name=place, city=city, slot=slot)
        return Response({
            'query': place or city,
            'city': city,
            'slot': slot,
            'photo_url': photo_url,
        }, status=status.HTTP_200_OK)


class AIChatRefineView(APIView):
    """
    POST /api/v1/planner/chat/
    Conversational AI travel concierge to chat, answer questions, and dynamically edit itineraries.
    """
    def post(self, request):
        message = request.data.get('message', '').strip()
        current_itinerary = request.data.get('current_itinerary', {})
        chat_history = request.data.get('chat_history', [])
        user_city = request.data.get('user_city')
        traveler_type = request.data.get('traveler_type')
        budget_tier = request.data.get('budget_tier')
        travel_style = request.data.get('travel_style')

        if not message:
            return Response({'error': 'Message cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        chat_result = chat_with_llm(
            message=message,
            current_itinerary=current_itinerary,
            chat_history=chat_history,
            user_city=user_city,
            traveler_type=traveler_type,
            budget_tier=budget_tier,
            travel_style=travel_style
        )
        return Response(chat_result, status=status.HTTP_200_OK)


