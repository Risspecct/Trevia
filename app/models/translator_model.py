from pydantic import BaseModel, Field


class TranslateRequest(BaseModel):
    text: str = Field(..., min_length=1, example="Hello world")
    target_language: str = Field(default="en", example="fr")


class TranslateResponse(BaseModel):
    original_text: str
    translated_text: str
    detected_source_language: str
    target_language: str
