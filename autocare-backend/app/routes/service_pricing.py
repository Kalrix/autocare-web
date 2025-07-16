from fastapi import APIRouter, HTTPException
from app.db.mongo import db
from app.models.service import (
    ServicePricingCreate,
    ServicePricingUpdate,
    ServicePricingInDB
)
from uuid import uuid4
from datetime import datetime
from typing import List

router = APIRouter()


@router.post("/service-pricing", response_model=ServicePricingInDB)
async def create_service_pricing(data: ServicePricingCreate):
    pricing = data.model_dump()
    pricing["_id"] = str(uuid4())
    pricing["created_at"] = datetime.utcnow()
    await db.service_pricing.insert_one(pricing)
    return ServicePricingInDB(**pricing)


@router.get("/service-pricing", response_model=List[ServicePricingInDB])
async def get_all_service_pricing():
    pricing_list = await db.service_pricing.find().to_list(None)
    return [ServicePricingInDB(**p) for p in pricing_list]


@router.patch("/service-pricing/{pricing_id}", response_model=ServicePricingInDB)
async def update_service_pricing(pricing_id: str, data: ServicePricingUpdate):
    update_data = data.model_dump(exclude_unset=True)
    result = await db.service_pricing.find_one_and_update(
        {"_id": pricing_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Pricing entry not found")
    return ServicePricingInDB(**result)


@router.delete("/service-pricing/{pricing_id}")
async def delete_service_pricing(pricing_id: str):
    result = await db.service_pricing.delete_one({"_id": pricing_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pricing entry not found")
    return {"message": "Service pricing deleted"}
