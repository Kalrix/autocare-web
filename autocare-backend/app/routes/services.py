from fastapi import APIRouter, HTTPException
from app.db.mongo import db
from app.models.service import ServiceCreate, ServiceUpdate, ServiceInDB
from uuid import uuid4
from datetime import datetime
from typing import List

router = APIRouter()


@router.post("/services", response_model=ServiceInDB)
async def create_service(data: ServiceCreate):
    service = data.model_dump()
    service["_id"] = str(uuid4())
    service["created_at"] = datetime.utcnow()
    await db.services.insert_one(service)
    return ServiceInDB(**service)


@router.get("/services", response_model=List[ServiceInDB])
async def get_all_services():
    services = await db.services.find().to_list(None)
    return [ServiceInDB(**s) for s in services]


@router.patch("/services/{service_id}", response_model=ServiceInDB)
async def update_service(service_id: str, data: ServiceUpdate):
    update_data = data.model_dump(exclude_unset=True)
    result = await db.services.find_one_and_update(
        {"_id": service_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Service not found")
    return ServiceInDB(**result)


@router.delete("/services/{service_id}")
async def delete_service(service_id: str):
    result = await db.services.delete_one({"_id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted"}
