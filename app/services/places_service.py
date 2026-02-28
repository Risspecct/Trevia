"""
Google Places Autocomplete via SerpAPI.
Uses the 'google_maps' engine to return place suggestions
with GPS coordinates — no separate Place Details call needed.
"""

import os
from serpapi import Client
from dotenv import load_dotenv

load_dotenv()

SERP_API_KEY = os.getenv("SERP_API_KEY", "")


def get_place_suggestions(query: str, limit: int = 5) -> list[dict]:
    """
    Search Google Maps for places matching `query` (restricted to India).

    Returns a list of dicts:
        [
            {
                "description": "India Gate, Rajpath, New Delhi, Delhi, India",
                "place_id": "...",
                "gps": { "lat": 28.6129, "lng": 77.2295 }
            },
            ...
        ]
    """
    if not SERP_API_KEY:
        return []

    if not query or len(query.strip()) < 2:
        return []

    params = {
        "engine": "google_maps",
        "q": query,
        "type": "search",
        "hl": "en",
        "gl": "in",          # geo-restrict to India
    }

    try:
        client = Client(api_key=SERP_API_KEY)
        results = client.search(params)
    except Exception:
        return []

    local_results = results.get("local_results", [])

    suggestions = []
    for item in local_results[:limit]:
        gps = item.get("gps_coordinates", {})
        address = item.get("address", "")
        title = item.get("title", "")

        # Build a clean description: "Title, Address"
        description = f"{title}, {address}" if address else title

        suggestions.append({
            "description": description,
            "place_id": item.get("place_id", item.get("data_id", "")),
            "gps": {
                "lat": gps.get("latitude", 0),
                "lng": gps.get("longitude", 0),
            },
        })

    return suggestions
