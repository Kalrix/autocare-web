from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class StoreAdminCreate(BaseModel):
    name: str
    city: str
    address: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    manager_name: Optional[str] = None
    manager_number: Optional[str] = None
    type: str  # must be 'hub' or 'garage'
    hub_id: Optional[UUID] = None
    alias: str
    password: str
