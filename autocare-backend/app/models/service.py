from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from uuid import UUID
from datetime import datetime

# ---------------------------
# 🔹 Vehicle Categories
# ---------------------------
VehicleCategory = Literal[
    "bike",
    "auto",
    "car_hatchback",
    "car_sedan",
    "car_suv",
    "car_muv",
    "truck_small",
    "truck_medium",
    "truck_heavy",
    "luxury"
]

# ---------------------------
# 🔹 Addon Model
# ---------------------------
class Addon(BaseModel):
    name: str
    price: float


# ---------------------------
# 🔹 Subservice Model (Optional Enhancements)
# ---------------------------
class SubserviceBase(BaseModel):
    name: str
    description: Optional[str] = None
    vehicle_category: Optional[VehicleCategory] = None
    price: float
    is_optional: bool = True
    duration_minutes: Optional[int] = None

class SubserviceCreate(SubserviceBase):
    pass

class SubserviceInDB(SubserviceBase):
    id: UUID
    created_at: datetime


# ---------------------------
# 🔹 Service Model (Vehicle Specific Base Service)
# ---------------------------
class ServiceBase(BaseModel):
    name: str
    task_type_id: UUID  # Links to the task (top-level category)
    description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    unit: Optional[str] = None
    duration_minutes: Optional[int] = None
    is_active: bool = True
    is_visible_to_customer: bool = True
    is_temporarily_unavailable: bool = False
    available_from: Optional[datetime] = None
    available_to: Optional[datetime] = None
    icon_url: Optional[str] = None
    banner_url: Optional[str] = None
    addons: List[Addon] = []
    subservices: List[SubserviceCreate] = []
    created_by: Optional[str] = None
    updated_by: Optional[str] = None

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    task_type_id: Optional[UUID] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    unit: Optional[str] = None
    duration_minutes: Optional[int] = None
    is_active: Optional[bool] = None
    is_visible_to_customer: Optional[bool] = None
    is_temporarily_unavailable: Optional[bool] = None
    available_from: Optional[datetime] = None
    available_to: Optional[datetime] = None
    icon_url: Optional[str] = None
    banner_url: Optional[str] = None
    addons: Optional[List[Addon]] = None
    subservices: Optional[List[SubserviceCreate]] = None
    updated_by: Optional[str] = None

class ServiceInDB(ServiceBase):
    id: UUID = Field(alias="_id")
    created_at: datetime
    last_updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


# ---------------------------
# 🔹 Service Pricing Model (Based on Vehicle Type + Store)
# ---------------------------
class ServicePricingBase(BaseModel):
    service_id: UUID
    vehicle_category: VehicleCategory
    base_price: float
    labour_charge_type: Literal["fixed", "percentage"]
    labour_charge_value: float
    final_price: Optional[float] = None
    tax_percent: Optional[float] = 0.0
    include_tax: bool = False
    store_id: Optional[UUID] = None

class ServicePricingCreate(ServicePricingBase):
    pass

class ServicePricingUpdate(BaseModel):
    base_price: Optional[float]
    labour_charge_type: Optional[Literal["fixed", "percentage"]]
    labour_charge_value: Optional[float]
    final_price: Optional[float]
    tax_percent: Optional[float]
    include_tax: Optional[bool]
    store_id: Optional[UUID]

class ServicePricingInDB(ServicePricingBase):
    id: UUID = Field(alias="_id")
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True
