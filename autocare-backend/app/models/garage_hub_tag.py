# app/models/garage_hub_tag.py

from pydantic import BaseModel
from uuid import UUID
from typing import List

class GarageHubTagCreate(BaseModel):
    garage_id: UUID
    hub_ids: List[UUID]
