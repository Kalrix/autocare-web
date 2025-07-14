# app/models/admin_user.py
from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime
import uuid

class AdminUserCreate(BaseModel):
    username: str
    password: str
    role: Literal["boss", "underboss", "capo", "soldier"]


class AdminUserInDB(AdminUserCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
