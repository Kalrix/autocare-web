from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class ServiceTask(BaseModel):
    task_type: str         # e.g., "Oil Change"
    price: float

class VehicleTransaction(BaseModel):
    id: UUID = Field(default_factory=UUID, alias="_id")
    vehicle_id: UUID
    customer_id: UUID
    store_id: UUID
    date: datetime = Field(default_factory=datetime.utcnow)
    tasks: List[ServiceTask]
    total_amount: float
    payment_mode: Optional[str] = "cash"  # or UPI, card, etc.
    paid: bool = True
    invoice_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
