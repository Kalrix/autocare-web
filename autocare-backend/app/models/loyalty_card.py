from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from uuid import UUID

class RewardEntry(BaseModel):
    type: Literal["service", "referral", "manual"]
    points: int
    date: datetime
    note: Optional[str] = None

class LoyaltyCard(BaseModel):
    id: UUID = Field(default_factory=UUID, alias="_id")
    customer_id: UUID
    points_balance: int = 0
    membership_tier: Literal["bronze", "silver", "gold"] = "bronze"
    issued_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    referred_by: Optional[UUID] = None
    reward_history: List[RewardEntry] = []

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
