import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, constr


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
    id: uuid.UUID = Field(alias="_id")
    created_at: datetime

    class Config:
        from_attributes = True  # Required in Pydantic v2+
        populate_by_name = True
