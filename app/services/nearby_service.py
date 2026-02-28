"""
Nearby Emergency Services via SerpAPI.
Searches Google Maps for hospitals, police stations, and emergency services
within a ~2 km radius of given GPS coordinates.
"""

import os
import asyncio
from serpapi import Client
from dotenv import load_dotenv

load_dotenv()

SERP_API_KEY = os.getenv("SERP_API_KEY", "")

# Categories to search for
EMERGENCY_CATEGORIES = [
    {"key": "hospital", "query": "hospital", "emoji": "🏥"},
    {"key": "police", "query": "police station", "emoji": "🚔"},
    {"key": "pharmacy", "query": "pharmacy", "emoji": "💊"},
    {"key": "fire_station", "query": "fire station", "emoji": "🚒"},
]


def _search_nearby(lat: float, lng: float, query: str, limit: int = 5) -> list[dict]:
    """
    Synchronous search for nearby places matching `query` around lat/lng.
    Uses SerpAPI 'google_maps' engine with a location-centric query.
    """
    if not SERP_API_KEY:
        return []

    params = {
        "engine": "google_maps",
        "q": f"{query} near me",
        "ll": f"@{lat},{lng},14z",     # lat,lng with zoom level ~2km radius
        "type": "search",
        "hl": "en",
        "gl": "in",
    }

    try:
        client = Client(api_key=SERP_API_KEY)
        results = client.search(params)
    except Exception:
        return []

    local_results = results.get("local_results", [])

    places = []
    for item in local_results[:limit]:
        gps = item.get("gps_coordinates", {})
        address = item.get("address", "")
        title = item.get("title", "")
        rating = item.get("rating")
        phone = item.get("phone", "")
        reviews_count = item.get("reviews", 0)

        places.append({
            "name": title,
            "address": address,
            "gps": {
                "lat": gps.get("latitude", 0),
                "lng": gps.get("longitude", 0),
            },
            "rating": rating,
            "reviews_count": reviews_count,
            "phone": phone,
            "place_id": item.get("place_id", item.get("data_id", "")),
        })

    return places


async def find_nearby_emergency(lat: float, lng: float) -> dict:
    """
    Find nearby emergency services (hospitals, police, pharmacies, fire stations)
    around the given coordinates. Runs all category searches concurrently.

    Returns:
        Dict keyed by category with list of nearby places.
    """
    async def _async_search(category: dict) -> tuple[str, str, list[dict]]:
        results = await asyncio.to_thread(
            _search_nearby, lat, lng, category["query"]
        )
        return category["key"], category["emoji"], results

    tasks = [_async_search(cat) for cat in EMERGENCY_CATEGORIES]
    raw_results = await asyncio.gather(*tasks, return_exceptions=True)

    output: dict = {}
    for item in raw_results:
        if isinstance(item, Exception):
            continue
        key, emoji, places = item
        output[key] = {
            "emoji": emoji,
            "label": key.replace("_", " ").title(),
            "places": places,
        }

    return output
