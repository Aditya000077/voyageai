"""
Photo Engine — dynamically fetches landmark photos for any city or place.

Uses the Wikipedia REST API (no API key required) to get high-quality images
of famous landmarks worldwide.

Flow:
  1. Check the curated local dictionary for known places/cities (instant)
  2. Query Wikipedia's page-image API for the place name
  3. Fallback to a city-level Wikipedia image
  4. Final fallback: generic slot-based placeholder
"""

import urllib.request
import urllib.parse
import json
import re

# ─── Curated fast-path dictionary ────────────────────────────────────────────
# Maps lowercase keywords → verified Unsplash image URL
KNOWN_PLACE_IMAGES: dict[str, str] = {
    # ── JAIPUR ──────────────────────────────────────────────────────────────
    'hawa mahal':    'https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?w=800&h=600&fit=crop&auto=format',
    'palace of winds': 'https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?w=800&h=600&fit=crop&auto=format',
    'jal mahal':     'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800&h=600&fit=crop&auto=format',
    'amer fort':     'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop&auto=format',
    'amber fort':    'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop&auto=format',
    'sheesh mahal':  'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop&auto=format',
    'city palace jaipur': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop&auto=format',
    'jantar mantar': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop&auto=format',
    'nahargarh fort': 'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=800&h=600&fit=crop&auto=format',
    'jaigarh fort':  'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=800&h=600&fit=crop&auto=format',
    'jaipur':        'https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?w=800&h=600&fit=crop&auto=format',

    # ── AGRA ────────────────────────────────────────────────────────────────
    'taj mahal':     'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop&auto=format',
    'agra fort':     'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop&auto=format',
    'mehtab bagh':   'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800&h=600&fit=crop&auto=format',
    'fatehpur sikri': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&h=600&fit=crop&auto=format',
    'buland darwaza': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&h=600&fit=crop&auto=format',
    'agra':          'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop&auto=format',

    # ── DELHI ────────────────────────────────────────────────────────────────
    'india gate':    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop&auto=format',
    'red fort':      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop&auto=format',
    'qutub minar':   'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop&auto=format',
    'humayun tomb':  'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop&auto=format',
    'lotus temple':  'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop&auto=format',
    'delhi':         'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop&auto=format',

    # ── MUMBAI ───────────────────────────────────────────────────────────────
    'gateway of india': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=600&fit=crop&auto=format',
    'marine drive':  'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&h=600&fit=crop&auto=format',
    'elephanta caves': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop&auto=format',
    'mumbai':        'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=600&fit=crop&auto=format',

    # ── VARANASI ─────────────────────────────────────────────────────────────
    'varanasi':      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=600&fit=crop&auto=format',
    'dashashwamedh ghat': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=600&fit=crop&auto=format',
    'kashi vishwanath': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=600&fit=crop&auto=format',

    # ── GOA ──────────────────────────────────────────────────────────────────
    'goa':           'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&auto=format',
    'baga':          'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&auto=format',
    'calangute':     'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&auto=format',
    'basilica bom jesus': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&auto=format',

    # ── KERALA ───────────────────────────────────────────────────────────────
    'kerala':        'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop&auto=format',
    'alleppey':      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop&auto=format',
    'munnar':        'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop&auto=format',
    'backwaters':    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop&auto=format',
    'houseboat':     'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop&auto=format',

    # ── CHENNAI ──────────────────────────────────────────────────────────────
    'kapaleeshwarar temple': 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&h=600&fit=crop&auto=format',
    'kapaleeshwarar': 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&h=600&fit=crop&auto=format',
    'mylapore':      'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&h=600&fit=crop&auto=format',
    'marina beach':  'https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?w=800&h=600&fit=crop&auto=format',
    'elliot beach':  'https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?w=800&h=600&fit=crop&auto=format',
    'fort st george': 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800&h=600&fit=crop&auto=format',
    'mahabalipuram': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&h=600&fit=crop&auto=format',
    'shore temple':  'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&h=600&fit=crop&auto=format',
    'pancha ratha':  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format',
    'pancha rathas': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format',
    'san thome':     'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop&auto=format',
    'santhome':      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop&auto=format',
    'chettinad':     'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&auto=format',
    'chennai':       'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&h=600&fit=crop&auto=format',
    'madras':        'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&h=600&fit=crop&auto=format',

    # ── HYDERABAD ─────────────────────────────────────────────────────────────
    'charminar':     'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format',
    'golconda fort': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop&auto=format',
    'hussain sagar': 'https://images.unsplash.com/photo-1477587458883-47145ed30572?w=800&h=600&fit=crop&auto=format',
    'ramoji film city': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop&auto=format',
    'hyderabad':     'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format',

    # ── KOLKATA ──────────────────────────────────────────────────────────────
    'victoria memorial': 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&h=600&fit=crop&auto=format',
    'howrah bridge': 'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&h=600&fit=crop&auto=format',
    'dakshineswar':  'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=600&fit=crop&auto=format',
    'kolkata':       'https://images.unsplash.com/photo-1558431382-27e303142255?w=800&h=600&fit=crop&auto=format',

    # ── BENGALURU ────────────────────────────────────────────────────────────
    'bangalore palace': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=600&fit=crop&auto=format',
    'lalbagh':       'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=600&fit=crop&auto=format',
    'bengaluru':     'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=600&fit=crop&auto=format',
    'bangalore':     'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=600&fit=crop&auto=format',

    # ── AMRITSAR ─────────────────────────────────────────────────────────────
    'golden temple': 'https://images.unsplash.com/photo-1605806616949-1e87b487fc2f?w=800&h=600&fit=crop&auto=format',
    'harmandir sahib': 'https://images.unsplash.com/photo-1605806616949-1e87b487fc2f?w=800&h=600&fit=crop&auto=format',
    'sri harmandir': 'https://images.unsplash.com/photo-1605806616949-1e87b487fc2f?w=800&h=600&fit=crop&auto=format',
    'jallianwala bagh': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&h=600&fit=crop&auto=format',
    'jallianwala':   'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&h=600&fit=crop&auto=format',
    'wagah border':  'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&h=600&fit=crop&auto=format',
    'wagah':         'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&h=600&fit=crop&auto=format',
    'gobindgarh fort': 'https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=800&h=600&fit=crop&auto=format',
    'gobindgarh':    'https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=800&h=600&fit=crop&auto=format',
    'kulcha':        'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&h=600&fit=crop&auto=format',
    'amritsari kulcha': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&h=600&fit=crop&auto=format',
    'amritsar':      'https://images.unsplash.com/photo-1605806616949-1e87b487fc2f?w=800&h=600&fit=crop&auto=format',


    # ── PUNE ─────────────────────────────────────────────────────────────────
    'shaniwar wada': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&h=600&fit=crop&auto=format',
    'aga khan palace': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop&auto=format',
    'pune':          'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&h=600&fit=crop&auto=format',

    # ── AHMEDABAD ─────────────────────────────────────────────────────────────
    'sabarmati ashram': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop&auto=format',
    'adalaj stepwell': 'https://images.unsplash.com/photo-1477587458883-47145ed30572?w=800&h=600&fit=crop&auto=format',
    'ahmedabad':     'https://images.unsplash.com/photo-1477587458883-47145ed30572?w=800&h=600&fit=crop&auto=format',

    'mysore palace': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=600&fit=crop&auto=format',
    'mysore':        'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=600&fit=crop&auto=format',

    # ── UDAIPUR ──────────────────────────────────────────────────────────────
    'udaipur':       'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800&h=600&fit=crop&auto=format',
    'city palace udaipur': 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800&h=600&fit=crop&auto=format',
    'lake pichola':  'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800&h=600&fit=crop&auto=format',

    # ── JODHPUR ──────────────────────────────────────────────────────────────
    'jodhpur':       'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop&auto=format',
    'mehrangarh fort': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop&auto=format',

    # ── INTERNATIONAL ────────────────────────────────────────────────────────
    'eiffel tower':  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop&auto=format',
    'louvre':        'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=600&fit=crop&auto=format',
    'paris':         'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop&auto=format',
    'colosseum':     'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop&auto=format',
    'rome':          'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop&auto=format',
    'sagrada familia': 'https://images.unsplash.com/photo-1583779457094-ab6f78b5b79b?w=800&h=600&fit=crop&auto=format',
    'barcelona':     'https://images.unsplash.com/photo-1583779457094-ab6f78b5b79b?w=800&h=600&fit=crop&auto=format',
    'parthenon':     'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop&auto=format',
    'athens':        'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop&auto=format',
    'santorini':     'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop&auto=format',
    'big ben':       'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&auto=format',
    'tower bridge':  'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&h=600&fit=crop&auto=format',
    'london':        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&auto=format',
    'burj khalifa':  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&auto=format',
    'dubai':         'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&auto=format',
    'marina bay':    'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop&auto=format',
    'singapore':     'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop&auto=format',
    'petra':         'https://images.unsplash.com/photo-1579606032821-4d6f4b62fd8e?w=800&h=600&fit=crop&auto=format',
    'jordan':        'https://images.unsplash.com/photo-1579606032821-4d6f4b62fd8e?w=800&h=600&fit=crop&auto=format',
    'angkor wat':    'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop&auto=format',
    'cambodia':      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop&auto=format',
    'arashiyama':    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&h=600&fit=crop&auto=format',
    'fushimi':       'https://images.unsplash.com/photo-1478436127897-769e00d0c715?w=800&h=600&fit=crop&auto=format',
    'kyoto':         'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop&auto=format',
    'tokyo':         'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&auto=format',
    'mount fuji':    'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&h=600&fit=crop&auto=format',
    'great wall':    'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=600&fit=crop&auto=format',
    'china':         'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=600&fit=crop&auto=format',
    'bali':          'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&auto=format',
    'uluwatu':       'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&auto=format',
    'maldives':      'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&auto=format',
    'safari':        'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop&auto=format',
    'serengeti':     'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop&auto=format',
    'machu picchu':  'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop&auto=format',
    'pyramid':       'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&h=600&fit=crop&auto=format',
    'cairo':         'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&h=600&fit=crop&auto=format',
    'new york':      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop&auto=format',
    'times square':  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop&auto=format',
    'statue of liberty': 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&h=600&fit=crop&auto=format',
    'rio':           'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop&auto=format',
    'christ redeemer': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop&auto=format',
    'sydney':        'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop&auto=format',
    'opera house':   'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop&auto=format',
    'aurora':        'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600&fit=crop&auto=format',
    'iceland':       'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600&fit=crop&auto=format',
    'northern lights': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600&fit=crop&auto=format',
    'matterhorn':    'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800&h=600&fit=crop&auto=format',
    'zermatt':       'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800&h=600&fit=crop&auto=format',
}

# Slot-based ultimate fallbacks — neutral travel imagery (NOT city-specific)
SLOT_FALLBACKS = {
    'morning':   'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop&auto=format',
    'afternoon': 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&h=600&fit=crop&auto=format',
    'evening':   'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&h=600&fit=crop&auto=format',
}


def _check_curated(text: str) -> str | None:
    """Check curated dictionary — longest match wins."""
    t = text.lower()
    # Check longest keys first for specificity
    for key in sorted(KNOWN_PLACE_IMAGES.keys(), key=len, reverse=True):
        if key in t:
            return KNOWN_PLACE_IMAGES[key]
    return None


def _wikipedia_page_image(query: str) -> str | None:
    """
    Query the Wikipedia API for the main image of a page.
    Free — no API key needed. Returns None if not found or on error.
    """
    try:
        params = urllib.parse.urlencode({
            'action': 'query',
            'titles': query,
            'prop': 'pageimages',
            'format': 'json',
            'pithumbsize': 800,
            'pilimit': 1,
        })
        url = f'https://en.wikipedia.org/w/api.php?{params}'
        req = urllib.request.Request(url, headers={'User-Agent': 'VoyageAI/1.0 (travel itinerary app)'})

        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode())

        pages = data.get('query', {}).get('pages', {})
        for page in pages.values():
            thumb = page.get('thumbnail', {})
            src = thumb.get('source', '')
            if src and src.startswith('http'):
                # Upgrade to larger size
                src = re.sub(r'/\d+px-', '/800px-', src)
                return src
    except Exception:
        pass
    return None


def get_place_photo(place_name: str, city: str = '', slot: str = 'morning') -> str:
    """
    Main entrypoint: return the best photo URL for a given place name.
    1. Check curated dictionary for specific place_name first
    2. Check curated dictionary for combined (place + city)
    3. Wikipedia API for the place name
    4. Wikipedia API for the city name
    5. Slot-based fallback
    """
    # 1. Curated fast-path for the specific place first (avoids city title bleeding)
    if place_name:
        result = _check_curated(place_name)
        if result:
            return result

    # 2. Curated fast-path with city context
    combined = f'{place_name} {city}'.strip()
    result = _check_curated(combined)
    if result:
        return result

    # 2. Try Wikipedia for the specific place name
    if place_name:
        result = _wikipedia_page_image(place_name)
        if result:
            return result

    # 3. Try Wikipedia for the city
    if city:
        result = _check_curated(city)
        if result:
            return result
        result = _wikipedia_page_image(city)
        if result:
            return result

    # 4. Slot fallback
    return SLOT_FALLBACKS.get(slot, SLOT_FALLBACKS['morning'])
