"""
Google Maps Directions via SerpAPI.
Uses the SERP_API_KEY to fetch routes for driving, transit, walking, and cycling.
"""

import os
import asyncio
from serpapi import Client
from dotenv import load_dotenv
from typing import Any

load_dotenv()

SERP_API_KEY = os.getenv("SERP_API_KEY", "")

# SerpAPI travel_mode mapping
MODE_MAP: dict[str, int] = {
    "driving": 1,
    "transit": 3,
    "walking": 4,
    "bicycling": 5,
}


def _format_distance(meters) -> str:
    """Convert a numeric distance (metres) to a human-friendly string."""
    try:
        m = float(meters)
    except (TypeError, ValueError):
        return str(meters) if meters else "N/A"
    if m >= 1000:
        return f"{m / 1000:.1f} km"
    return f"{int(m)} m"


def _format_duration(seconds) -> str:
    """Convert a numeric duration (seconds) to a human-friendly string."""
    try:
        s = int(float(seconds))
    except (TypeError, ValueError):
        return str(seconds) if seconds else "N/A"
    if s < 60:
        return f"{s} sec"
    if s < 3600:
        return f"{s // 60} min"
    h, rem = divmod(s, 3600)
    m = rem // 60
    return f"{h}h {m}m" if m else f"{h}h"


def _safe_text(value, kind: str = "") -> str:
    """Extract text from a value that may be a dict, number, or plain string.
    `kind` should be 'distance' or 'duration' so raw numbers get formatted."""
    if isinstance(value, dict):
        # Prefer pre-formatted text; fall back to numeric value
        if "text" in value:
            return value["text"]
        raw = value.get("value")
        if raw is not None and kind == "distance":
            return _format_distance(raw)
        if raw is not None and kind == "duration":
            return _format_duration(raw)
        return str(raw) if raw is not None else "N/A"

    # Plain numeric value from SerpAPI
    if isinstance(value, (int, float)):
        if kind == "distance":
            return _format_distance(value)
        if kind == "duration":
            return _format_duration(value)
        return str(value)

    return str(value) if value else "N/A"


def _parse_step(step: dict) -> dict:
    """Extract clean step info from a SerpAPI directions step."""
    return {
        "instruction": step.get("html_instructions", "") or step.get("direction", ""),
        "distance": _safe_text(step.get("distance", ""), kind="distance"),
        "duration": _safe_text(step.get("duration", ""), kind="duration"),
        "travel_mode": step.get("travel_mode", ""),
        "transit_details": step.get("transit_details"),
        "start_location": step.get("start_location"),
        "end_location": step.get("end_location"),
    }


def _extract_steps(route: dict) -> list[dict]:
    """
    Extract steps from route — SerpAPI nests them in different ways
    depending on whether the response uses `steps` or nested `directions`.
    """
    # Direct steps array (most common)
    if "steps" in route and isinstance(route["steps"], list):
        return route["steps"]

    # Nested directions structure
    steps: list[dict] = []
    for section in route.get("directions", []):
        if isinstance(section, dict):
            inner = section.get("directions", section.get("steps", []))
            if isinstance(inner, list):
                steps.extend(inner)
    return steps


def _sync_fetch_route(origin: str, destination: str, mode: str) -> dict:
    """
    Synchronous single-route fetch via the SerpAPI Python client.
    Called inside asyncio.to_thread so it doesn't block the event loop.
    """
    if not SERP_API_KEY:
        return {"error": "SERP_API_KEY not configured in environment."}

    travel_mode = MODE_MAP.get(mode, 1)

    params = {
        "engine": "google_maps_directions",
        "start_addr": origin,
        "end_addr": destination,
        "travel_mode": travel_mode,
    }

    try:
        client = Client(api_key=SERP_API_KEY)
        data = client.search(params)
    except Exception as e:
        return {"error": f"SerpAPI request failed: {str(e)}"}

    # SerpAPI error
    if "error" in data:
        return {"error": str(data["error"])}

    directions = data.get("directions", [])
    if not directions:
        return {"error": f"No route found for {mode} between the given locations."}

    route = directions[0]

    # Distance & duration
    distance = _safe_text(route.get("distance", "N/A"), kind="distance")
    duration = _safe_text(route.get("duration", "N/A"), kind="duration")

    # Overview polyline
    poly_raw = route.get("overview_polyline", "")
    polyline = poly_raw.get("points", "") if isinstance(poly_raw, dict) else str(poly_raw)

    # Steps
    raw_steps = _extract_steps(route)
    steps = [_parse_step(s) for s in raw_steps]

    return {
        "distance": distance,
        "duration": duration,
        "via": route.get("via", ""),
        "start_address": origin,
        "end_address": destination,
        "polyline": polyline,
        "steps": steps,
    }


async def fetch_route(origin: str, destination: str, mode: str) -> dict:
    """Async wrapper — runs the blocking SerpAPI call in a thread."""
    return await asyncio.to_thread(_sync_fetch_route, origin, destination, mode)


async def fetch_all_routes(origin: str, destination: str) -> dict[str, Any]:
    """
    Fetch routes for all four transport modes concurrently.

    Returns:
        Dict keyed by mode name with route data or error info.
    """
    modes = ["driving", "transit", "walking", "bicycling"]
    tasks = [fetch_route(origin, destination, m) for m in modes]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    routes: dict[str, Any] = {}
    for mode, result in zip(modes, results):
        if isinstance(result, Exception):
            routes[mode] = {"error": str(result)}
        else:
            routes[mode] = result

    return routes
