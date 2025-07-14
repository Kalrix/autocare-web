import uuid
from pydantic import BaseModel, Field
from typing import List


class StoreTaskCapacityBase(BaseModel):
    store_id: uuid.UUID
    task_type_id: uuid.UUID
    capacity: int


class StoreTaskCapacityCreate(StoreTaskCapacityBase):
    pass


class StoreTaskCapacityInDB(StoreTaskCapacityBase):
    id: uuid.UUID = Field(alias="_id")

    class Config:
        from_attributes = True
        populate_by_name = True


class StoreTaskCapacityWithDetails(BaseModel):
    task_type_id: uuid.UUID
    task_name: str
    slot_type: str
    capacity: int
