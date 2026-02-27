from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.models.tts_model import TextToSpeechRequest
from app.services.text_voice import GoogleTextToSpeech
import os


router = APIRouter(prefix="/tts", tags=["Text To Speech"])

tts_service = GoogleTextToSpeech()


@router.post("/generate")
def generate_audio(request: TextToSpeechRequest):
    try:
        file_path = tts_service.generate_audio(
            text=request.text,
            language_code=request.language_code
        )

        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Audio file not found")

        return FileResponse(
            path=file_path,
            media_type="audio/mpeg",
            filename="output.mp3"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
