import random
import math


# ─────────────────────────────────────────────────────────────────────────────
# ETA ENGINE — VoyageAI Smart Navigation
# Predicts total travel time with itemised breakdown (RF/XGBoost-style logic)
# Components: base travel + traffic delay + crowd delay + entry/customs wait
# ─────────────────────────────────────────────────────────────────────────────

CROWD_MULTIPLIERS = {
    'LOW':    {'traffic': 0.05, 'crowd': 0.03, 'wait': 0.02},
    'MEDIUM': {'traffic': 0.15, 'crowd': 0.10, 'wait': 0.08},
    'HIGH':   {'traffic': 0.30, 'crowd': 0.22, 'wait': 0.18},
}

# Time-of-day congestion factor (UTC hour → multiplier)
TIME_CONGESTION = {
    **{h: 0.02 for h in range(0, 6)},    # Night: minimal
    6:  0.12, 7: 0.25, 8: 0.30, 9: 0.22,  # Morning rush
    **{h: 0.10 for h in range(10, 12)},
    12: 0.15, 13: 0.18,                    # Lunch peak
    **{h: 0.08 for h in range(14, 17)},
    17: 0.25, 18: 0.32, 19: 0.28,          # Evening rush
    **{h: 0.08 for h in range(20, 24)},
}

DAY_MULTIPLIERS = {
    0: 1.0,   # Monday
    1: 1.0,
    2: 1.05,
    3: 1.05,
    4: 1.12,  # Friday higher
    5: 1.20,  # Saturday weekend peak
    6: 1.15,  # Sunday
}


def _format_duration(minutes: int) -> str:
    if minutes < 1:
        minutes = 1
    hours = minutes // 60
    mins = minutes % 60
    if hours > 0:
        return f"{hours}h {mins:02d}m"
    return f"{mins} min"


def predict_eta(
    distance_km: float,
    crowd_level: str,
    time_of_day: int = 12,
    day_of_week: int = 2,
    base_speed_kmh: float = 870.0,
    wait_minutes: int | None = None,
    is_long_haul: bool = True,
) -> dict:
    """
    Predicts ETA with a full itemised breakdown.

    Args:
        distance_km: straight-line or route distance
        crowd_level: 'LOW' | 'MEDIUM' | 'HIGH'
        time_of_day: hour in UTC 0-23
        day_of_week: 0=Monday … 6=Sunday
        base_speed_kmh: avg speed (870 for flight, 60 for road)
        wait_minutes: override entry/customs wait; auto-computed if None
        is_long_haul: True = flight context, False = local travel

    Returns:
        dict with full ETA breakdown and total
    """
    crowd_level = crowd_level.upper() if crowd_level else 'MEDIUM'
    if crowd_level not in CROWD_MULTIPLIERS:
        crowd_level = 'MEDIUM'

    mults = CROWD_MULTIPLIERS[crowd_level]
    time_factor = TIME_CONGESTION.get(time_of_day % 24, 0.10)
    day_factor = DAY_MULTIPLIERS.get(day_of_week % 7, 1.0)

    # Base travel time (minutes)
    base_minutes = math.ceil((distance_km / base_speed_kmh) * 60)

    # Traffic delay
    traffic_delay = math.ceil(base_minutes * (mults['traffic'] + time_factor) * day_factor)
    traffic_delay = max(1, traffic_delay)

    # Crowd delay at destination / transit
    crowd_delay = math.ceil(base_minutes * mults['crowd'])
    crowd_delay = max(0, crowd_delay)

    # Entry / customs / ticketing wait
    if wait_minutes is not None:
        entry_wait = wait_minutes
    else:
        if is_long_haul:
            # Airport customs + immigration
            entry_wait = {'LOW': random.randint(15, 25), 'MEDIUM': random.randint(25, 45), 'HIGH': random.randint(45, 80)}[crowd_level]
        else:
            # Venue entry queue
            entry_wait = {'LOW': random.randint(0, 5), 'MEDIUM': random.randint(5, 15), 'HIGH': random.randint(15, 35)}[crowd_level]

    total_minutes = base_minutes + traffic_delay + crowd_delay + entry_wait

    # Confidence interval ±10%
    lower = math.ceil(total_minutes * 0.90)
    upper = math.ceil(total_minutes * 1.10)

    # Crowd color and icon
    crowd_colors = {'LOW': '#10B981', 'MEDIUM': '#F59E0B', 'HIGH': '#EF4444'}
    crowd_icons  = {'LOW': '🟢', 'MEDIUM': '🟡', 'HIGH': '🔴'}

    # Advisory message
    if crowd_level == 'HIGH':
        advisory = f"⚠️ High crowd detected — consider departing earlier or selecting a lower-crowd route to save ~{traffic_delay + crowd_delay} min."
    elif crowd_level == 'MEDIUM':
        advisory = f"🟡 Moderate crowd — travel is manageable. Allow extra {crowd_delay + entry_wait} min buffer."
    else:
        advisory = f"✅ Low crowd conditions — smooth travel expected. Minimal delays anticipated."

    return {
        'distance_km': round(distance_km, 1),
        'crowd_level': crowd_level,
        'crowd_color': crowd_colors[crowd_level],
        'crowd_icon': crowd_icons[crowd_level],
        'time_of_day': f"{time_of_day:02d}:00 UTC",
        'breakdown': {
            'base_travel': {
                'label': 'Base travel time',
                'minutes': base_minutes,
                'formatted': _format_duration(base_minutes),
                'prefix': '',
            },
            'traffic_delay': {
                'label': 'Traffic & transit delay',
                'minutes': traffic_delay,
                'formatted': _format_duration(traffic_delay),
                'prefix': '+',
            },
            'crowd_delay': {
                'label': 'Crowd delay at destination',
                'minutes': crowd_delay,
                'formatted': _format_duration(crowd_delay),
                'prefix': '+',
            },
            'entry_wait': {
                'label': 'Entry / customs / queuing',
                'minutes': entry_wait,
                'formatted': _format_duration(entry_wait),
                'prefix': '+',
            },
        },
        'total_minutes': total_minutes,
        'total_formatted': _format_duration(total_minutes),
        'confidence_range': f"{_format_duration(lower)} – {_format_duration(upper)}",
        'advisory': advisory,
        'time_saved_vs_high_crowd': max(0, math.ceil(base_minutes * 0.3 + 40) - total_minutes),
    }
