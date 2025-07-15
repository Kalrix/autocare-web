from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Literal
from datetime import datetime
from uuid import UUID

class Address(BaseModel):
    line1: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None

class Customer(BaseModel):
    id: UUID = Field(default_factory=UUID, alias="_id")
    full_name: str
    phone_number: str
    email: Optional[EmailStr] = None
    address: Optional[Address] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    tags: Optional[List[str]] = []
    source: Literal["main_admin", "hub_admin", "garage_admin", "website"]
    store_id: Optional[UUID] = None
    onboarded_by: Optional[UUID] = None
    loyalty_card_id: Optional[UUID] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
