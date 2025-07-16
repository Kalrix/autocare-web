from fastapi import APIRouter, HTTPException
from app.db.mongo import db
from app.models.service import SubserviceCreate, SubserviceInDB
from uuid import uuid4
from datetime import datetime
from typing import List

router = APIRouter()


@router.post("/subservices", response_model=SubserviceInDB)
async def create_subservice(data: SubserviceCreate):
    subservice = {
        "_id": str(uuid4()),
        "name": data.name,
        "price": data.price,
        "vehicle_category": data.vehicle_category,
        "is_optional": data.is_optional,
        "created_at": datetime.utcnow()
    }
    await db.subservices.insert_one(subservice)
    return SubserviceInDB(**subservice)


@router.get("/subservices", response_model=List[SubserviceInDB])
async def get_all_subservices():
    subservices = await db.subservices.find().to_list(None)
    return [SubserviceInDB(**s) for s in subservices]


@router.patch("/subservices/{subservice_id}", response_model=SubserviceInDB)
async def update_subservice(subservice_id: str, data: SubserviceCreate):
    update_data = data.model_dump(exclude_unset=True)
    result = await db.subservices.find_one_and_update(
        {"_id": subservice_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Subservice not found")
    return SubserviceInDB(**result)


@router.delete("/subservices/{subservice_id}")
async def delete_subservice(subservice_id: str):
    result = await db.subservices.delete_one({"_id": subservice_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subservice not found")
    return {"message": "Subservice deleted"}
