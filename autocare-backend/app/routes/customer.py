from fastapi import APIRouter, HTTPException, Body, Request
from app.models.customer import Customer, CustomerCreate
from app.db.mongo import db
from uuid import uuid4
from datetime import datetime

router = APIRouter()
customer_collection = db["customers"]

@router.post("/customers")
async def create_customer(request: Request):
    payload = await request.json()

    # 🧼 Clean optional email (prevent Pydantic EmailStr "" error)
    if payload.get("email") == "":
        payload["email"] = None

    customer = CustomerCreate(**payload)
    customer_dict = customer.dict()
    customer_dict["id"] = str(uuid4())
    customer_dict["created_at"] = datetime.utcnow()
    customer_dict["updated_at"] = datetime.utcnow()
    customer_dict["is_active"] = True

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
    if updated_data.get("email") == "":
        updated_data["email"] = None
    updated_data["updated_at"] = datetime.utcnow()

    result = await customer_collection.update_one(
        {"id": customer_id},
        {"$set": updated_data}
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
