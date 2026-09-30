from django.contrib import admin
from .models import Destination, Feature, Mission, Testimonial, SavedItinerary

@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ('city', 'country', 'tag', 'price', 'score', 'rating')
    search_fields = ('city', 'country', 'tag')
    list_filter = ('tag', 'best_season')

@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ('title', 'label', 'metric', 'accent')
    search_fields = ('title', 'label')

@admin.register(Mission)
class MissionAdmin(admin.ModelAdmin):
    list_display = ('mission_id', 'destination', 'flight', 'status', 'passenger', 'progress')
    list_filter = ('status',)
    search_fields = ('mission_id', 'destination', 'passenger', 'flight')

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'badge', 'rating', 'trips')
    search_fields = ('name', 'role')

@admin.register(SavedItinerary)
class SavedItineraryAdmin(admin.ModelAdmin):
    list_display = ('destination', 'prompt', 'estimated_cost', 'ai_match_score', 'created_at')
    search_fields = ('destination', 'prompt')
    readonly_fields = ('created_at',)
