from pydantic import BaseModel, Field


class ReviewRequest(BaseModel):
    place_name: str = Field(..., example="Baga Beach Goa")
