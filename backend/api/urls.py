from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DestinationViewSet,
    DestinationSearchView,
    FeatureViewSet,
    MissionViewSet,
    TestimonialViewSet,
    SavedItineraryViewSet,
    AIPlannerView,
    FlightMissionDetailView,
    CurrencyView,
    SearchHotelsView,
    SearchFlightsView,
    BookHotelView,
    BookFlightView,
    WeatherView,
    NearbyPlacesView,
    CalculateBudgetView,
    VisaInformationView,
    EmergencyContactsView,
    TranslatePhraseView,
    HealthCheckView,
    LocationView,
    NearbyDestinationsView,
    CrowdAnalysisView,
    RouteComparisonView,
    ETAPredictionView,
    PlacePhotoView,
    AIChatRefineView,
)
from .auth_views import GoogleAuthView

router = DefaultRouter()
router.register(r'destinations', DestinationViewSet, basename='destination')
router.register(r'features', FeatureViewSet, basename='feature')
router.register(r'missions', MissionViewSet, basename='mission')
router.register(r'testimonials', TestimonialViewSet, basename='testimonial')
router.register(r'itineraries', SavedItineraryViewSet, basename='itinerary')

urlpatterns = [
    # Destination fuzzy search (must come before router.urls to avoid pk conflict)
    path('destinations/search/', DestinationSearchView.as_view(), name='destinations-search'),
    path('destinations/search', DestinationSearchView.as_view(), name='destinations-search-no-slash'),

    path('', include(router.urls)),
    path('plan/', AIPlannerView.as_view(), name='ai-planner'),
    path('itinerary/', AIPlannerView.as_view(), name='itinerary'),
    path('itinerary', AIPlannerView.as_view(), name='itinerary-no-slash'),
    path('planner/chat/', AIChatRefineView.as_view(), name='planner-chat'),
    path('planner/chat', AIChatRefineView.as_view(), name='planner-chat-no-slash'),
    path('currency/', CurrencyView.as_view(), name='currency'),
    path('currency', CurrencyView.as_view(), name='currency-no-slash'),
    path('flights/', FlightMissionDetailView.as_view(), name='flights'),
    path('flights/<str:mission_id>/', FlightMissionDetailView.as_view(), name='flight-detail'),
    path('flights/<str:mission_id>', FlightMissionDetailView.as_view(), name='flight-detail-no-slash'),

    # GPS Location & Proximity Routes
    path('location/', LocationView.as_view(), name='location'),
    path('destinations/nearby/', NearbyDestinationsView.as_view(), name='destinations-nearby'),

    # New Recommended Tools Routes
    path('hotels/search/', SearchHotelsView.as_view(), name='hotels-search'),
    path('flights/search/', SearchFlightsView.as_view(), name='flights-search'),
    path('hotels/book/', BookHotelView.as_view(), name='hotels-book'),
    path('flights/book/', BookFlightView.as_view(), name='flights-book'),
    path('weather/', WeatherView.as_view(), name='weather'),
    path('places/nearby/', NearbyPlacesView.as_view(), name='places-nearby'),
    path('budget/calculate/', CalculateBudgetView.as_view(), name='budget-calculate'),
    path('visa/', VisaInformationView.as_view(), name='visa'),
    path('emergency/', EmergencyContactsView.as_view(), name='emergency'),
    path('translate/', TranslatePhraseView.as_view(), name='translate'),

    # Health & Auth
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('auth/google/', GoogleAuthView.as_view(), name='google-auth'),

    # Smart Navigation — Crowd + Route + ETA
    path('crowd/', CrowdAnalysisView.as_view(), name='crowd-analysis'),
    path('routes/', RouteComparisonView.as_view(), name='route-comparison'),
    path('eta/', ETAPredictionView.as_view(), name='eta-prediction'),

    # Dynamic place/city photo resolver (Wikipedia-backed)
    path('place-photo/', PlacePhotoView.as_view(), name='place-photo'),
    path('place-photo', PlacePhotoView.as_view(), name='place-photo-no-slash'),
]
