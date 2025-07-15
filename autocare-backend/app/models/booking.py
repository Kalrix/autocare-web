from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from uuid import UUID
from datetime import datetime, date

# ---------------------------
# Vehicle Categories
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
# Customer Model
# ---------------------------

class Address(BaseModel):
    line1: str
    city: str
    pincode: str

class CustomerInit(BaseModel):
    full_name: str
    phone_number: str
    email: Optional[str] = None
    address: Optional[Address] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    tags: Optional[List[str]] = []
    source: str  # e.g. store_panel, admin_panel, customer_app
    store_id: str
    onboarded_by: str

# ---------------------------
# Vehicle Model
# ---------------------------

class VehicleInit(BaseModel):
    vehicle_number: str
    vehicle_type: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    fuel_type: Optional[str] = None
    odometer_km: Optional[int] = None
    last_service_date: Optional[date] = None
    is_primary: Optional[bool] = False
    notes: Optional[str] = None

# ---------------------------
# Booking Init
# ---------------------------

class BookingInitRequest(BaseModel):
    customer: CustomerInit
    vehicle: VehicleInit
    store_id: str
    booking_source: str  # store_panel | admin_panel | customer_app

class BookingInitResponse(BaseModel):
    message: str
    booking_id: str
    customer_id: str
    vehicle_id: str

# ---------------------------
# Booking Task Update
# ---------------------------

class BookingTaskAddon(BaseModel):
    name: str
    price: float

class BookingTaskSubservice(BaseModel):
    id: UUID
    name: str
    price: float

class BookingTaskInput(BaseModel):
    service_id: UUID
    vehicle_category: VehicleCategory
    price: float
    addons: Optional[List[BookingTaskAddon]] = []
    subservices: Optional[List[BookingTaskSubservice]] = []

class BookingTaskUpdateRequest(BaseModel):
    tasks: List[BookingTaskInput]
