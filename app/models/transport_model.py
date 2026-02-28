from pydantic import BaseModel, Field
from typing import Optional


class TransportRouteRequest(BaseModel):
    origin: str = Field(..., min_length=1, description="Origin address or lat,lng")
    destination: str = Field(..., min_length=1, description="Destination address or lat,lng")
