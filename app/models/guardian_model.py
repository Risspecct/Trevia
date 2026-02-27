from pydantic import BaseModel, Field


class GuardianRequest(BaseModel):
    state: str = Field(..., example="Goa")
