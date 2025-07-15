from fastapi import APIRouter, HTTPException
from app.models.customer import Customer
from pymongo import MongoClient
from uuid import uuid4
from bson import ObjectId
from datetime import datetime

router = APIRouter()
client = MongoClient("mongodb://localhost:27017")  # Update as needed
db = client["autocare"]
customer_collection = db["customers"]

@router.post("/customers")
def create_customer(customer: Customer):
    customer_dict = customer.dict(by_alias=True)
    customer_dict["_id"] = str(uuid4())
    customer_dict["created_at"] = datetime.utcnow()
    customer_dict["updated_at"] = datetime.utcnow()
    customer_collection.insert_one(customer_dict)
    return {"message": "Customer created", "id": customer_dict["_id"]}

@router.get("/customers")
def list_customers():
    customers = list(customer_collection.find({}, {"_id": 0}))
    return customers

@router.get("/customers/{customer_id}")
def get_customer(customer_id: str):
    customer = customer_collection.find_one({"_id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/customers/{customer_id}")
def update_customer(customer_id: str, updated_data: dict):
    result = customer_collection.update_one(
        {"_id": customer_id},
        {"$set": {**updated_data, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer updated"}

@router.delete("/customers/{customer_id}")
def delete_customer(customer_id: str):
    result = customer_collection.update_one(
        {"_id": customer_id},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deactivated"}
