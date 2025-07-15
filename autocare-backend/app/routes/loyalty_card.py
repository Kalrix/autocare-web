from fastapi import APIRouter, HTTPException
from app.models.loyalty_card import LoyaltyCard, RewardEntry
from pymongo import MongoClient
from uuid import uuid4
from datetime import datetime

router = APIRouter()
client = MongoClient("mongodb://localhost:27017")
db = client["autocare"]
loyalty_collection = db["loyalty_cards"]

@router.post("/loyalty-cards")
def create_loyalty_card(card: LoyaltyCard):
    card_dict = card.dict(by_alias=True)
    card_dict["_id"] = str(uuid4())
    loyalty_collection.insert_one(card_dict)
    return {"message": "Loyalty card created", "id": card_dict["_id"]}

@router.get("/customers/{customer_id}/loyalty-card")
def get_loyalty_card_by_customer(customer_id: str):
    card = loyalty_collection.find_one({"customer_id": customer_id}, {"_id": 0})
    if not card:
        raise HTTPException(status_code=404, detail="Loyalty card not found")
    return card

@router.put("/loyalty-cards/{card_id}")
def update_loyalty_card(card_id: str, updated_data: dict):
    updated_data["last_updated"] = datetime.utcnow()
    result = loyalty_collection.update_one(
        {"_id": card_id},
        {"$set": updated_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Loyalty card not found")
    return {"message": "Loyalty card updated"}

@router.post("/loyalty-cards/{card_id}/rewards")
def add_reward(card_id: str, reward: RewardEntry):
    reward_dict = reward.dict()
    result = loyalty_collection.update_one(
        {"_id": card_id},
        {
            "$push": {"reward_history": reward_dict},
            "$inc": {"points_balance": reward.points},
            "$set": {"last_updated": datetime.utcnow()}
        }
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Loyalty card not found")
    return {"message": "Reward added"}
