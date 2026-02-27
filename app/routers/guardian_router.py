from fastapi import APIRouter, HTTPException
from app.models.guardian_model import GuardianRequest
from app.services.guardian_service import GuardianService

router = APIRouter(
    prefix="/guardian",
    tags=["State Guardian Info"]
)

guardian_service = GuardianService()


@router.post("/state")
async def get_guardian_info(request: GuardianRequest):
    """
    Fetch guardian safety card for a specific state.
    """

    result = guardian_service.get_guardian_info_by_state(
        request.state
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="State not found in guardian dataset."
        )

    return {
        "status": "success",
        "data": result
    }
