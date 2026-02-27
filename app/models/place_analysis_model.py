from pydantic import BaseModel, Field


class PlaceAnalysisRequest(BaseModel):
    place_name: str = Field(..., example="Bara Imambara")
    city: str = Field(..., example="Lucknow")
    state: str = Field(..., example="Uttar Pradesh")
