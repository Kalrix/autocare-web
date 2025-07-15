from fastapi import APIRouter, HTTPException
from app.models.vehicle import Vehicle
from app.db.mongo import db  # ✅ use async db from motor
from uuid import uuid4
from datetime import datetime

router = APIRouter()
vehicle_collection = db["vehicles"]

@router.post("/vehicles")
async def add_vehicle(vehicle: Vehicle):
    vehicle_dict = vehicle.dict(by_alias=True)
    vehicle_dict["id"] = str(uuid4())
    vehicle_dict["created_at"] = datetime.utcnow()
    vehicle_dict["updated_at"] = datetime.utcnow()

    await vehicle_collection.insert_one(vehicle_dict)
    return {"message": "Vehicle added", "id": vehicle_dict["id"]}

@router.get("/customers/{customer_id}/vehicles")
async def get_vehicles_by_customer(customer_id: str):
    vehicles_cursor = vehicle_collection.find({"customer_id": customer_id})

    vehicles = []
    async for v in vehicles_cursor:
        v["id"] = v.get("id") or str(v["_id"])
        v.pop("_id", None)
        vehicles.append(v)

    return vehicles

@router.get("/vehicles/{vehicle_id}")
async def get_vehicle(vehicle_id: str):
    vehicle = await vehicle_collection.find_one({"id": vehicle_id})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    vehicle["id"] = vehicle.get("id") or str(vehicle["_id"])
    vehicle.pop("_id", None)
    return vehicle

@router.put("/vehicles/{vehicle_id}")
async def update_vehicle(vehicle_id: str, updated_data: dict):
    updated_data["updated_at"] = datetime.utcnow()
    result = await vehicle_collection.update_one(
        {"id": vehicle_id},
        {"$set": updated_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"message": "Vehicle updated"}

@router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(vehicle_id: str):
    result = await vehicle_collection.delete_one({"id": vehicle_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"message": "Vehicle deleted"}
