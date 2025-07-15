# app/routers/service.py

from fastapi import APIRouter, HTTPException, Query
from uuid import uuid4
from datetime import datetime
from typing import Optional, List
from fastapi.encoders import jsonable_encoder

from app.models.service import (
    ServiceCreate,
    ServiceUpdate,
    ServiceInDB,
    # ... other imports
)
from app.db.mongo import db

router = APIRouter()
service_collection = db["services"]

# ... other collections ...

# ==========================
# 🔹 SERVICE ROUTES
# ==========================

@router.post("/services", response_model=ServiceInDB)
async def create_service(data: ServiceCreate):
    service_dict = jsonable_encoder(data)
    service_dict["_id"] = str(uuid4())
    service_dict["created_at"] = datetime.utcnow()
    service_dict["last_updated_at"] = datetime.utcnow()

    await service_collection.insert_one(service_dict)

    # ✅ FIX: Fetch the newly created document from the DB and return it.
    # This ensures the response contains all fields, correctly formatted.
    created_doc = await service_collection.find_one({"_id": service_dict["_id"]})

    if not created_doc:
        raise HTTPException(status_code=500, detail="Failed to create and retrieve service.")

    # FastAPI will automatically serialize this dictionary into your ServiceInDB response model,
    # correctly handling the "_id" -> "id" alias.
    return created_doc


# --- No changes needed for the other routes, but they are included for context ---

@router.get("/services", response_model=List[ServiceInDB])
async def list_services(task_type_id: Optional[str] = Query(None)):
    query = {"task_type_id": task_type_id} if task_type_id else {}
    cursor = service_collection.find(query)
    services = await cursor.to_list(length=None)
    return [
        ServiceInDB(id=str(doc["_id"]), **{k: v for k, v in doc.items() if k != "_id"})
        for doc in services
    ]


@router.put("/services/{service_id}", response_model=ServiceInDB)
async def update_service(service_id: str, data: ServiceUpdate):
    update_data = jsonable_encoder(data, exclude_unset=True)
    update_data["last_updated_at"] = datetime.utcnow()

    result = await service_collection.find_one_and_update(
        {"_id": service_id},
        {"$set": update_data},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Service not found")
    return ServiceInDB(id=str(result["_id"]), **{k: v for k, v in result.items() if k != "_id"})


@router.delete("/services/{service_id}")
async def delete_service(service_id: str):
    # Your delete logic performs a soft delete, which is good. No changes needed.
    result = await service_collection.update_one(
        {"_id": service_id},
        {"$set": {"is_active": False, "last_updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deactivated"}


# ==========================
# 🔹 SERVICE PRICING ROUTES
# ==========================

@router.post("/service-pricing", response_model=ServicePricingInDB)
async def create_service_pricing(data: ServicePricingCreate):
    pricing_dict = jsonable_encoder(data)
    pricing_dict["_id"] = str(uuid4())
    pricing_dict["created_at"] = datetime.utcnow()

    await service_pricing_collection.insert_one(pricing_dict)
    return ServicePricingInDB(id=pricing_dict["_id"], **data.dict())


@router.get("/service-pricing", response_model=List[ServicePricingInDB])
async def list_service_pricing(
    service_id: Optional[str] = Query(None),
    vehicle_category: Optional[str] = Query(None),
    store_id: Optional[str] = Query(None),
):
    query = {}
    if service_id:
        query["service_id"] = service_id
    if vehicle_category:
        query["vehicle_category"] = vehicle_category
    if store_id:
        query["store_id"] = store_id

    cursor = service_pricing_collection.find(query)
    pricing = await cursor.to_list(length=None)
    return [
        ServicePricingInDB(id=str(doc["_id"]), **{k: v for k, v in doc.items() if k != "_id"})
        for doc in pricing
    ]


@router.get("/service-pricing/{pricing_id}", response_model=ServicePricingInDB)
async def get_service_pricing(pricing_id: str):
    doc = await service_pricing_collection.find_one({"_id": pricing_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Pricing not found")
    return ServicePricingInDB(id=str(doc["_id"]), **{k: v for k, v in doc.items() if k != "_id"})


@router.put("/service-pricing/{pricing_id}", response_model=ServicePricingInDB)
async def update_service_pricing(pricing_id: str, data: ServicePricingUpdate):
    update_data = jsonable_encoder(data, exclude_unset=True)

    result = await service_pricing_collection.find_one_and_update(
        {"_id": pricing_id},
        {"$set": update_data},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Pricing not found")
    return ServicePricingInDB(id=str(result["_id"]), **{k: v for k, v in result.items() if k != "_id"})


@router.delete("/service-pricing/{pricing_id}")
async def delete_service_pricing(pricing_id: str):
    result = await service_pricing_collection.delete_one({"_id": pricing_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pricing not found")
    return {"message": "Pricing deleted"}
