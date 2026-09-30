from django.db import models

class Destination(models.Model):
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    tag = models.CharField(max_length=50, default='AI Pick')
    tag_color = models.CharField(max_length=30, default='#3B82F6')
    price = models.CharField(max_length=50)
    duration = models.CharField(max_length=50)
    rating = models.FloatField(default=4.9)
    reviews = models.IntegerField(default=1000)
    score = models.IntegerField(default=95)
    image = models.URLField(max_length=500)
    coords = models.CharField(max_length=100)
    temp = models.CharField(max_length=30)
    badge = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    best_season = models.CharField(max_length=100, blank=True, null=True)
    hotel_recommendation = models.CharField(max_length=200, blank=True, null=True)
    highlights = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.city}, {self.country}"

class Feature(models.Model):
    feature_id = models.CharField(max_length=50, unique=True)
    icon = models.CharField(max_length=50, default='Sparkles')
    label = models.CharField(max_length=100)
    title = models.CharField(max_length=150)
    desc = models.TextField()
    accent = models.CharField(max_length=30, default='#3B82F6')
    metric = models.CharField(max_length=50)
    detail_points = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.title

class Mission(models.Model):
    STATUS_CHOICES = [
        ('IN FLIGHT', 'In Flight'),
        ('BOARDING', 'Boarding'),
        ('ON SCHEDULE', 'On Schedule'),
        ('DELAYED', 'Delayed'),
        ('LANDED', 'Landed'),
    ]

    mission_id = models.CharField(max_length=20, unique=True)
    destination = models.CharField(max_length=150)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IN FLIGHT')
    status_color = models.CharField(max_length=30, default='#06B6D4')
    passenger = models.CharField(max_length=100)
    seat = models.CharField(max_length=20)
    flight = models.CharField(max_length=50)
    eta = models.CharField(max_length=50)
    altitude = models.CharField(max_length=50)
    progress = models.IntegerField(default=0)
    origin = models.CharField(max_length=150, blank=True, null=True)
    aircraft = models.CharField(max_length=100, blank=True, null=True)
    speed = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.mission_id} - {self.destination}"

class Testimonial(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=150)
    avatar = models.URLField(max_length=500)
    quote = models.TextField()
    rating = models.IntegerField(default=5)
    trips = models.IntegerField(default=10)
    badge = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class SavedItinerary(models.Model):
    prompt = models.CharField(max_length=255)
    destination = models.CharField(max_length=150)
    duration = models.CharField(max_length=50)
    estimated_cost = models.CharField(max_length=50)
    ai_match_score = models.IntegerField(default=95)
    summary = models.TextField()
    days_data = models.JSONField(default=list)
    included_perks = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Itinerary: {self.destination} ({self.created_at.strftime('%Y-%m-%d')})"
