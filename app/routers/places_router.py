"""
Places Autocomplete Router
- GET /places/autocomplete?input=...
- Returns Google Maps place suggestions via SerpAPI
"""

from fastapi import APIRouter, Query
from app.services.places_service import get_place_suggestions

router = APIRouter(
    prefix="/places",
    tags=["Places Autocomplete"],
)


@router.get("/autocomplete")
async def autocomplete(
    input: str = Query(..., min_length=2, description="Search query for place autocomplete"),
):
    """
    Return up to 5 place suggestions for the given input text.

    Each suggestion includes:
    - description: human-readable place name + address
    - place_id: Google Place ID or data_id
    - gps: { lat, lng }  (ready to use — no second call needed)
    """
    suggestions = get_place_suggestions(input)
    return {"suggestions": suggestions}
