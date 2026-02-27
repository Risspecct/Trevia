from pydantic import BaseModel, Field


class TextToSpeechRequest(BaseModel):
    text: str = Field(..., min_length=1, example="Hello, welcome to Trevia!")
    language_code: str = Field(default="en-US", example="en-US")
