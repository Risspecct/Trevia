from fastapi import APIRouter, HTTPException, Depends
from app.models.itinerary import ItineraryRequest
from app.services.itinerary_service import ItineraryService

router = APIRouter(prefix="/itinerary", tags=["Itinerary"])


# Dependency to get the service instance
def get_itinerary_service():
    return ItineraryService()


@router.post("/generate")
async def handle_itinerary_request(
    request: ItineraryRequest,
    service: ItineraryService = Depends(get_itinerary_service)
):
    """
    Endpoint that triggers the initial itinerary workflow.
    """
    try:
        # Convert the Pydantic model to a dictionary to match service expectations
        # .model_dump() is preferred for Pydantic v2
        input_data = request.model_dump()

        # Await the async process_request function in your service file
        result = await service.process_request(input_data)

        return result

    except Exception as e:

        raise HTTPException(status_code=500, detail=f"Router Processing Error: {str(e)}")
