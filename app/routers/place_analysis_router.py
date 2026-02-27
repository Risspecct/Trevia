from fastapi import APIRouter, HTTPException
from app.models.place_analysis_model import PlaceAnalysisRequest
from app.services.place_analyser import PlaceAnalysisService

router = APIRouter(
    prefix="/place",
    tags=["Place Analysis"]
)

service = PlaceAnalysisService()


@router.post("/analyze")
async def analyze_place(request: PlaceAnalysisRequest):
    """
    Generate AI-powered safety-aware analysis of a specific place.
    """

    result = service.generate_place_summary(
        place_name=request.place_name,
        city=request.city,
        state=request.state
    )

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return {
        "status": "success",
        "data": result
    }
