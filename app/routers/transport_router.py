"""
Transport Router
- Accepts origin and destination
- Fetches routes for all transport modes via Google Directions API
- Generates ride-hailing deep links (Uber, Ola)
- Returns combined response
"""

from fastapi import APIRouter, HTTPException
from app.models.transport_model import TransportRouteRequest
from app.services.google_directions import fetch_all_routes
from app.utils.deeplink_generator import generate_ride_links

router = APIRouter(
    prefix="/transport",
    tags=["Transport Routes"],
)


@router.post("/routes")
async def get_transport_routes(req: TransportRouteRequest):
    """
    Fetch real-time transport routes for four modes
    (driving, transit, walking, bicycling) plus Uber/Ola deep links.

    Request body:
        origin: str – Origin address or "lat,lng"
        destination: str – Destination address or "lat,lng"

    Returns:
        {
          "origin": "...",
          "destination": "...",
          "routes": {
              "driving": { distance, duration, polyline, steps, ... },
              "transit": { ... },
              "walking": { ... },
              "bicycling": { ... }
          },
          "ride_links": {
              "uber": "https://...",
              "ola": "https://..."
          }
        }
    """
    try:
        routes = await fetch_all_routes(req.origin, req.destination)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch routes: {str(e)}")

    ride_links = generate_ride_links(req.origin, req.destination)

    return {
        "origin": req.origin,
        "destination": req.destination,
        "routes": routes,
        "ride_links": ride_links,
    }
