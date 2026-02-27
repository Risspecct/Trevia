from pydantic import BaseModel, Field, field_validator
from datetime import datetime


class ItineraryRequest(BaseModel):
    city: str = Field(..., example="Varanasi")
    state: str = Field(..., example="Uttar Pradesh")  # <-- REQUIRED
    duration_days: int = Field(..., gt=0, le=7, example=3)
    num_people: int = Field(..., gt=0, example=2)
    travel_style: str = Field(..., example="Adventure")
    start_date: str = Field(..., example="2026-03-20")
    budget_level: str = Field(..., example="Mid-range")

    @field_validator('start_date')
    @classmethod
    def validate_date(cls, v: str):
        try:
            datetime.strptime(v, "%Y-%m-%d")
            return v
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")
