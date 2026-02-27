from fastapi import APIRouter, HTTPException
from app.models.translator_model import TranslateRequest, TranslateResponse
from app.services.translator import GoogleTranslator


router = APIRouter(prefix="/translate", tags=["Translation"])

translator_service = GoogleTranslator()


@router.post("/", response_model=TranslateResponse)
def translate_text(request: TranslateRequest):
    try:
        result = translator_service.translate_text(
            text=request.text,
            target_language=request.target_language
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
