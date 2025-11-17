from pydantic import BaseModel
from typing import List

__all__ = ["AtollResponse", "LocationResponse"]

class AtollResponse(BaseModel):
    atoll: str
    islands: List[str]

class LocationResponse(BaseModel):
    locations: List[AtollResponse]
