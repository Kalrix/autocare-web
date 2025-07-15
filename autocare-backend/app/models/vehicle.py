from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4

class Vehicle(BaseModel):
    id: UUID = Field(default_factory=uuid4, alias="id")  # use 'id', not '_id'
    customer_id: UUID
    vehicle_number: str  # unique per vehicle
    vehicle_type: str    # car, bike, SUV, etc.
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    fuel_type: Optional[str] = None  # petrol, diesel, EV
    odometer_km: Optional[int] = 0
    last_service_date: Optional[datetime] = None
    is_primary: bool = False
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            UUID: lambda v: str(v),
            datetime: lambda v: v.isoformat(),
        }
