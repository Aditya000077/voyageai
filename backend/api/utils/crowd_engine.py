import random
import math
from datetime import datetime


# ─────────────────────────────────────────────────────────────────────────────
# CROWD ENGINE — VoyageAI Smart Navigation
# Simulates real-time anonymous GPS density → crowd zones, heatmap, predictions
# ─────────────────────────────────────────────────────────────────────────────

# Crowd profiles per destination (users/visitors present at peak)
DESTINATION_CROWD_PROFILES = {
    'kyoto':        {'base': 820, 'peak_multiplier': 2.4, 'peak_hours': [10, 11, 14, 15]},
    'nara':         {'base': 450, 'peak_multiplier': 2.1, 'peak_hours': [11, 12, 13]},
    'santorini':    {'base': 680, 'peak_multiplier': 2.8, 'peak_hours': [12, 13, 17, 18]},
    'amalfi':       {'base': 510, 'peak_multiplier': 2.2, 'peak_hours': [11, 14, 15]},
    'zermatt':      {'base': 390, 'peak_multiplier': 1.9, 'peak_hours': [10, 14, 15]},
    'serengeti':    {'base': 210, 'peak_multiplier': 1.6, 'peak_hours': [6, 7, 17, 18]},
    'zanzibar':     {'base': 280, 'peak_multiplier': 1.8, 'peak_hours': [10, 11, 16]},
    'bali':         {'base': 950, 'peak_multiplier': 2.6, 'peak_hours': [9, 10, 15, 16]},
    'paris':        {'base': 1200, 'peak_multiplier': 3.0, 'peak_hours': [11, 12, 14, 15]},
    'new york':     {'base': 1800, 'peak_multiplier': 2.5, 'peak_hours': [12, 13, 18, 19]},
    'nyc':          {'base': 1800, 'peak_multiplier': 2.5, 'peak_hours': [12, 13, 18, 19]},
    'rio':          {'base': 650, 'peak_multiplier': 2.1, 'peak_hours': [11, 14, 15]},
    'patagonia':    {'base': 180, 'peak_multiplier': 1.5, 'peak_hours': [9, 10, 14]},
    'iceland':      {'base': 320, 'peak_multiplier': 1.7, 'peak_hours': [10, 11, 21, 22]},
    'reykjavik':    {'base': 320, 'peak_multiplier': 1.7, 'peak_hours': [10, 11, 21, 22]},
    'maldives':     {'base': 240, 'peak_multiplier': 1.4, 'peak_hours': [10, 14, 15]},
    'cairo':        {'base': 780, 'peak_multiplier': 2.3, 'peak_hours': [9, 10, 14]},
    'egypt':        {'base': 780, 'peak_multiplier': 2.3, 'peak_hours': [9, 10, 14]},
    'machu picchu': {'base': 410, 'peak_multiplier': 2.8, 'peak_hours': [9, 10, 11]},
    'cusco':        {'base': 360, 'peak_multiplier': 2.0, 'peak_hours': [10, 11, 14]},
    'default':      {'base': 400, 'peak_multiplier': 2.0, 'peak_hours': [11, 12, 14]},
}

CROWD_THRESHOLDS = {
    'LOW':    (0, 500),
    'MEDIUM': (501, 1000),
    'HIGH':   (1001, 99999),
}


def _get_profile(destination_name: str) -> dict:
    name = destination_name.lower()
    for key in DESTINATION_CROWD_PROFILES:
        if key in name:
            return DESTINATION_CROWD_PROFILES[key]
    return DESTINATION_CROWD_PROFILES['default']


def _classify_crowd(count: int) -> str:
    for level, (lo, hi) in CROWD_THRESHOLDS.items():
        if lo <= count <= hi:
            return level
    return 'HIGH'


def _crowd_color(level: str) -> str:
    return {'LOW': '#10B981', 'MEDIUM': '#F59E0B', 'HIGH': '#EF4444'}.get(level, '#EF4444')


def _crowd_emoji(level: str) -> str:
    return {'LOW': '🟢', 'MEDIUM': '🟡', 'HIGH': '🔴'}.get(level, '🔴')


def get_venue_crowd(destination_name: str, hour: int | None = None) -> dict:
    """
    Returns current crowd status for a named destination/venue.
    hour: 0-23 UTC; if None, uses current UTC hour.
    """
    if hour is None:
        hour = datetime.utcnow().hour

    profile = _get_profile(destination_name)
    base = profile['base']
    multiplier = profile['peak_multiplier'] if hour in profile['peak_hours'] else 1.0

    # Add realistic variance ±15%
    variance = random.uniform(0.85, 1.15)
    current_count = int(base * multiplier * variance)

    level = _classify_crowd(current_count)

    # Predict next 30-min trend
    next_hour = (hour + 1) % 24
    next_mult = profile['peak_multiplier'] if next_hour in profile['peak_hours'] else 1.0
    next_count = int(base * next_mult * random.uniform(0.9, 1.1))

    if next_count > current_count * 1.15:
        trend = 'RISING'
        trend_symbol = '↑'
        trend_color = '#F59E0B'
    elif next_count < current_count * 0.85:
        trend = 'DECLINING'
        trend_symbol = '↓'
        trend_color = '#10B981'
    else:
        trend = 'STABLE'
        trend_symbol = '→'
        trend_color = '#6B7280'

    # Best visiting window
    low_hours = [h for h in range(24) if h not in profile['peak_hours']]
    best_window_start = low_hours[0] if low_hours else 7
    best_window_end = low_hours[1] if len(low_hours) > 1 else 9
    best_window = f"{best_window_start:02d}:00 – {best_window_end:02d}:00 UTC"

    # Estimated wait time at entry
    wait_minutes = 0
    if level == 'HIGH':
        wait_minutes = random.randint(20, 45)
    elif level == 'MEDIUM':
        wait_minutes = random.randint(5, 15)
    else:
        wait_minutes = random.randint(0, 5)

    return {
        'destination': destination_name,
        'current_visitors': current_count,
        'crowd_level': level,
        'crowd_color': _crowd_color(level),
        'crowd_emoji': _crowd_emoji(level),
        'trend': trend,
        'trend_symbol': trend_symbol,
        'trend_color': trend_color,
        'trend_detail': f"Expect {'HIGH' if trend == 'RISING' else level} in ~25 minutes",
        'best_visit_window': best_window,
        'estimated_wait_minutes': wait_minutes,
        'observation_time': f"{hour:02d}:00 UTC",
    }


def generate_crowd_heatmap(center_lat: float, center_lng: float, radius_deg: float = 8.0) -> list[dict]:
    """
    Generates a simulated crowd heatmap grid around a center point.
    Returns a list of heatmap cells, each with lat/lng, crowd level, and color.
    """
    grid_size = 5  # 5x5 grid
    cells = []
    step = radius_deg / grid_size

    for i in range(-grid_size, grid_size + 1):
        for j in range(-grid_size, grid_size + 1):
            lat = center_lat + i * step
            lng = center_lng + j * step

            # Distance from center determines base density
            dist = math.sqrt(i**2 + j**2)
            if dist == 0:
                base_density = random.randint(900, 1400)  # Very busy around user
            elif dist <= 2:
                base_density = random.randint(400, 900)
            elif dist <= 4:
                base_density = random.randint(100, 500)
            else:
                base_density = random.randint(20, 200)

            level = _classify_crowd(base_density)
            cells.append({
                'lat': round(lat, 4),
                'lng': round(lng, 4),
                'density': base_density,
                'level': level,
                'color': _crowd_color(level),
                'emoji': _crowd_emoji(level),
                'radius': 40 if level == 'HIGH' else 30 if level == 'MEDIUM' else 20,
                'opacity': 0.7 if level == 'HIGH' else 0.5 if level == 'MEDIUM' else 0.3,
            })

    return cells


def predict_crowd_trend(destination_name: str) -> dict:
    """
    Predicts crowd level for the next 6 hours in 30-minute intervals.
    """
    current_hour = datetime.utcnow().hour
    profile = _get_profile(destination_name)
    timeline = []

    for offset in range(0, 7):
        hour = (current_hour + offset) % 24
        is_peak = hour in profile['peak_hours']
        mult = profile['peak_multiplier'] if is_peak else random.uniform(0.9, 1.2)
        count = int(profile['base'] * mult * random.uniform(0.9, 1.1))
        level = _classify_crowd(count)
        label = f"+{offset}h" if offset > 0 else "Now"
        timeline.append({
            'label': label,
            'hour': f"{hour:02d}:00",
            'visitors': count,
            'level': level,
            'color': _crowd_color(level),
        })

    return {
        'destination': destination_name,
        'timeline': timeline,
        'peak_in_hours': next(
            (t['label'] for t in timeline if t['level'] == 'HIGH'),
            'No peak expected in next 6h'
        ),
    }
