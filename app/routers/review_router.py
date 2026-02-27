from fastapi import APIRouter, HTTPException
from app.models.review_model import ReviewRequest
from app.services.reviews_service import ReviewEngine

router = APIRouter(
    prefix="/reviews",
    tags=["Review Intelligence"]
)

review_engine = ReviewEngine()


@router.post("/analyze")
async def analyze_reviews(request: ReviewRequest):
    """
    Fetch Google Maps reviews and return best & worst review
    based on rating + sentiment analysis.
    """

    try:
        result = review_engine.get_best_and_worst_review(
            place_name=request.place_name
        )

        return {
            "status": "success",
            "data": result
        }

    except Exception as e:
        # Do NOT leak internal API errors
        raise HTTPException(
            status_code=400,
            detail="Unable to fetch or analyze reviews for this place."
        )
