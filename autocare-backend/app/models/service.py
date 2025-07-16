from pydantic import BaseModel, Field, constr
from typing import List, Optional, Literal
from uuid import UUID
from datetime import datetime

# ---------------------------
# 🔹 Vehicle Categories
# ---------------------------
VehicleCategory = Literal[
    "bike", "auto", "car_hatchback", "car_sedan", "car_suv", "car_muv",
    "truck_small", "truck_medium", "truck_heavy", "luxury"
]

# ---------------------------
# 🔹 Task Type Model
# ---------------------------
class TaskTypeBase(BaseModel):
    name: str
    allowed_in_hub: Optional[bool] = False
    allowed_in_garage: Optional[bool] = False
    slot_type: constr(pattern=r"^(per_hour|max_per_day)$")
    count: Optional[int] = 0

class TaskTypeCreate(TaskTypeBase):
    pass

class TaskTypeUpdate(BaseModel):
    name: Optional[str]
    allowed_in_hub: Optional[bool]
    allowed_in_garage: Optional[bool]
    slot_type: Optional[constr(pattern=r"^(per_hour|max_per_day)$")]
    count: Optional[int]

class TaskTypeInDB(TaskTypeBase):
    id: UUID = Field(alias="_id")
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

# ---------------------------
# 🔹 Addon Model
# ---------------------------
class AddonBase(BaseModel):
    name: str
    price: float

class AddonCreate(AddonBase):
    pass

class AddonInDB(AddonBase):
    id: UUID = Field(alias="_id")
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

# ---------------------------
# 🔹 Subservice Model
# ---------------------------
class SubserviceBase(BaseModel):
    name: str
    price: float
    vehicle_category: Optional[VehicleCategory]
    is_optional: bool = True

class SubserviceCreate(SubserviceBase):
    pass

class SubserviceInDB(SubserviceBase):
    id: UUID = Field(alias="_id")
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

# ---------------------------
# 🔹 Service Model
# ---------------------------
class ServiceBase(BaseModel):
    name: str
    task_type_id: UUID
    tags: List[str] = Field(default_factory=list)
    duration_minutes: Optional[int] = None  # Can interpret in hours/days at UI level
    is_active: bool = True
    is_visible_to_customer: bool = True
    addon_ids: List[UUID] = []
    subservice_ids: List[UUID] = []

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    task_type_id: Optional[UUID] = None
    tags: Optional[List[str]] = None
    duration_minutes: Optional[int] = None
    is_active: Optional[bool] = None
    is_visible_to_customer: Optional[bool] = None
    addon_ids: Optional[List[UUID]] = None
    subservice_ids: Optional[List[UUID]] = None

class ServiceInDB(ServiceBase):
    id: UUID = Field(alias="_id")
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

# ---------------------------
# 🔹 Service Pricing Model (No Labour Here)
# ---------------------------
class ServicePricingBase(BaseModel):
    service_id: UUID
    vehicle_category: VehicleCategory
    store_id: UUID  # Required since stores may price services differently
    base_price: float
    tax_percent: float = 0.0
    include_tax: bool = False

class ServicePricingCreate(ServicePricingBase):
    pass

class ServicePricingUpdate(BaseModel):
    base_price: Optional[float] = None
    tax_percent: Optional[float] = None
    include_tax: Optional[bool] = None
    store_id: Optional[UUID] = None

class ServicePricingInDB(ServicePricingBase):
    id: UUID = Field(alias="_id")
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

# ---------------------------
# 🔹 Labour Rule Model (Centralized)
# ---------------------------
class LabourRuleBase(BaseModel):
    task_type_id: UUID
    vehicle_category: VehicleCategory
    charge_type: Literal["fixed", "percentage"]
    value: float  # ₹ or %

class LabourRuleCreate(LabourRuleBase):
    pass

class LabourRuleUpdate(BaseModel):
    charge_type: Optional[Literal["fixed", "percentage"]] = None
    value: Optional[float] = None

class LabourRuleInDB(LabourRuleBase):
    id: UUID = Field(alias="_id")
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True
