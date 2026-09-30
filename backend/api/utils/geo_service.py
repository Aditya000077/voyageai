import math

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the Haversine distance between two GPS coordinates in kilometers.
    """
    R = 6371.0  # Earth radius in kilometers

    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)

    r_lat1 = math.radians(lat1)
    r_lat2 = math.radians(lat2)

    a = (math.sin(d_lat / 2) ** 2) + (math.cos(r_lat1) * math.cos(r_lat2) * (math.sin(d_lon / 2) ** 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def parse_coords_string(coords_str: str) -> tuple[float, float] | None:
    """
    Parses coordinate string like "35.0116° N, 135.7681° E" into (lat, lng) floats.
    """
    try:
        parts = coords_str.split(',')
        if len(parts) != 2:
            return None

        lat_part = parts[0].strip()
        lon_part = parts[1].strip()

        lat = float(lat_part.replace('°', '').replace('N', '').replace('S', '').strip())
        if 'S' in lat_part.upper():
            lat = -lat

        lon = float(lon_part.replace('°', '').replace('E', '').replace('W', '').strip())
        if 'W' in lon_part.upper():
            lon = -lon

        return lat, lon
    except Exception:
        return None
