from fastapi import APIRouter, HTTPException
from app.models.vehicle import Vehicle
from pymongo import MongoClient
from uuid import uuid4
from bson import ObjectId
from datetime import datetime

router = APIRouter()
client = MongoClient("mongodb://localhost:27017")
db = client["autocare"]
vehicle_collection = db["vehicles"]

@router.post("/vehicles")
def add_vehicle(vehicle: Vehicle):
    vehicle_dict = vehicle.dict(by_alias=True)
    vehicle_dict["_id"] = str(uuid4())
    vehicle_dict["created_at"] = datetime.utcnow()
    vehicle_dict["updated_at"] = datetime.utcnow()
    vehicle_collection.insert_one(vehicle_dict)
    return {"message": "Vehicle added", "id": vehicle_dict["_id"]}

@router.get("/customers/{customer_id}/vehicles")
def get_vehicles_by_customer(customer_id: str):
    vehicles = list(vehicle_collection.find({"customer_id": customer_id}, {"_id": 0}))
    return vehicles

@router.get("/vehicles/{vehicle_id}")
def get_vehicle(vehicle_id: str):
    vehicle = vehicle_collection.find_one({"_id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@router.put("/vehicles/{vehicle_id}")
def update_vehicle(vehicle_id: str, updated_data: dict):
    result = vehicle_collection.update_one(
        {"_id": vehicle_id},
        {"$set": {**updated_data, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"message": "Vehicle updated"}

@router.delete("/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: str):
    result = vehicle_collection.delete_one({"_id": vehicle_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"message": "Vehicle deleted"}
