from fastapi import APIRouter, HTTPException
from app.models.place_analysis_model import PlaceAnalysisRequest
from app.services.place_analyser import PlaceAnalysisService
from app.core.logger import setup_logger

logger = setup_logger()

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
    logger.info(f"Analyzing place: {request.place_name} | {request.city}, {request.state}")
    result = service.generate_place_summary(
        place_name=request.place_name,
        city=request.city,
        state=request.state
    )

    if "error" in result:
        logger.exception("Place analysis failed")
        raise HTTPException(status_code=400, detail=result["error"])
    logger.info("Place analysis completed successfully")
    return {
        "status": "success",
        "data": result
    }
