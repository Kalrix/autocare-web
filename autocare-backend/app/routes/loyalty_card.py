from fastapi import APIRouter, HTTPException, Body
from app.models.loyalty_card import LoyaltyCard, RewardEntry
from app.db.mongo import db
from uuid import uuid4
from datetime import datetime

router = APIRouter()
loyalty_collection = db["loyalty_cards"]

@router.post("/loyalty-cards")
async def create_loyalty_card(card: LoyaltyCard):
    card_dict = card.dict(by_alias=True)
    card_dict["id"] = str(uuid4())
    card_dict["created_at"] = datetime.utcnow()
    card_dict["last_updated"] = datetime.utcnow()
    await loyalty_collection.insert_one(card_dict)
    return {"message": "Loyalty card created", "id": card_dict["id"]}

@router.get("/customers/{customer_id}/loyalty-card")
async def get_loyalty_card_by_customer(customer_id: str):
    card = await loyalty_collection.find_one({"customer_id": customer_id})
    if not card:
        raise HTTPException(status_code=404, detail="Loyalty card not found")
    card["id"] = card.get("id") or str(card["_id"])
    card.pop("_id", None)
    return card

@router.put("/loyalty-cards/{card_id}")
async def update_loyalty_card(card_id: str, updated_data: dict = Body(...)):
    updated_data["last_updated"] = datetime.utcnow()
    result = await loyalty_collection.update_one(
        {"id": card_id},
        {"$set": updated_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Loyalty card not found")
    return {"message": "Loyalty card updated"}

@router.post("/loyalty-cards/{card_id}/rewards")
async def add_reward(card_id: str, reward: RewardEntry):
    reward_dict = reward.dict()
    result = await loyalty_collection.update_one(
        {"id": card_id},
        {
            "$push": {"reward_history": reward_dict},
            "$inc": {"points_balance": reward.points},
            "$set": {"last_updated": datetime.utcnow()}
        }
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Loyalty card not found")
    return {"message": "Reward added"}
