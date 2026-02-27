from fastapi import APIRouter, HTTPException
from app.models.itinerary import ItineraryRequest
from app.services.itinerary_service import ItineraryService

router = APIRouter(
    prefix="/itinerary",
    tags=["Safe Itinerary"]
)

service = ItineraryService()


@router.post("/generate")
async def generate_itinerary(request: ItineraryRequest):
    """
    Generate AI-powered safe itinerary based on crime analytics.
    """

    result = service.generate_safe_itinerary(
        city=request.city,
        state=request.state,
        days=request.duration_days,
        people=request.num_people,
        style=request.travel_style,
        start_date=request.start_date,
        budget=request.budget_level
    )

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return {
        "status": "success",
        "data": result
    }
