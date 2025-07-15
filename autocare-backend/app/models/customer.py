from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Literal
from datetime import datetime
from uuid import UUID

class Address(BaseModel):
    line1: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None

# ✅ Schema used when creating customer (from frontend)
class CustomerCreate(BaseModel):
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

# ✅ Full schema (for DB reading, internal use, etc.)
class Customer(CustomerCreate):
    id: UUID
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
