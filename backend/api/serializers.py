from rest_framework import serializers
from .models import Destination, Feature, Mission, Testimonial, SavedItinerary

class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = '__all__'

class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = '__all__'

class MissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mission
        fields = '__all__'

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'

class SavedItinerarySerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedItinerary
        fields = '__all__'

class AIPromptRequestSerializer(serializers.Serializer):
    prompt = serializers.CharField(required=True, max_length=500)
    save_result = serializers.BooleanField(required=False, default=False)
