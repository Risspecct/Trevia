"""
Nearby Emergency Services Router.
Exposes an endpoint to find hospitals, police stations, pharmacies,
and fire stations within ~2 km of given GPS coordinates.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.nearby_service import find_nearby_emergency

router = APIRouter(prefix="/nearby", tags=["Nearby Emergency Services"])


class NearbyRequest(BaseModel):
    lat: float = Field(..., description="Latitude of the location")
    lng: float = Field(..., description="Longitude of the location")


@router.post("/emergency")
async def get_nearby_emergency(req: NearbyRequest):
    """
    Find hospitals, police stations, pharmacies, and fire stations
    within ~2 km of the provided coordinates.
    """
    try:
        results = await find_nearby_emergency(req.lat, req.lng)
        return {
            "lat": req.lat,
            "lng": req.lng,
            "categories": results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
