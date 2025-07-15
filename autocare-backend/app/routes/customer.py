from fastapi import APIRouter, HTTPException, Body
from app.models.customer import Customer
from app.db.mongo import db
from uuid import uuid4
from datetime import datetime

router = APIRouter()
customer_collection = db["customers"]

@router.post("/customers")
async def create_customer(customer: Customer):
    customer_dict = customer.dict(by_alias=True)
    customer_dict["id"] = str(uuid4())
    customer_dict["created_at"] = datetime.utcnow()
    customer_dict["updated_at"] = datetime.utcnow()
    await customer_collection.insert_one(customer_dict)
    return {"message": "Customer created", "id": customer_dict["id"]}

@router.get("/customers")
async def list_customers():
    customers_cursor = customer_collection.find({})
    customers = []
    async for doc in customers_cursor:
        doc["id"] = doc.get("id") or str(doc["_id"])
        doc.pop("_id", None)
        customers.append(doc)
    return customers

@router.get("/customers/{customer_id}")
async def get_customer(customer_id: str):
    customer = await customer_collection.find_one({"id": customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    customer["id"] = customer.get("id") or str(customer["_id"])
    customer.pop("_id", None)
    return customer

@router.put("/customers/{customer_id}")
async def update_customer(customer_id: str, updated_data: dict = Body(...)):
    result = await customer_collection.update_one(
        {"id": customer_id},
        {"$set": {**updated_data, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer updated"}

@router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str):
    result = await customer_collection.update_one(
        {"id": customer_id},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deactivated"}
