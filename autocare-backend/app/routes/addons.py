from fastapi import APIRouter, HTTPException
from app.db.mongo import db
from app.models.service import AddonCreate, AddonInDB
from uuid import uuid4
from datetime import datetime
from typing import List

router = APIRouter()


@router.post("/addons", response_model=AddonInDB)
async def create_addon(data: AddonCreate):
    addon = {
        "_id": str(uuid4()),
        "name": data.name,
        "price": data.price,
        "created_at": datetime.utcnow()
    }
    await db.addons.insert_one(addon)
    return AddonInDB(**addon)


@router.get("/addons", response_model=List[AddonInDB])
async def get_all_addons():
    addons = await db.addons.find().to_list(None)
    return [AddonInDB(**a) for a in addons]


@router.patch("/addons/{addon_id}", response_model=AddonInDB)
async def update_addon(addon_id: str, data: AddonCreate):
    update_data = data.model_dump(exclude_unset=True)
    result = await db.addons.find_one_and_update(
        {"_id": addon_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Addon not found")
    return AddonInDB(**result)


@router.delete("/addons/{addon_id}")
async def delete_addon(addon_id: str):
    result = await db.addons.delete_one({"_id": addon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Addon not found")
    return {"message": "Addon deleted"}
